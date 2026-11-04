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

const sample2 = path.resolve(__dirname, '../resources/past-papers-1/2021 STD IV/MATHEMATICS/2021 Standard 4 Mathematics.pdf');

extractPdfText(sample2).then(text => {
  console.log("SUCCESS Math 2021! Extracted length:", text.length);
  console.log("Preview:\n", text.slice(0, 1200));
}).catch(console.error);
