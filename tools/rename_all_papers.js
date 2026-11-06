const fs = require('fs');
const path = require('path');
const { db } = require('../backend/database.js');

const subjectNameMap = {
  'std_math': 'Mathematics',
  'std_english': 'English',
  'std_science': 'Science',
  'std_setswana': 'Setswana',
  'std_social_studies': 'Social Studies',
  'std_capa': 'Creative & Performing Arts (CAPA)',
  'std_agriculture': 'Agriculture',
  'std_rme': 'Religious & Moral Education (RME)',
  'std_cultural_studies': 'Cultural Studies'
};

const papers = db.prepare('SELECT id, title, grade_key, subject_id, term, source_file FROM exam_papers ORDER BY grade_key ASC, subject_id ASC, term ASC, id ASC').all();

// Track base titles count to append Paper 1, Paper 2, etc. when multiples exist in same term
const baseGroups = new Map();

for (const p of papers) {
  const sub = subjectNameMap[p.subject_id] || p.subject_id;
  const std = (p.grade_key || '').replace('std_', '').replace('form_', 'Form ');
  const termNum = (p.term || '').replace(/Term\s*/i, '').trim() || '1';
  const str = (p.title + ' ' + (p.source_file || ''));
  const yearMatch = str.match(/\b(19\d\d|20\d\d)\b/);
  const year = yearMatch ? yearMatch[1] : '2023';

  const baseTitle = `${sub} Std ${std} Term ${termNum}, ${year}`;
  if (!baseGroups.has(baseTitle)) {
    baseGroups.set(baseTitle, []);
  }
  baseGroups.get(baseTitle).push(p);
}

const updateStmt = db.prepare('UPDATE exam_papers SET title = ? WHERE id = ?');

let renamedCount = 0;
const renameLog = [];

for (const [baseTitle, list] of baseGroups.entries()) {
  if (list.length === 1) {
    const p = list[0];
    updateStmt.run(baseTitle, p.id);
    renameLog.push({ id: p.id, oldTitle: p.title, newTitle: baseTitle });
    renamedCount++;
  } else {
    // When multiple distinct papers share the same subject, standard, term, and year,
    // distinguish them as "Paper 1", "Paper 2" or retain the parenthetical subtitle if appropriate.
    list.forEach((p, index) => {
      // E.g. "Mathematics Std 5 Term 2, 2023 (Paper 1)"
      const distinctTitle = `${baseTitle} (Paper ${index + 1})`;
      updateStmt.run(distinctTitle, p.id);
      renameLog.push({ id: p.id, oldTitle: p.title, newTitle: distinctTitle });
      renamedCount++;
    });
  }
}

console.log(`Successfully renamed ${renamedCount} papers in SQLite database!`);

// Synchronize into seed_materials.json
const seedPath = path.resolve(__dirname, '../assets/data/seed_materials.json');
if (fs.existsSync(seedPath)) {
  const seedPayload = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const seedList = seedPayload.seed_materials || [];
  
  const titleMap = new Map(renameLog.map(r => [r.id, r.newTitle]));
  for (const m of seedList) {
    if (titleMap.has(m.id)) {
      m.title = titleMap.get(m.id);
    }
  }
  fs.writeFileSync(seedPath, JSON.stringify(seedPayload, null, 2), 'utf8');
  console.log(`Synchronized all renamed titles into assets/data/seed_materials.json!`);
}

// Print 20 sample results
console.log('\n--- 20 SAMPLE RENAMED PAPERS ---');
renameLog.slice(0, 20).forEach(x => {
  console.log(`[OLD]: ${x.oldTitle}`);
  console.log(`[NEW]: ${x.newTitle}\n`);
});
