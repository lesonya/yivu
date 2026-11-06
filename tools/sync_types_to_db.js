const fs = require('fs');
const path = require('path');
const { db } = require('../backend/database.js');

const seedPath = path.join(__dirname, '..', 'assets', 'data', 'seed_materials.json');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8')).seed_materials;

try {
  // Add column type to exam_papers if it doesn't exist yet
  try {
    db.prepare('ALTER TABLE exam_papers ADD COLUMN type TEXT').run();
  } catch (e) {
    // Column may already exist
  }

  const updateStmt = db.prepare('UPDATE exam_papers SET type = ? WHERE id = ?');

  let updated = 0;
  for (const m of seed) {
    const res = updateStmt.run(m.material_type || m.type, m.id);
    if (res.changes > 0) updated++;
  }

  console.log(`Successfully synced ${updated} papers with classified type in backend SQLite database.`);
} catch (err) {
  console.error('Error syncing:', err);
}
