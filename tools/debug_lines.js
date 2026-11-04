const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

function extractPdfText(pdfFilePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", () => {
      resolve(pdfParser.getRawTextContent());
    });
    pdfParser.loadPDF(pdfFilePath);
  });
}

const mathPdf = path.resolve(__dirname, '../resources/past-papers-1/2021 STD IV/MATHEMATICS/2021 Standard 4 Mathematics.pdf');

extractPdfText(mathPdf).then(text => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 5);
  console.log("Meaningful lines sample (lines 10-40):");
  lines.slice(10, 40).forEach((l, idx) => console.log(`${idx}: ${l}`));
}).catch(console.error);
