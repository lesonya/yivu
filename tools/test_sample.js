const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const sampleFile = path.resolve(__dirname, '../resources/past-papers-1/_CULTURAL STUDIES STD 4-QUESTIONS AND ANSWERS4.pdf');

async function testSample() {
  const dataBuffer = fs.readFileSync(sampleFile);
  const data = await pdf(dataBuffer);
  console.log("Pages:", data.numpages);
  console.log("Text preview:\n", data.text.slice(0, 1500));
}

testSample().catch(console.error);

