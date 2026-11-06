const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { db } = require('../backend/database.js');

async function runMasterCurriculumAudit() {
  console.log('=================================================================================');
  console.log('               YIVU MASTER COMPREHENSIVE CURRICULUM AUDIT REPORT                 ');
  console.log('=================================================================================\n');

  const papers = db.prepare('SELECT * FROM exam_papers ORDER BY grade_key, subject_id, title').all();
  const allQuestions = db.prepare('SELECT * FROM questions ORDER BY paper_id, CAST(question_number AS INTEGER) ASC').all();

  const report = {
    pdfFiles: { valid: 0, missingOnDisk: [], corrupted: [] },
    diagrams: { flaggedCount: 0, presentOnDisk: 0, missingOnDisk: [] },
    duplicates: { duplicatePapers: [], duplicateQuestions: [] },
    curriculumCoverage: {
      byGrade: {},
      emptyGrades: [],
      targetCandidateYearsMissing: []
    },
    curriculumClassification: {
      cbtExamsCount: 0,
      theoryPapersCount: 0,
      studyNotesCount: 0,
      papersNeedingReclassification: []
    },
    questionTypes: {
      mcq: 0,
      shortAnswer: 0,
      fillInBlank: 0,
      longAnswer: 0
    },
    questionIntegrity: {
      startsAtQ1: 0,
      brokenStartSequence: [],
      emptyPrompts: [],
      collapsedPrompts: []
    },
    optionsIntegrity: {
      fourCompleteOptions: 0,
      twoToThreeOptions: 0,
      fiveOrMoreOptions: 0,
      emptyOrMissingOptions: [],
      placeholderLabelsOnly: [] // e.g. ["A.", "B.", "C.", "D."]
    },
    markingSchemeIntegrity: {
      verifiedFromOfficialScheme: 0,
      defaultOrUnverified: 0,
      papersNeedingOfficialScheme: []
    }
  };

  // 1. PDF File Health & Duplicate File Detection
  const fileHashMap = new Map();
  for (const p of papers) {
    let filePath = p.source_file;
    if (filePath && !fs.existsSync(filePath)) {
      filePath = path.join('resources/past-papers-1', p.source_file.replace(/\\\\/g, '/'));
    }

    if (!filePath || !fs.existsSync(filePath)) {
      report.pdfFiles.missingOnDisk.push({ paperId: p.id, title: p.title, file: p.source_file });
    } else {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          report.pdfFiles.valid++;
          const fileBuffer = fs.readFileSync(filePath);
          const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
          if (fileHashMap.has(hash)) {
            report.duplicates.duplicatePapers.push({
              original: fileHashMap.get(hash).title,
              duplicate: p.title,
              file: p.source_file
            });
          } else {
            fileHashMap.set(hash, p);
          }
        } else {
          report.pdfFiles.corrupted.push({ paperId: p.id, title: p.title, file: p.source_file });
        }
      } catch (e) {
        report.pdfFiles.corrupted.push({ paperId: p.id, title: p.title, file: p.source_file, error: e.message });
      }
    }
  }

  // 2. Grade & Curriculum Coverage Matrix
  const allBotswanaGrades = [
    'std_1', 'std_2', 'std_3', 'std_4', 'std_5', 'std_6', 'std_7',
    'form_1', 'form_2', 'form_3'
  ];

  for (const g of allBotswanaGrades) {
    report.curriculumCoverage.byGrade[g] = { papersCount: 0, questionsCount: 0, subjects: new Set() };
  }

  for (const p of papers) {
    if (!report.curriculumCoverage.byGrade[p.grade_key]) {
      report.curriculumCoverage.byGrade[p.grade_key] = { papersCount: 0, questionsCount: 0, subjects: new Set() };
    }
    report.curriculumCoverage.byGrade[p.grade_key].papersCount++;
    report.curriculumCoverage.byGrade[p.grade_key].subjects.add(p.subject_id);
  }

  for (const g of allBotswanaGrades) {
    if (report.curriculumCoverage.byGrade[g].papersCount === 0) {
      report.curriculumCoverage.emptyGrades.push(g);
      if (g === 'std_7' || g === 'form_3') {
        report.curriculumCoverage.targetCandidateYearsMissing.push(g === 'std_7' ? 'Standard 7 (PSLE)' : 'Form 3 (JCE)');
      }
    }
  }

  // Group questions by paper_id
  const questionsByPaper = new Map();
  for (const q of allQuestions) {
    if (!questionsByPaper.has(q.paper_id)) {
      questionsByPaper.set(q.paper_id, []);
    }
    questionsByPaper.get(q.paper_id).push(q);
  }

  // 3. Question Integrity, Diagrams, Options & Answers, and Curriculum Classification
  for (const p of papers) {
    const qs = questionsByPaper.get(p.id) || [];
    if (report.curriculumCoverage.byGrade[p.grade_key]) {
      report.curriculumCoverage.byGrade[p.grade_key].questionsCount += qs.length;
    }

    // Classification Audit: Evaluate whether paper is CBT_EXAM, THEORY_PAPER, or STUDY_NOTES
    const mcqsInPaper = qs.filter(q => {
      let opts = [];
      try { opts = JSON.parse(q.options_json); } catch(e) {}
      return opts && opts.length >= 2;
    }).length;
    const titleLower = (p.title || '').toLowerCase();
    const isNotesTitle = titleLower.includes('notes') || titleLower.includes('tplan') || titleLower.includes('textbook') || titleLower.includes('composition') || titleLower.includes('scheme') || titleLower.includes('marking') || titleLower.includes('package');

    let expectedType = 'CBT_EXAM';
    if (isNotesTitle || qs.length === 0) {
      expectedType = 'STUDY_NOTES';
      report.curriculumClassification.studyNotesCount++;
    } else if (qs.length > 0 && (mcqsInPaper / qs.length) < 0.50) {
      expectedType = 'THEORY_PAPER';
      report.curriculumClassification.theoryPapersCount++;
    } else {
      report.curriculumClassification.cbtExamsCount++;
    }

    if (p.type !== expectedType) {
      report.curriculumClassification.papersNeedingReclassification.push({
        paperId: p.id,
        title: p.title,
        currentType: p.type || 'UNCLASSIFIED',
        expectedType,
        totalQuestions: qs.length,
        mcqsCount: mcqsInPaper
      });
    }

    if (qs.length === 0) continue;

    // Check Question 1 start and sequences
    const numbers = qs.map(q => parseInt(q.question_number, 10)).filter(n => !isNaN(n));
    if (numbers.length > 0) {
      const minNum = Math.min(...numbers);
      if (minNum !== 1) {
        report.questionIntegrity.brokenStartSequence.push({
          paperId: p.id,
          title: p.title,
          startsAt: minNum,
          total: qs.length
        });
      } else {
        report.questionIntegrity.startsAtQ1++;
      }
    }

    // Check question duplicates within this paper
    const seenPrompts = new Set();
    let paperHasOfficialScheme = false;

    for (const q of qs) {
      // Question Type breakdown
      if (q.question_type === 'MCQ') report.questionTypes.mcq++;
      else if (q.question_type === 'FILL_IN_BLANK') report.questionTypes.fillInBlank++;
      else if (q.question_type === 'LONG_ANSWER') report.questionTypes.longAnswer++;
      else report.questionTypes.shortAnswer++;

      const promptNorm = (q.prompt || '').trim().toLowerCase();
      if (!promptNorm) {
        report.questionIntegrity.emptyPrompts.push({ paperId: p.id, qNum: q.question_number });
      }

      // Check for remaining fused words like "Whatisthe"
      if (/Whatis|Whichthe|Workout|Findthe/i.test(q.prompt)) {
        report.questionIntegrity.collapsedPrompts.push({ paperId: p.id, qNum: q.question_number, prompt: q.prompt });
      }

      if (seenPrompts.has(promptNorm) && promptNorm.length > 15) {
        report.duplicates.duplicateQuestions.push({ paperId: p.id, qNum: q.question_number, prompt: q.prompt });
      } else {
        seenPrompts.add(promptNorm);
      }

      // Check Diagram File on Disk
      if (q.has_diagram) {
        report.diagrams.flaggedCount++;
        const diagPath = path.join('extracted_images', q.diagram_filename || '');
        if (q.diagram_filename && fs.existsSync(diagPath)) {
          report.diagrams.presentOnDisk++;
        } else {
          report.diagrams.missingOnDisk.push({
            paperId: p.id,
            qNum: q.question_number,
            filename: q.diagram_filename || 'NULL'
          });
        }
      }

      // Check Options
      let opts = [];
      try { opts = JSON.parse(q.options_json); } catch(e) {}
      
      if (q.question_type === 'MCQ') {
        if (!opts || opts.length === 0) {
          report.optionsIntegrity.emptyOrMissingOptions.push({ paperId: p.id, qNum: q.question_number });
        } else if (opts.length === 4) {
          const isPlaceholder = opts.every(o => /^[A-D]\.?$/i.test(o.trim()));
          if (isPlaceholder) {
            report.optionsIntegrity.placeholderLabelsOnly.push({ paperId: p.id, qNum: q.question_number });
          } else {
            report.optionsIntegrity.fourCompleteOptions++;
          }
        } else if (opts.length >= 2 && opts.length <= 3) {
          report.optionsIntegrity.twoToThreeOptions++;
        } else {
          report.optionsIntegrity.fiveOrMoreOptions++;
        }
      }

      // Check Marking Scheme & Answers
      let scheme = {};
      try { scheme = JSON.parse(q.marking_scheme_json); } catch(e) {}
      if (scheme && scheme.source_marking_file_path) {
        paperHasOfficialScheme = true;
        report.markingSchemeIntegrity.verifiedFromOfficialScheme++;
      } else if (q.confidence === 'HIGH' && q.correct_index !== null) {
        report.markingSchemeIntegrity.verifiedFromOfficialScheme++;
      } else {
        report.markingSchemeIntegrity.defaultOrUnverified++;
      }
    }

    if (!paperHasOfficialScheme) {
      report.markingSchemeIntegrity.papersNeedingOfficialScheme.push({
        paperId: p.id,
        title: p.title,
        questionsCount: qs.length
      });
    }
  }

  // 4. Print Full Master Audit Report
  console.log('---------------------------------------------------------------------------------');
  console.log('1. PDF & PHYSICAL FILE ATTACHMENTS');
  console.log('---------------------------------------------------------------------------------');
  console.log(`[PASS] Valid & Physically Readable PDFs : ${report.pdfFiles.valid} / ${papers.length}`);
  console.log(`[WARN] Missing PDF Files on Disk         : ${report.pdfFiles.missingOnDisk.length}`);
  console.log(`[FAIL] Corrupted / Zero-byte PDFs        : ${report.pdfFiles.corrupted.length}`);

  console.log('\n---------------------------------------------------------------------------------');
  console.log('2. DIAGRAMS & VISUAL MEDIA INTEGRITY');
  console.log('---------------------------------------------------------------------------------');
  console.log(`Questions Flagged as Requiring Diagrams : ${report.diagrams.flaggedCount}`);
  console.log(`Actual Diagram Images Found on Disk      : ${report.diagrams.presentOnDisk}`);
  console.log(`[ALERT] Missing Diagram Images on Disk   : ${report.diagrams.missingOnDisk.length} (Render as broken images)`);

  console.log('\n---------------------------------------------------------------------------------');
  console.log('3. DUPLICATE CONTENT ANALYSIS');
  console.log('---------------------------------------------------------------------------------');
  console.log(`Duplicate Exam Paper Documents Found    : ${report.duplicates.duplicatePapers.length}`);
  console.log(`Duplicate Questions Inside Same Paper   : ${report.duplicates.duplicateQuestions.length}`);

  console.log('\n---------------------------------------------------------------------------------');
  console.log('4. CURRICULUM COVERAGE (BOTSWANA STANDARDS & FORMS)');
  console.log('---------------------------------------------------------------------------------');
  for (const g of allBotswanaGrades) {
    const data = report.curriculumCoverage.byGrade[g];
    const status = data.papersCount > 0 ? `[OK] ${data.papersCount} Papers (${data.questionsCount} Qs)` : '[EMPTY 0 Papers]';
    console.log(`   ${g.padEnd(8)} : ${status}`);
  }
  console.log(`[CRITICAL] National Exam Candidate Years Missing: ${report.curriculumCoverage.targetCandidateYearsMissing.join(' & ')}`);

  console.log('\n---------------------------------------------------------------------------------');
  console.log('5. CURRICULUM CLASSIFICATION INTEGRITY (CBT vs THEORY vs NOTES)');
  console.log('---------------------------------------------------------------------------------');
  console.log(`Classified Interactive CBT Exam Papers   : ${report.curriculumClassification.cbtExamsCount}`);
  console.log(`Classified Theory / Structured Papers   : ${report.curriculumClassification.theoryPapersCount}`);
  console.log(`Classified Study Notes & Curriculum Docs : ${report.curriculumClassification.studyNotesCount}`);
  console.log(`[ALERT] Papers Needing Reclassification  : ${report.curriculumClassification.papersNeedingReclassification.length}`);
  if (report.curriculumClassification.papersNeedingReclassification.length > 0) {
    report.curriculumClassification.papersNeedingReclassification.slice(0, 5).forEach(m => {
      console.log(`   - [${m.currentType} -> ${m.expectedType}] ${m.title} (MCQs: ${m.mcqsCount}/${m.totalQuestions})`);
    });
  }

  console.log('\n---------------------------------------------------------------------------------');
  console.log('6. QUESTION SEQUENCE & SPACING INTEGRITY');
  console.log('---------------------------------------------------------------------------------');
  console.log(`Papers Starting Correctly at Q1         : ${report.questionIntegrity.startsAtQ1}`);
  console.log(`[ALERT] Papers with Broken Starting Seq : ${report.questionIntegrity.brokenStartSequence.length}`);
  report.questionIntegrity.brokenStartSequence.forEach(b => {
    console.log(`   - [Starts at Q${b.startsAt}] ${b.title} (${b.total} questions)`);
  });
  console.log(`Empty / Missing Prompts                  : ${report.questionIntegrity.emptyPrompts.length}`);
  console.log(`Collapsed / Fused Word Prompts           : ${report.questionIntegrity.collapsedPrompts.length}`);

  console.log('\n---------------------------------------------------------------------------------');
  console.log('7. MULTIPLE CHOICE OPTIONS & INTERACTION ACCURACY');
  console.log('---------------------------------------------------------------------------------');
  console.log(`Total Interactive MCQs                   : ${report.questionTypes.mcq}`);
  console.log(`Total Non-MCQ (Structured / Short Answer): ${report.questionTypes.shortAnswer + report.questionTypes.fillInBlank + report.questionTypes.longAnswer}`);
  console.log(`MCQs with 4 Complete Readable Choices    : ${report.optionsIntegrity.fourCompleteOptions}`);
  console.log(`MCQs with 2-3 Choices (e.g. True/False)  : ${report.optionsIntegrity.twoToThreeOptions}`);
  console.log(`[ALERT] MCQs with Placeholder Labels (A/B): ${report.optionsIntegrity.placeholderLabelsOnly.length}`);
  console.log(`MCQs with Completely Empty Options       : ${report.optionsIntegrity.emptyOrMissingOptions.length}`);

  console.log('\n---------------------------------------------------------------------------------');
  console.log('8. ANSWER KEY & MARKING SCHEME ACCURACY');
  console.log('---------------------------------------------------------------------------------');
  console.log(`Questions with Verified Marking Scheme   : ${report.markingSchemeIntegrity.verifiedFromOfficialScheme}`);
  console.log(`[NOTICE] Papers Missing Marking Scheme   : ${report.markingSchemeIntegrity.papersNeedingOfficialScheme.length} (Need teacher answer upload)`);
  console.log('=================================================================================\n');

  // Save audit artifact to disk
  fs.writeFileSync('./audit_master_report.json', JSON.stringify(report, null, 2));
  console.log('Master audit log saved to: ./audit_master_report.json\n');
  return report;
}

runMasterCurriculumAudit().catch(console.error);
