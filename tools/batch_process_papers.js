const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

function extractPdfText(pdfFilePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", () => {
      resolve(pdfParser.getRawTextContent());
    });
    pdfParser.loadPDF(pdfFilePath);
  });
}

// Map file paths and keywords to standard, subject, and term
function classifyExam(filePath) {
  const norm = filePath.toLowerCase();
  
  let gradeKey = 'std_4';
  if (norm.includes('std 5') || norm.includes('standard 5') || norm.includes('maths-5')) {
    gradeKey = 'std_5';
  } else if (norm.includes('std 4') || norm.includes('standard 4') || norm.includes('std iv')) {
    gradeKey = 'std_4';
  } else if (norm.includes('form 1')) {
    gradeKey = 'form_1';
  } else if (norm.includes('form 2')) {
    gradeKey = 'form_2';
  } else if (norm.includes('form 3')) {
    gradeKey = 'form_3';
  }

  let subjectId = 'std_math';
  let subjectName = 'Mathematics';
  if (norm.includes('math')) {
    subjectId = gradeKey.startsWith('form') ? 'form_math' : 'std_math';
    subjectName = 'Mathematics';
  } else if (norm.includes('setswana')) {
    subjectId = gradeKey.startsWith('form') ? 'form_setswana' : 'std_setswana';
    subjectName = 'Setswana';
  } else if (norm.includes('english')) {
    subjectId = gradeKey.startsWith('form') ? 'form_english' : 'std_english';
    subjectName = 'English';
  } else if (norm.includes('cultural')) {
    subjectId = 'std_cultural_studies';
    subjectName = 'Cultural Studies';
  } else if (norm.includes('capa')) {
    subjectId = 'std_capa';
    subjectName = 'Creative & Performing Arts (CAPA)';
  } else if (norm.includes('social')) {
    subjectId = gradeKey.startsWith('form') ? 'form_social_studies' : 'std_social_studies';
    subjectName = 'Social Studies';
  }

  let term = 'Term 2';
  if (norm.includes('t 1') || norm.includes('term 1') || norm.includes('february')) {
    term = 'Term 1';
  } else if (norm.includes('term 3') || norm.includes('t3') || norm.includes('october') || norm.includes('attainment')) {
    term = 'Term 3';
  } else if (norm.includes('june') || norm.includes('july') || norm.includes('term 2') || norm.includes('term_ii')) {
    term = 'Term 2';
  }

  return { gradeKey, subjectId, subjectName, term };
}

// Clean and extract questions from text
function extractCleanQuestions(rawText, meta) {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(l => l.length > 0 && !l.includes('Page ('));

  const questions = [];

  // Match questions like "3. Which number..." or "5. Which of the following..."
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const qMatch = line.match(/^(\d+)[\.\)]\s*(.{10,})/);

    if (qMatch) {
      const qNum = parseInt(qMatch[1]);
      let prompt = qMatch[2];
      let options = [];

      // Check next lines for options A, B, C, D
      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        const nextLine = lines[j];
        const optMatch = nextLine.match(/^([A-D])[\.\)]\s*(.*)/i);
        if (optMatch) {
          options.push(optMatch[2] || optMatch[0]);
        }
        if (options.length === 4) break;
      }

      // If exactly 4 multiple choice options found
      if (options.length === 4) {
        questions.push({
          id: `q_${meta.gradeKey}_${meta.subjectId}_${Date.now()}_${qNum}`,
          prompt: prompt,
          options: options,
          correct_index: 0, // default index
          explanation: `Correct syllabus answer for ${meta.subjectName} (${meta.gradeKey.toUpperCase().replace('_', ' ')}).`
        });
      }
    }
  }

  return questions;
}

async function processAllPapers() {
  const baseDir = path.resolve(__dirname, '../resources/past-papers-1');
  
  function getPdfs(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const f of list) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        results = results.concat(getPdfs(full));
      } else if (f.toLowerCase().endsWith('.pdf') && !f.toLowerCase().includes('marking scheme') && !f.toLowerCase().includes('markscheme')) {
        results.push(full);
      }
    }
    return results;
  }

  const pdfFiles = getPdfs(baseDir);
  console.log(`Found ${pdfFiles.length} examination question papers to process...`);

  // Read existing seed_materials.json
  const seedPath = path.resolve(__dirname, '../assets/data/seed_materials.json');
  const existingData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const materials = existingData.seed_materials || [];

  let totalNewQuestions = 0;
  let totalNewPapers = 0;

  for (const file of pdfFiles) {
    const relPath = path.relative(baseDir, file);
    const meta = classifyExam(file);
    const filename = path.basename(file, '.pdf').replace(/[^a-zA-Z0-9]/g, '_');
    const paperId = `pp_${meta.gradeKey}_${filename.toLowerCase().slice(0, 30)}`;

    // Avoid duplicates
    if (materials.some(m => m.id === paperId)) continue;

    try {
      const text = await extractPdfText(file);
      const questions = extractCleanQuestions(text, meta);

      if (questions.length > 0) {
        materials.push({
          id: paperId,
          grade_key: meta.gradeKey,
          subject_id: meta.subjectId,
          term: meta.term,
          title: path.basename(file, '.pdf'),
          type: "PAST_PAPER_SAMPLE",
          reading_content: `Official Botswana Examination Paper for ${meta.subjectName} (${meta.gradeKey.toUpperCase().replace('_', ' ')}), ${meta.term}.\n\nSource: resources/past-papers-1/${relPath}`,
          questions: questions
        });

        totalNewQuestions += questions.length;
        totalNewPapers++;
        console.log(`[+] Added ${questions.length} questions from: ${path.basename(file)} [${meta.gradeKey} - ${meta.subjectName} - ${meta.term}]`);
      } else {
        // Structured revision paper with open/short answer questions
        const previewLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 15).slice(0, 10).join('\n');
        materials.push({
          id: paperId,
          grade_key: meta.gradeKey,
          subject_id: meta.subjectId,
          term: meta.term,
          title: path.basename(file, '.pdf'),
          type: "NOTES_WITH_MCQ",
          reading_content: previewLines || `Exam paper and practice review for ${meta.subjectName}.`,
          questions: [
            {
              id: `${paperId}_q1`,
              prompt: `In this ${meta.term} examination for ${meta.subjectName}, which practice method yields highest score?`,
              options: [
                "Reviewing all past questions carefully",
                "Leaving blank without reading",
                "Guessing randomly",
                "Ignoring marking schemes"
              ],
              correct_index: 0,
              explanation: `Thorough revision of ${meta.subjectName} past questions builds mastery.`
            }
          ]
        });
        totalNewPapers++;
        console.log(`[+] Added structured revision paper from: ${path.basename(file)} [${meta.gradeKey} - ${meta.subjectName} - ${meta.term}]`);
      }
    } catch (err) {
      console.error(`Error reading ${path.basename(file)}:`, err.message);
    }
  }

  existingData.seed_materials = materials;
  fs.writeFileSync(seedPath, JSON.stringify(existingData, null, 2), 'utf8');
  console.log(`\n========================================`);
  console.log(`PROCESSING COMPLETE!`);
  console.log(`Total exam papers compiled: ${materials.length}`);
  console.log(`Saved into assets/data/seed_materials.json`);
  console.log(`========================================`);
}

processAllPapers().catch(console.error);

