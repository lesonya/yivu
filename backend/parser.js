const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');

function extractPdfText(pdfFilePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", err => reject(err));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      const allLines = [];
      for (let p = 0; p < pdfData.Pages.length; p++) {
        const page = pdfData.Pages[p];
        if (!page.Texts || page.Texts.length === 0) continue;

        // Visual coordinate sorting: top-to-bottom (Y), left-to-right (X)
        const sorted = [...page.Texts].sort((a, b) => {
          if (Math.abs(a.y - b.y) < 0.35) return a.x - b.x;
          return a.y - b.y;
        });

        let currentLine = [];
        let currentY = -1;

        for (const t of sorted) {
          let text = '';
          try {
            text = decodeURIComponent(t.R[0].T);
          } catch (e) {
            try { text = unescape(t.R[0].T); } catch (e2) { text = t.R[0].T; }
          }
          if (currentY === -1 || Math.abs(t.y - currentY) < 0.35) {
            currentLine.push(text);
            currentY = t.y;
          } else {
            allLines.push(currentLine.join(' '));
            currentLine = [text];
            currentY = t.y;
          }
        }
        if (currentLine.length > 0) allLines.push(currentLine.join(' '));
        allLines.push(`----------------Page (${p}) Break----------------`);
      }
      resolve(allLines.join('\n'));
    });
    pdfParser.loadPDF(pdfFilePath);
  });
}

async function extractDocxText(docxFilePath) {
  const result = await mammoth.extractRawText({ path: docxFilePath });
  return result.value;
}

function sanitizeText(str) {
  if (!str) return '';
  let cleaned = str.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

  // Multi-space word separation with intra-word single space collapse
  if (/\s{2,}/.test(cleaned)) {
    const words = cleaned.split(/\s{2,}/);
    cleaned = words.map(w => {
      let prev = '';
      let curr = w.trim();
      while (prev !== curr) {
        prev = curr;
        curr = curr.replace(/([a-zA-Z0-9])\s+([a-zA-Z0-9])/g, '$1$2');
      }
      return curr;
    }).filter(w => w.length > 0).join(' ');
  }

  let prev = '';
  while (prev !== cleaned) {
    prev = cleaned;
    cleaned = cleaned.replace(/\b([a-zA-Z])\s+([a-zA-Z])\b/g, '$1$2');
  }

  cleaned = cleaned.replace(/\b([a-zA-Z]{3,})\s+([sdt])\b/gi, '$1$2');
  cleaned = cleaned.replace(/\b([a-zA-Z]{3,})\s+(ed|ly|es|er|en|th)\b/gi, '$1$2');
  cleaned = cleaned.replace(/\b([a-zA-Z]{3,})\s+(ing|tion|ment|ness|able|ible)\b/gi, '$1$2');

  cleaned = cleaned.replace(/[ \t]+/g, ' ').trim();

  // Convert mathematical formulas to LaTeX
  cleaned = cleaned
    .replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')
    .replace(/(\d+)\s*(?:°|degrees)/gi, '$1^\\circ')
    .replace(/sqrt\(([^)]+)\)/gi, '\\sqrt{$1}');

  return cleaned;
}

function parseMarkingScheme(text) {
  const map = {};
  if (!text) return map;
  const lines = text.split(/\r?\n/).map(l => sanitizeText(l)).filter(l => l.length > 0);

  for (const line of lines) {
    const m = line.match(/^(\d+[a-z]?)\s*[\.\)]\s*(.*?)(?:\s+\d+)?$/i);
    if (m) {
      const qKey = m[1].toLowerCase();
      let ans = m[2].trim().replace(/\s+\d+\s*$/, '').trim();
      if (ans.length > 0 && !map[qKey]) {
        map[qKey] = ans;
      }
    }
  }
  return map;
}

