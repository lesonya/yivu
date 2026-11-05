const fs = require('fs');
const path = require('path');
const { db, insertPaper, insertQuestion } = require('../database');

async function importExistingSeed() {
  const seedPath = path.resolve(__dirname, '../../assets/data/seed_materials.json');
  if (!fs.existsSync(seedPath)) {
    console.error('Seed file not found at:', seedPath);
    return;
  }

  console.log('Loading existing seed data from:', seedPath);
  const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const materials = data.seed_materials || [];

  console.log(`Found ${materials.length} exam papers to import...`);

  db.exec('BEGIN TRANSACTION;');
  let paperCount = 0;
  let questionCount = 0;

  try {
    for (const mat of materials) {
      insertPaper({
        id: mat.id,
        grade_key: mat.grade_key,
        subject_id: mat.subject_id,
        term: mat.term,
        title: mat.title,
        type: mat.type,
        reading_content: mat.reading_content,
        source_file: mat.reading_content ? mat.reading_content.split('Source: ')[1] : ''
      });
      paperCount++;

      for (const q of (mat.questions || [])) {
        insertQuestion({
          id: q.id,
          paper_id: mat.id,
          question_number: q.question_number || '1',
          parent_question_number: q.parent_question_number || '1',
          question_type: q.question_type || 'SHORT_ANSWER',
          prompt: q.prompt,
          options: q.options || [],
          correct_index: q.correct_index ?? 0,
          marks: q.marks ?? 1,
          explanation: q.explanation || '',
          has_diagram: q.has_diagram,
          diagram_filename: q.diagram_filename,
          diagram_description: q.diagram_description,
          marking_scheme: q.marking_scheme,
          confidence: q.confidence || 'HIGH'
        });
        questionCount++;
      }
    }
    db.exec('COMMIT;');
    console.log(`\nImport completed successfully!`);
    console.log(`Total Exam Papers: ${paperCount}`);
    console.log(`Total Questions: ${questionCount}`);
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('Import failed, rolled back:', err);
  }
}

importExistingSeed();

