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

function parseMathQuestions(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  
  // Look for patterns like "1", "2." or questions followed by options A, B, C, D
  let currentQ = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line starts with a number like "1", "1.", "1)" or "Question 1"
    const qMatch = line.match(/^(\d+)[\.\)]\s*(.*)/) || line.match(/^Question\s+(\d+)[\:\.]?\s*(.*)/i);
    if (qMatch && parseInt(qMatch[1]) < 60) {
      if (currentQ && currentQ.options.length >= 2) {
        questions.push(currentQ);
      }
      currentQ = {
        num: parseInt(qMatch[1]),
        prompt: qMatch[2] || '',
        options: []
      };
      continue;
    }

    if (currentQ) {
      // Check for Option A, B, C, D
      const optMatch = line.match(/^([A-D])[\.\)]\s*(.*)/i);
      if (optMatch) {
        currentQ.options.push(optMatch[2] || optMatch[0]);
      } else if (currentQ.options.length === 0) {
        // Still part of the question prompt
        if (!line.includes('Page') && !line.includes('BEC') && !line.includes('TURN OVER')) {
          currentQ.prompt += ' ' + line;
        }
      }
    }
  }

  if (currentQ && currentQ.options.length >= 2) {
    questions.push(currentQ);
  }

  return questions;
}

const mathPdf = path.resolve(__dirname, '../resources/past-papers-1/2021 STD IV/MATHEMATICS/2021 Standard 4 Mathematics.pdf');

extractPdfText(mathPdf).then(text => {
  const qs = parseMathQuestions(text);
  console.log(`Parsed ${qs.length} questions from 2021 Standard 4 Mathematics:`);
  console.log(JSON.stringify(qs.slice(0, 3), null, 2));
}).catch(console.error);

