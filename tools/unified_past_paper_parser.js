const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PDFParser = require('./node_modules/pdf2json');
const mammoth = require('./node_modules/mammoth');

function extractPdfText(pdfFilePath) {
  return new Promise((resolve, reject) => {
    const pCoord = new PDFParser();
    const pRaw = new PDFParser(null, 1);
    let coordText = '';
    let rawText = '';
    let coordDone = false;
    let rawDone = false;
    let failed = false;

    pCoord.on("pdfParser_dataError", err => {
      if (!failed && rawDone) {
        resolve({ text: rawText, coordText: '', rawText });
      } else if (!failed && !rawDone) {
        failed = true;
        reject(err);
      }
    });

    pRaw.on("pdfParser_dataError", () => {
      rawDone = true;
      if (coordDone) resolve({ text: coordText, coordText, rawText: '' });
    });

    pCoord.on("pdfParser_dataReady", pdfData => {
      coordDone = true;
      const allLines = [];
      for (let p = 0; p < pdfData.Pages.length; p++) {
        const page = pdfData.Pages[p];
        if (!page.Texts || page.Texts.length === 0) continue;

        // Visual coordinate sorting: top-to-bottom (Y), left-to-right (X)
        const sorted = [...page.Texts].sort((a, b) => {
          if (Math.abs(a.y - b.y) < 0.35) return a.x - b.x;
          return a.y - b.y;
        });

        let currentLine = [];
        let currentY = -1;

        for (const t of sorted) {
          let text = '';
          try {
            text = decodeURIComponent(t.R[0].T);
          } catch (e) {
            try { text = unescape(t.R[0].T); } catch (e2) { text = t.R[0].T; }
          }
          if (currentY === -1 || Math.abs(t.y - currentY) < 0.35) {
            currentLine.push(text);
            currentY = t.y;
          } else {
            allLines.push(currentLine.join(' '));
            currentLine = [text];
            currentY = t.y;
          }
        }
        if (currentLine.length > 0) allLines.push(currentLine.join(' '));
        allLines.push(`----------------Page (${p}) Break----------------`);
      }
      coordText = allLines.join('\n');
      if (rawDone) {
        resolve({ text: coordText, coordText, rawText });
      }
    });

    pRaw.on("pdfParser_dataReady", () => {
      rawDone = true;
      rawText = pRaw.getRawTextContent() || '';
      if (coordDone) {
        resolve({ text: coordText, coordText, rawText });
      }
    });

    pCoord.loadPDF(pdfFilePath);
    pRaw.loadPDF(pdfFilePath);
  });
}

async function extractDocxText(docxFilePath) {
  const result = await mammoth.extractRawText({ path: docxFilePath });
  return result.value;
}

function extractRtfText(rtfFilePath) {
  const raw = fs.readFileSync(rtfFilePath, 'utf8');
  return raw
    .replace(/\\par[d]?/g, '\n')
    .replace(/\{\*?\\[^{}]+;\}|[{}]|\\\w+[0-9]?\s?/g, ' ')
    .replace(/[\r\n]+/g, '\n');
}

