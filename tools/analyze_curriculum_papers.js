const { db } = require('../backend/database.js');

const papers = db.prepare(`SELECT * FROM exam_papers ORDER BY grade_key DESC, title ASC`).all();

const detailedPapers = [];

for (const p of papers) {
  const questions = db.prepare(`SELECT * FROM questions WHERE paper_id = ?`).all(p.id);
  const totalQ = questions.length;
  let mcqCount = 0;
  let shortAnswerCount = 0;

  for (const q of questions) {
    const opts = JSON.parse(q.options_json || '[]');
    if (q.question_type === 'MCQ' && opts.length >= 2) {
      mcqCount++;
    } else {
      shortAnswerCount++;
    }
  }

  const mcqRatio = totalQ > 0 ? (mcqCount / totalQ) : 0;
  const fileName = (p.source_file || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  const readingContent = (p.reading_content || '').toLowerCase();

  // Criteria for STUDY_NOTES:
  // 1. Explicitly named notes, scheme, package, textbook, holiday homework, revision exercise without exam format
  // 2. OR 0 questions extracted (scanned document / pure study text without interactive items)
  // 3. OR contains textbook / scheme of work / revision package keywords
  const isNotesKeyword = 
    fileName.includes('package') ||
    fileName.includes('textbook') ||
    fileName.includes('notes') ||
    fileName.includes('scheme') ||
    fileName.includes('homework') ||
    fileName.includes('revision exercise') ||
    fileName.includes('revision test') ||
    title.includes('package') ||
    title.includes('textbook') ||
    title.includes('notes') ||
    title.includes('homework');

  let proposedType = 'THEORY_PAPER';

  if (totalQ === 0) {
    // Zero questions: this is a study reference / syllabus document
    proposedType = 'STUDY_NOTES';
  } else if (mcqRatio >= 0.5) {
    // 50% or more multiple choice questions -> CBT Examination
    proposedType = 'CBT_EXAM';
  } else if (isNotesKeyword && totalQ <= 5) {
    // Very few concept notes/homework items
    proposedType = 'STUDY_NOTES';
  } else {
    // Structured / short answer past exam paper
    proposedType = 'THEORY_PAPER';
  }

  detailedPapers.push({
    id: p.id,
    title: p.title,
    grade_key: p.grade_key,
    subject_id: p.subject_id,
    term: p.term,
    totalQ,
    mcqCount,
    shortAnswerCount,
    mcqRatio: Math.round(mcqRatio * 100) + '%',
    proposedType,
    fileName: p.source_file
  });
}

// Print breakdown
const proposedCounts = {};
detailedPapers.forEach(p => {
  proposedCounts[p.proposedType] = (proposedCounts[p.proposedType] || 0) + 1;
});

console.log('=== PROPOSED CLASSIFICATION SUMMARY ===');
console.log(proposedCounts);
console.log('\n=== CBT_EXAM PAPERS (' + detailedPapers.filter(p => p.proposedType === 'CBT_EXAM').length + ') ===');
detailedPapers.filter(p => p.proposedType === 'CBT_EXAM').forEach(p => {
  console.log(`[CBT] ${p.title} (${p.mcqCount}/${p.totalQ} MCQs - ${p.mcqRatio})`);
});

console.log('\n=== STUDY_NOTES PAPERS (' + detailedPapers.filter(p => p.proposedType === 'STUDY_NOTES').length + ') ===');
detailedPapers.filter(p => p.proposedType === 'STUDY_NOTES').forEach(p => {
  console.log(`[NOTES] ${p.title} (${p.totalQ} Qs) -> ${p.fileName}`);
});

console.log('\n=== SAMPLE THEORY_PAPER (' + detailedPapers.filter(p => p.proposedType === 'THEORY_PAPER').length + ') ===');
detailedPapers.filter(p => p.proposedType === 'THEORY_PAPER').slice(0, 10).forEach(p => {
  console.log(`[THEORY] ${p.title} (${p.shortAnswerCount}/${p.totalQ} Short Answer - MCQs: ${p.mcqCount})`);
});
