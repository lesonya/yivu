const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const baseDir = path.resolve(__dirname, '../resources/past-papers-1');

function getAllPdfFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllPdfFiles(fullPath));
    } else if (file.toLowerCase().endsWith('.pdf')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getAllPdfFiles(baseDir);
console.log(`Found ${files.length} PDF files.`);

files.slice(0, 15).forEach(f => {
  console.log(path.relative(baseDir, f));
});
