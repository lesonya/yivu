const { db } = require('../backend/database.js');

const papers = db.prepare('SELECT id, title, grade_key, subject_id, term, source_file FROM exam_papers').all();

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

const previews = papers.map(p => {
  const sub = subjectNameMap[p.subject_id] || p.subject_id;
  const std = (p.grade_key || '').replace('std_', '').replace('form_', 'Form ');
  const termNum = (p.term || '').replace(/Term\s*/i, '').trim() || '1';
  const str = (p.title + ' ' + (p.source_file || ''));
  const yearMatch = str.match(/\b(19\d\d|20\d\d)\b/);
  const year = yearMatch ? yearMatch[1] : '2023';

  const newTitle = `${sub} Std ${std} Term ${termNum}, ${year}`;
  return { id: p.id, oldTitle: p.title, newTitle, year, sub, std, termNum };
});

console.log('Total papers evaluated:', previews.length);
console.log('\n--- 15 SAMPLE PREVIEWS ---');
previews.slice(0, 15).forEach(x => {
  console.log(`[OLD]: ${x.oldTitle}`);
  console.log(`[NEW]: ${x.newTitle}\n`);
});

// Check if any title has duplicate names
const nameCounts = new Map();
previews.forEach(p => {
  nameCounts.set(p.newTitle, (nameCounts.get(p.newTitle) || 0) + 1);
});

const duplicates = [...nameCounts.entries()].filter(([name, count]) => count > 1);
console.log('Duplicate titles across papers count:', duplicates.length);
if (duplicates.length > 0) {
  console.log('Sample duplicates:', duplicates.slice(0, 5));
}