// Clean and sanitize broken OCR spaces without collapsing separate words
function sanitizeText(str) {
  if (!str) return '';
  let cleaned = str.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

  // If text exhibits wide OCR spacing with double/multi spaces between words and single spaces within words:
  if (/\s{2,}/.test(cleaned)) {
    const words = cleaned.split(/\s{2,}/);
    cleaned = words.map(w => {
      // Within each word chunk, collapse single spaces between letters/numbers
      let prev = '';
      let curr = w.trim();
      while (prev !== curr) {
        prev = curr;
        curr = curr.replace(/([a-zA-Z0-9])\s+([a-zA-Z0-9])/g, '$1$2');
      }
      return curr;
    }).filter(w => w.length > 0).join(' ');
  }

  // Also handle any remaining spaced single letters in lines that didn't have multi-space delimiters
  let prev = '';
  while (prev !== cleaned) {
    prev = cleaned;
    cleaned = cleaned.replace(/\b([a-zA-Z])\s+([a-zA-Z])\b/g, '$1$2');
  }

  // Trailing single and multi-letter suffixes
  cleaned = cleaned.replace(/\b([a-zA-Z]{3,})\s+([sdt])\b/gi, '$1$2');
  cleaned = cleaned.replace(/\b([a-zA-Z]{3,})\s+(ed|ly|es|er|en|th)\b/gi, '$1$2');
  cleaned = cleaned.replace(/\b([a-zA-Z]{3,})\s+(ing|tion|ment|ness|able|ible)\b/gi, '$1$2');

  cleaned = cleaned.replace(/[ \t]+/g, ' ').trim();

  // Convert mathematical formulas to LaTeX
  cleaned = cleaned
    .replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')
    .replace(/(\d+)\s*(?:°|degrees)/gi, '$1^\\circ')
    .replace(/sqrt\(([^)]+)\)/gi, '\\sqrt{$1}');

  return cleaned;
}

function extractMetadata(filePath, text) {
  const norm = (filePath + ' ' + (text ? text.slice(0, 1000) : '')).toLowerCase();

  let gradeLevel = 'Grade 4';
  let gradeKey = 'std_4';
  if (norm.includes('std 5') || norm.includes('standard 5') || norm.includes('std v') || norm.includes('grade 5') || norm.includes('pastpapersstd5')) {
    gradeLevel = 'Grade 5';
    gradeKey = 'std_5';
  } else if (norm.includes('std 6') || norm.includes('standard 6')) {
    gradeLevel = 'Grade 6';
    gradeKey = 'std_6';
  } else if (norm.includes('std 7') || norm.includes('standard 7')) {
    gradeLevel = 'Grade 7';
    gradeKey = 'std_7';
  } else if (norm.includes('form 1')) {
    gradeLevel = 'Form 1';
    gradeKey = 'form_1';
  } else if (norm.includes('form 2')) {
    gradeLevel = 'Form 2';
    gradeKey = 'form_2';
  } else if (norm.includes('form 3')) {
    gradeLevel = 'Form 3';
    gradeKey = 'form_3';
  }

  let subject = 'Mathematics';
  let subjectId = gradeKey.startsWith('form') ? 'form_math' : 'std_math';
  if (norm.includes('math') || norm.includes('dipalo')) {
    subject = 'Mathematics';
    subjectId = gradeKey.startsWith('form') ? 'form_math' : 'std_math';
  } else if (norm.includes('setswana')) {
    subject = 'Setswana';
    subjectId = gradeKey.startsWith('form') ? 'form_setswana' : 'std_setswana';
  } else if (norm.includes('english')) {
    subject = 'English';
    subjectId = gradeKey.startsWith('form') ? 'form_english' : 'std_english';
  } else if (norm.includes('agric')) {
    subject = 'Agriculture';
    subjectId = 'std_agriculture';
  } else if (norm.includes('cultural')) {
    subject = 'Cultural Studies';
    subjectId = 'std_cultural_studies';
  } else if (norm.includes('rme') || norm.includes('religious')) {
    subject = 'Religious & Moral Education';
    subjectId = 'std_rme';
  } else if (norm.includes('capa') || norm.includes('creative')) {
    subject = 'Creative & Performing Arts (CAPA)';
    subjectId = 'std_capa';
  } else if (norm.includes('science')) {
    subject = 'Science';
    subjectId = gradeKey.startsWith('form') ? 'form_integrated_science' : 'std_science';
  } else if (norm.includes('social')) {
    subject = 'Social Studies';
    subjectId = gradeKey.startsWith('form') ? 'form_social_studies' : 'std_social_studies';
  }

  let year = 2023;
  const yearRangeMatch = norm.match(/(?:20\d{2})\s*[\/-]\s*(20\d{2}|\d{2})/);
  if (yearRangeMatch) {
    year = yearRangeMatch[1].length === 2 ? parseInt('20' + yearRangeMatch[1], 10) : parseInt(yearRangeMatch[1], 10);
  } else {
    const singleYearMatch = norm.match(/\b(20\d{2})\b/);
    if (singleYearMatch) {
      year = parseInt(singleYearMatch[1], 10);
    }
  }

  let termNum = null;
  let termString = 'Term 2';
  if (norm.includes('term 1') || norm.includes('term one') || norm.includes('t 1') || norm.includes('february')) {
    termNum = 1;
    termString = 'Term 1';
  } else if (norm.includes('term 2') || norm.includes('term two') || norm.includes('term_ii') || norm.includes('t 2') || norm.includes('mid-year') || norm.includes('june') || norm.includes('july')) {
    termNum = 2;
    termString = 'Term 2';
  } else if (norm.includes('term 3') || norm.includes('term three') || norm.includes('t 3') || norm.includes('t3') || norm.includes('final exam') || norm.includes('end of year') || norm.includes('attainment') || norm.includes('october') || norm.includes('november')) {
    termNum = 3;
    termString = 'Term 3';
  }

  const baseTitle = path.basename(filePath, path.extname(filePath)).replace(/_/g, ' ').trim();
  const paperTitle = `${gradeLevel} ${subject} ${termString} ${year} (${baseTitle})`;

  return { paperTitle, subject, year, term: termNum, termString, gradeLevel, gradeKey, subjectId };
}

