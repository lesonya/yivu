const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

function extractPdfText(pdfFilePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });
    pdfParser.loadPDF(pdfFilePath);
  });
}

const sampleFile = path.resolve(__dirname, '../resources/past-papers-1/_CULTURAL STUDIES STD 4-QUESTIONS AND ANSWERS4.pdf');

extractPdfText(sampleFile).then(text => {
  console.log("SUCCESS! Extracted length:", text.length);
  console.log("Preview:\n", text.slice(0, 1000));
}).catch(console.error);