function parseQuestionsFromText(text, meta = {}, markingKeyMap = {}) {
  const lines = text
    .split(/\r?\n/)
    .map(l => sanitizeText(l))
    .filter(l => l.length > 0 && !l.startsWith('Page (') && !l.includes('DO NOT TURN') && !l.includes('CONTAINS') && !l.includes('BEC 20'));

  const questions = [];
  const seenQ = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const qMatch = line.match(/^(\d+)([a-z]?(?:\.[i|v|x]+)?)[\.\)]\s*(.*)/i);
    if (!qMatch) continue;

    const parentNum = qMatch[1];
    const subSuffix = qMatch[2] ? qMatch[2].toLowerCase() : '';
    const qFull = parentNum + subSuffix;

    if (parseInt(parentNum, 10) <= 6 && (line.includes('Answer all') || line.includes('Read each') || line.includes('All your answers') || line.includes('Where you have') || line.includes('Do not spend') || line.includes('finished the test') || line.includes('show your working') || line.includes('spaces provided'))) {
      continue;
    }

    if (seenQ.has(qFull)) continue;

    let prompt = qMatch[3];
    let marks = 1;
    const marksMatch = line.match(/\[(\d+)\s*Marks?\]|\((\d+)\s*Marks?\)/i) || line.match(/\((\d+)\)$/);
    if (marksMatch) {
      marks = parseInt(marksMatch[1] || marksMatch[2] || marksMatch[3] || '1', 10);
      prompt = prompt.replace(/\s*\[?\(\d+\s*Marks?\)\]?\s*$/i, '').trim();
    }

    let options = [];
    let questionType = 'SHORT_ANSWER';

    // Check bracketed options e.g. "(Those, This, These)"
    const bracketMatch = line.match(/\(([^)]+)\)/);
    if (bracketMatch && bracketMatch[1].includes(',')) {
      const parts = bracketMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (parts.length >= 2) {
        options = parts;
        questionType = 'MCQ';
        prompt = line.replace(/^\d+[a-z]?[\.\)]\s*/, '').replace(/\s*\(\d+\)\s*$/, '').trim();
      }
    }

    // Check multiple choice options in following lines (A, B, C, D)
    if (options.length === 0) {
      for (let j = i + 1; j < Math.min(i + 14, lines.length); j++) {
        const nextLine = lines[j];
        if (nextLine.match(/^\d+[a-z]?[\.\)]/i)) break;
        const optMatch = nextLine.match(/^([A-D])[\.\)]\s*(.*)/i);
        if (optMatch) {
          options.push(optMatch[2].trim() || optMatch[0].trim());
        }
      }
      if (options.length >= 2) {
        questionType = 'MCQ';
      }
    }

    if (options.length === 0) {
      if (prompt.toLowerCase().includes('true or false')) {
        questionType = 'TRUE_FALSE';
        options = ['True', 'False'];
      } else if (prompt.toLowerCase().includes('write a story') || prompt.toLowerCase().includes('composition') || marks >= 5) {
        questionType = 'ESSAY';
      } else if (prompt.toLowerCase().includes('match the following') || prompt.toLowerCase().includes('match column')) {
        questionType = 'MATCHING';
      }
    }

    // Diagram detection
    const promptLower = prompt.toLowerCase();
    const hasDiagram = promptLower.includes('diagram') || promptLower.includes('shape below') || promptLower.includes('figure') || promptLower.includes('shown below') || promptLower.includes('picture') || promptLower.includes('chart') || promptLower.includes('graph');
    
    let diagramFilename = null;
    let diagramDescription = null;
    if (hasDiagram) {
      diagramFilename = `extracted_images/${meta.gradeKey || 'std_5'}_${meta.year || 2026}_${meta.subjectId || 'std_math'}_q${qFull}.png`;
      diagramDescription = `Curriculum examination diagram illustrating Question ${qFull}.`;
    }

    let correctAnswer = null;
    let correctIndex = 0;
    const gradingCriteria = [];

    const schemeAns = markingKeyMap[qFull.toLowerCase()] || markingKeyMap[parentNum];
    if (schemeAns) {
      correctAnswer = schemeAns;
      gradingCriteria.push(`Official Marking Scheme: ${schemeAns}`);
      if (questionType === 'MCQ' && options.length > 0) {
        const letterIndex = ['a', 'b', 'c', 'd'].indexOf(schemeAns.toLowerCase().trim());
        if (letterIndex >= 0 && letterIndex < options.length) {
          correctIndex = letterIndex;
        } else {
          const textIdx = options.findIndex(opt => opt.toLowerCase() === schemeAns.toLowerCase());
          if (textIdx >= 0) correctIndex = textIdx;
        }
      }
    } else {
      correctAnswer = options.length > 0 ? options[0] : `Correct syllabus solution for Q${qFull}`;
      gradingCriteria.push(`Award ${marks} mark(s) for demonstrating required syllabus competence.`);
    }

    if (prompt.length >= 5) {
      seenQ.add(qFull);
      questions.push({
        id: `q_${meta.paperId || 'paper'}_${qFull}`,
        question_number: qFull,
        parent_question_number: parentNum,
        question_type: questionType,
        prompt: prompt,
        marks: marks,
        options: options,
        correct_index: correctIndex,
        explanation: `${meta.subject || 'Curriculum'}: ${gradingCriteria[0]}`,
        has_diagram: hasDiagram,
        diagram_filename: diagramFilename,
        diagram_description: diagramDescription,
        confidence: 'HIGH',
        marking_scheme: {
          source_marking_file_path: meta.markingFilePath || null,
          correct_answer: correctAnswer,
          grading_criteria: gradingCriteria,
          has_solution_diagram: false,
          solution_diagram_filename: null
        }
      });
    }
  }

  // Sort questions naturally by question number (Q1, Q2, ..., Q50)
  questions.sort((a, b) => {
    const numA = parseInt(a.question_number, 10);
    const numB = parseInt(b.question_number, 10);
    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
      return numA - numB;
    }
    return (a.question_number || '').localeCompare(b.question_number || '', undefined, { numeric: true });
  });

  return questions;
}

module.exports = {
  extractPdfText,
  extractDocxText,
  sanitizeText,
  parseMarkingScheme,
  parseQuestionsFromText
};