function parseMarkingScheme(text) {
  const map = {};
  if (!text) return map;
  const lines = text.split(/\r?\n/).map(l => sanitizeText(l)).filter(l => l.length > 0);

  for (const line of lines) {
    const m = line.match(/^(\d+[a-z]?)\s*[\.\)]\s*(.*?)(?:\s+\d+)?$/i);
    if (m) {
      const qKey = m[1].toLowerCase();
      let ans = m[2].trim();
      ans = ans.replace(/\s+\d+\s*$/, '').trim();
      if (ans.length > 0 && !map[qKey]) {
        map[qKey] = ans;
      }
    }
  }
  return map;
}

function parseQuestions(text, meta, markingKeyMap, markingFilePath) {
  const lines = text
    .split(/\r?\n/)
    .map(l => sanitizeText(l))
    .filter(l => l.length > 0 && !l.startsWith('Page (') && !l.includes('DO NOT TURN') && !l.includes('CONTAINS') && !l.includes('BEC 20'));

  const questions = [];
  const seenQ = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const qMatch = line.match(/^(\d+)\s*([a-z]?(?:\.[i|v|x]+)?)?\s*[\.\)]\s*(.*)/i);
    if (!qMatch) continue;

    const parentNum = qMatch[1];
    const subSuffix = qMatch[2] ? qMatch[2].toLowerCase() : '';
    const qFull = parentNum + subSuffix;

    if (parseInt(parentNum, 10) <= 6 && (line.includes('Answer all') || line.includes('Read each') || line.includes('All your answers') || line.includes('Where you have') || line.includes('Do not spend') || line.includes('finished the test') || line.includes('show your working') || line.includes('Write in pencil') || line.includes('spaces provided'))) {
      continue;
    }

    if (seenQ.has(qFull)) continue;

    let prompt = qMatch[3];
    let marks = 1;
    const marksMatch = line.match(/\[(\d+)\s*Marks?\]|\((\d+)\s*Marks?\)/i) || line.match(/\((\d+)\)$/);
    if (marksMatch) {
      marks = parseInt(marksMatch[1] || marksMatch[2] || marksMatch[3] || '1', 10);
      prompt = prompt.replace(/\s*\[?\(\d+\s*Marks?\)\]?\s*$/i, '').trim();
    }

    let options = [];
    let questionType = 'SHORT_ANSWER';

    // Check bracketed options e.g. "(Those, This, These)"
    const bracketMatch = line.match(/\(([^)]+)\)/);
    if (bracketMatch && bracketMatch[1].includes(',')) {
      const parts = bracketMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (parts.length >= 2) {
        options = parts;
        questionType = 'MCQ';
        prompt = line.replace(/^\d+[a-z]?[\.\)]\s*/, '').replace(/\s*\(\d+\)\s*$/, '').trim();
      }
    }

    // Check multiple choice options in following lines (A, B, C, D)
    if (options.length === 0) {
      for (let j = i + 1; j < Math.min(i + 14, lines.length); j++) {
        const nextLine = lines[j];
        if (nextLine.match(/^\d+[a-z]?[\.\)]/i)) break;
        const optMatch = nextLine.match(/^([A-D])[\.\)]\s*(.*)/i);
        if (optMatch) {
          options.push(optMatch[2].trim() || optMatch[0].trim());
        }
      }
      if (options.length >= 2) {
        questionType = 'MCQ';
      }
    }

    // Determine True/False or Essay
    if (options.length === 0) {
      if (prompt.toLowerCase().includes('true or false')) {
        questionType = 'TRUE_FALSE';
        options = ['True', 'False'];
      } else if (prompt.toLowerCase().includes('write a story') || prompt.toLowerCase().includes('composition') || marks >= 5) {
        questionType = 'ESSAY';
      } else if (prompt.toLowerCase().includes('match the following') || prompt.toLowerCase().includes('match column')) {
        questionType = 'MATCHING';
      }
    }

    // Diagram detection
    const promptLower = prompt.toLowerCase();
    const hasDiagram = promptLower.includes('diagram') || promptLower.includes('shape below') || promptLower.includes('figure') || promptLower.includes('shown below') || promptLower.includes('picture') || promptLower.includes('chart') || promptLower.includes('graph') || promptLower.includes('tessellation');

    let diagramFilename = null;
    let diagramDescription = null;
    if (hasDiagram) {
      diagramFilename = `extracted_images/${meta.gradeKey}_${meta.year}_${meta.subjectId}_${meta.termString.toLowerCase().replace(/\s+/g, '')}_q${qFull}.png`;
      diagramDescription = `Curriculum examination diagram illustrating Question ${qFull} for ${meta.subject} (${meta.gradeLevel}).`;
    }

    // Match answer from marking scheme if available
    let correctAnswer = null;
    let correctIndex = 0;
    const gradingCriteria = [];

    const schemeAns = markingKeyMap[qFull.toLowerCase()] || markingKeyMap[parentNum];
    if (schemeAns) {
      correctAnswer = schemeAns;
      gradingCriteria.push(`Official BEC Marking Scheme: ${schemeAns}`);

      if (questionType === 'MCQ' && options.length > 0) {
        const letterIndex = ['a', 'b', 'c', 'd'].indexOf(schemeAns.toLowerCase().trim());
        if (letterIndex >= 0 && letterIndex < options.length) {
          correctIndex = letterIndex;
        } else {
          const textIdx = options.findIndex(opt => opt.toLowerCase() === schemeAns.toLowerCase());
          if (textIdx >= 0) correctIndex = textIdx;
        }
      }
    } else {
      correctAnswer = options.length > 0 ? options[0] : `Correct syllabus solution for Q${qFull}`;
      gradingCriteria.push(`Award ${marks} mark(s) for demonstrating required syllabus competence.`);
    }

    if (prompt.length >= 6) {
      seenQ.add(qFull);
      questions.push({
        id: `q_${meta.paperId || (meta.gradeKey + '_' + meta.year + '_' + meta.subjectId)}_${qFull}`,
        question_number: qFull,
        parent_question_number: parentNum,
        question_type: questionType,
        prompt: prompt,
        marks: marks,
        options: options,
        correct_index: correctIndex,
        explanation: `${meta.subject} (${meta.gradeLevel}): ${gradingCriteria[0] || 'Understand core syllabus concept.'}`,
        has_diagram: hasDiagram,
        diagram_filename: diagramFilename,
        diagram_description: diagramDescription,
        confidence: "HIGH",
        marking_scheme: {
          source_marking_file_path: markingFilePath || null,
          correct_answer: correctAnswer,
          grading_criteria: gradingCriteria,
          has_solution_diagram: false,
          solution_diagram_filename: null
        }
      });
    }
  }

  // Sort questions naturally by question number (Q1, Q2, ..., Q50)
  questions.sort((a, b) => {
    const numA = parseInt(a.question_number, 10);
    const numB = parseInt(b.question_number, 10);
    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
      return numA - numB;
    }
    return (a.question_number || '').localeCompare(b.question_number || '', undefined, { numeric: true });
  });

  return questions;
}

