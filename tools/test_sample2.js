const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const sampleFile = path.resolve(__dirname, '../resources/past-papers-1/_CULTURAL STUDIES STD 4-QUESTIONS AND ANSWERS4.pdf');

async function testSample() {
  const dataBuffer = fs.readFileSync(sampleFile);
  const parser = new PDFParse(dataBuffer);
  const data = await parser.text();
  console.log("Text preview:\n", data.slice(0, 1500));
}

testSample().catch(console.error);
