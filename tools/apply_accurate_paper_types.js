const { db } = require('../backend/database.js');

const papers = db.prepare(`SELECT * FROM exam_papers`).all();

const updateStmt = db.prepare(`UPDATE exam_papers SET type = ? WHERE id = ?`);

let cbtCount = 0;
let theoryCount = 0;
let notesCount = 0;

db.exec('BEGIN TRANSACTION;');

for (const p of papers) {
  const questions = db.prepare(`SELECT * FROM questions WHERE paper_id = ?`).all(p.id);
  const totalQ = questions.length;
  let mcqCount = 0;

  for (const q of questions) {
    const opts = JSON.parse(q.options_json || '[]');
    if (q.question_type === 'MCQ' && opts.length >= 2) {
      mcqCount++;
    }
  }

  const mcqRatio = totalQ > 0 ? (mcqCount / totalQ) : 0;
  const fileName = (p.source_file || '').toLowerCase();
  const title = (p.title || '').toLowerCase();

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

  let assignedType = 'THEORY_PAPER';

  if (totalQ === 0) {
    assignedType = 'STUDY_NOTES';
    notesCount++;
  } else if (mcqRatio >= 0.5) {
    assignedType = 'CBT_EXAM';
    cbtCount++;
  } else if (isNotesKeyword && totalQ <= 5) {
    assignedType = 'STUDY_NOTES';
    notesCount++;
  } else {
    assignedType = 'THEORY_PAPER';
    theoryCount++;
  }

  updateStmt.run(assignedType, p.id);
}

db.exec('COMMIT;');

console.log('Successfully updated all 85 papers in SQLite database:');
console.log(`- CBT_EXAM:    ${cbtCount}`);
console.log(`- THEORY_PAPER: ${theoryCount}`);
console.log(`- STUDY_NOTES:  ${notesCount}`);

// Synchronize into seed_materials.json
const fs = require('fs');
const path = require('path');

const updatedPapers = db.prepare('SELECT * FROM exam_papers ORDER BY grade_key DESC, title ASC').all();
const seedMaterials = [];
let totalQuestions = 0;
let totalDiagrams = 0;

for (const p of updatedPapers) {
  const questions = db.prepare('SELECT * FROM questions WHERE paper_id = ? ORDER BY rowid ASC').all(p.id);
  totalQuestions += questions.length;
  
  const parsedQuestions = questions.map(q => {
    const hasDiag = Boolean(q.has_diagram);
    if (hasDiag) totalDiagrams++;
    return {
      id: q.id,
      question_number: q.question_number,
      parent_question_number: q.parent_question_number,
      question_type: q.question_type,
      prompt: q.prompt,
      marks: q.marks,
      options: JSON.parse(q.options_json || '[]'),
      correct_index: q.correct_index,
      explanation: q.explanation,
      has_diagram: hasDiag,
      diagram_filename: q.diagram_filename,
      diagram_description: q.diagram_description,
      confidence: q.confidence,
      marking_scheme: q.marking_scheme_json ? JSON.parse(q.marking_scheme_json) : null
    };
  });

  seedMaterials.push({
    id: p.id,
    grade_key: p.grade_key,
    subject_id: p.subject_id,
    term: p.term,
    title: p.title,
    type: p.type,
    reading_content: p.reading_content,
    questions: parsedQuestions
  });
}

const payload = {
  version: "1.0.0",
  last_updated: new Date().toISOString(),
  extraction_metadata: {
    processed_papers: updatedPapers.length,
    extracted_images_count: totalDiagrams,
    total_extracted_questions: totalQuestions,
    status: 'SUCCESS'
  },
  seed_materials: seedMaterials
};

const targetPath = path.resolve(__dirname, '../assets/data/seed_materials.json');
fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), 'utf8');
console.log('Successfully synchronized updated paper types into assets/data/seed_materials.json!');