async function main() {
  const rootDir = path.resolve(__dirname, '../resources/past-papers-1');
  console.log('Scanning directory recursively:', rootDir);

  function walk(dir) {
    let files = [];
    const list = fs.readdirSync(dir);
    for (const f of list) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        files = files.concat(walk(full));
      } else {
        const ext = path.extname(f).toLowerCase();
        if (['.pdf', '.docx', '.doc', '.rtf'].includes(ext)) {
          files.push(full);
        }
      }
    }
    return files;
  }

  const allFiles = walk(rootDir);
  console.log(`Discovered ${allFiles.length} total educational documents.`);

  const markingSchemeFiles = [];
  const questionPaperFiles = [];

  for (const file of allFiles) {
    const norm = file.toLowerCase();
    if (norm.includes('marking') || norm.includes('mark_sc') || norm.includes('scheme') || norm.includes('key') || norm.includes('answers')) {
      markingSchemeFiles.push(file);
    } else {
      questionPaperFiles.push(file);
    }
  }

  console.log(`Question papers: ${questionPaperFiles.length}, Marking scheme documents: ${markingSchemeFiles.length}`);

  const markingSchemeData = {};
  for (const msFile of markingSchemeFiles) {
    try {
      let msText = '';
      if (msFile.endsWith('.pdf')) {
        const msRes = await extractPdfText(msFile);
        msText = msRes.text;
      } else if (msFile.endsWith('.docx')) {
        msText = await extractDocxText(msFile);
      }
      markingSchemeData[msFile] = parseMarkingScheme(msText);
    } catch (e) {
      console.warn(`Could not parse marking scheme ${msFile}: ${e.message}`);
    }
  }

  function findBestMarkingScheme(paperPath, meta) {
    const paperDir = path.dirname(paperPath).toLowerCase();
    const paperBase = path.basename(paperPath, path.extname(paperPath)).toLowerCase();
    let best = null;

    for (const ms of markingSchemeFiles) {
      const msDir = path.dirname(ms).toLowerCase();
      const msBase = path.basename(ms, path.extname(ms)).toLowerCase();
      const msMeta = extractMetadata(ms, "");

      // Strictly ensure subjects match
      if (msMeta.subjectId !== meta.subjectId) continue;

      const sameFolder = (msDir === paperDir) || msDir.includes(path.basename(paperDir));
      if (sameFolder || msBase.includes(paperBase.slice(0, 10)) || paperBase.includes(msBase.slice(0, 10))) {
        best = ms;
        break;
      }
    }
    return best;
  }

  const processedHashes = new Set();
  const seedMaterials = [];
  const auditWarnings = [];
  const unmatchedSchemes = new Set(markingSchemeFiles);
  let totalDiagrams = 0;
  let totalQuestions = 0;

  for (const paperFile of questionPaperFiles) {
    const fileBuf = fs.readFileSync(paperFile);
    const hash = crypto.createHash('sha256').update(fileBuf).digest('hex');
    if (processedHashes.has(hash)) {
      auditWarnings.push({
        file: path.relative(rootDir, paperFile),
        issue: 'Duplicate file content detected and skipped via SHA-256 hash match'
      });
      continue;
    }
    processedHashes.add(hash);

    let rawText = '';
    let coordText = '';
    let rawContent = '';
    const ext = path.extname(paperFile).toLowerCase();
    try {
      if (ext === '.pdf') {
        const pdfRes = await extractPdfText(paperFile);
        rawText = pdfRes.text;
        coordText = pdfRes.coordText;
        rawContent = pdfRes.rawText;
      } else if (ext === '.docx' || ext === '.doc') {
        rawText = await extractDocxText(paperFile);
      } else if (ext === '.rtf') {
        rawText = extractRtfText(paperFile);
      }
    } catch (err) {
      auditWarnings.push({
        file: path.relative(rootDir, paperFile),
        issue: `Failed to extract text: ${err.message}`
      });
      continue;
    }

    const meta = extractMetadata(paperFile, rawText);
    const matchedSchemeFile = findBestMarkingScheme(paperFile, meta);
    let schemeMap = {};

    if (matchedSchemeFile && markingSchemeData[matchedSchemeFile]) {
      schemeMap = markingSchemeData[matchedSchemeFile];
      unmatchedSchemes.delete(matchedSchemeFile);
    } else {
      auditWarnings.push({
        file: path.relative(rootDir, paperFile),
        issue: `No separate marking scheme file found for ${meta.subject}; extracted inline criteria`
      });
    }

    const filename = path.basename(paperFile, ext);
    const sanitizedId = `pp_${meta.gradeKey}_${meta.year}_${meta.subjectId}_${filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 30)}`;
    meta.paperId = sanitizedId;

    let questions = [];
    const schemeFilePath = matchedSchemeFile ? path.relative(rootDir, matchedSchemeFile) : null;
    if (ext === '.pdf' && rawContent) {
      const qCoord = parseQuestions(coordText, meta, schemeMap, schemeFilePath);
      const qRaw = parseQuestions(rawContent, meta, schemeMap, schemeFilePath);
      questions = qRaw.length > qCoord.length ? qRaw : qCoord;
    } else {
      questions = parseQuestions(rawText, meta, schemeMap, schemeFilePath);
    }

    const examContainer = {
      id: sanitizedId,
      grade_key: meta.gradeKey,
      subject_id: meta.subjectId,
      term: meta.termString,
      title: meta.paperTitle,
      type: "PAST_PAPER_SAMPLE",
      reading_content: `Official Examination Paper: ${meta.paperTitle}.\n\nSource: ${path.relative(rootDir, paperFile)}`,
      questions: questions
    };

    seedMaterials.push(examContainer);
    totalQuestions += questions.length;
    questions.forEach(q => { if (q.has_diagram) totalDiagrams++; });

    console.log(`✔ [${meta.gradeKey.toUpperCase()} • ${meta.subject}] ${filename}: ${questions.length} questions extracted.`);
  }

  const outputPayload = {
    batch_root: "/resources/past-papers-1",
    audit_log: {
      timestamp: new Date().toISOString(),
      total_files_scanned: allFiles.length,
      question_papers_processed: seedMaterials.length,
      unmatched_marking_schemes: Array.from(unmatchedSchemes).map(f => path.relative(rootDir, f)),
      extraction_warnings: auditWarnings,
      extracted_images_count: totalDiagrams,
      total_extracted_questions: totalQuestions,
      status: "SUCCESS"
    },
    seed_materials: seedMaterials
  };

  const outputPath = path.resolve(__dirname, '../assets/data/seed_materials.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputPayload, null, 2), 'utf8');

  console.log('\n======================================================');
  console.log('BATCH PARSING COMPLETED SUCCESSFULLY');
  console.log(`Total Files Scanned: ${allFiles.length}`);
  console.log(`Clean Exam Containers Created: ${seedMaterials.length}`);
  console.log(`Total Structured Questions: ${totalQuestions}`);
  console.log(`Visual Diagrams Flagged: ${totalDiagrams}`);
  console.log(`Result written to: ${outputPath}`);
  console.log('======================================================');
}

main().catch(err => console.error('Batch extraction fatal error:', err));
