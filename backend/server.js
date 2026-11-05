const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const {
  db,
  getAllPapers,
  getPaperById,
  insertPaper,
  insertQuestion,
  updateQuestion,
  deleteQuestion,
  deletePaper,
  clearAllExams,
  clearAllNotes,
  clearAllQuizzes,
  getStats
} = require('./database');

const {
  extractPdfText,
  extractDocxText,
  parseMarkingScheme,
  parseQuestionsFromText,
  extractMetadata
} = require('./parser');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// ================= API ROUTES =================

// 1. Stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. List Papers (with filters)
app.get('/api/papers', (req, res) => {
  try {
    const filters = {
      grade_key: req.query.grade_key,
      subject_id: req.query.subject_id,
      term: req.query.term,
      search: req.query.search
    };
    const papers = getAllPapers(filters);
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Paper by ID (with questions)
app.get('/api/papers/:id', (req, res) => {
  try {
    const paper = getPaperById(req.params.id);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3b. View / Stream Original Source Document File (PDF or DOCX)
app.get('/api/papers/:id/source', (req, res) => {
  try {
    const paper = db.prepare('SELECT source_file, reading_content FROM exam_papers WHERE id = ?').get(req.params.id);
    if (!paper) return res.status(404).send('Paper not found');

    let relPath = paper.source_file;
    if (!relPath && paper.reading_content && paper.reading_content.includes('Source: ')) {
      relPath = paper.reading_content.split('Source: ')[1].trim().split('\n')[0];
    }

    if (!relPath) {
      return res.status(404).send('No source document file recorded for this paper');
    }

    // Candidate locations
    const candidatePaths = [
      path.resolve(__dirname, '../resources/past-papers-1', relPath),
      path.resolve(__dirname, 'uploads', relPath),
      path.resolve(__dirname, 'uploads', path.basename(relPath)),
      path.resolve(__dirname, '../resources/past-papers-1', path.basename(relPath))
    ];

    let foundPath = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      return res.status(404).send(`Source file not found on server disk: ${relPath}`);
    }

    const ext = path.extname(foundPath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    } else if (ext === '.docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(foundPath)}"`);
    }
    res.sendFile(foundPath);
  } catch (err) {
    res.status(500).send('Error retrieving source file: ' + err.message);
  }
});

// 4. Update Paper Metadata
app.put('/api/papers/:id', (req, res) => {
  try {
    const { title, term, grade_key, subject_id, reading_content } = req.body;
    db.prepare(`
      UPDATE exam_papers 
      SET title = coalesce(?, title),
          term = coalesce(?, term),
          grade_key = coalesce(?, grade_key),
          subject_id = coalesce(?, subject_id),
          reading_content = coalesce(?, reading_content),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, term, grade_key, subject_id, reading_content, req.params.id);

    res.json({ success: true, message: 'Paper updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete Paper
app.delete('/api/papers/:id', (req, res) => {
  try {
    deletePaper(req.params.id);
    res.json({ success: true, message: 'Paper and its questions deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update Question
app.put('/api/questions/:id', (req, res) => {
  try {
    updateQuestion(req.params.id, req.body);
    res.json({ success: true, message: 'Question updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Add Question to Paper
app.post('/api/papers/:id/questions', (req, res) => {
  try {
    const q = req.body;
    const newId = `q_${req.params.id}_${Date.now()}`;
    insertQuestion({
      ...q,
      id: newId,
      paper_id: req.params.id
    });
    res.json({ success: true, id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Delete Question
app.delete('/api/questions/:id', (req, res) => {
  try {
    deleteQuestion(req.params.id);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Upload & Parse Exam Paper (+ optional Marking Scheme)
app.post('/api/upload', upload.fields([
  { name: 'paper_file', maxCount: 1 },
  { name: 'marking_file', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.paper_file || req.files.paper_file.length === 0) {
      return res.status(400).json({ error: 'Missing required exam paper document file (PDF or DOCX)' });
    }

    const paperFile = req.files.paper_file[0];
    const markingFile = req.files.marking_file ? req.files.marking_file[0] : null;

    const gradeKey = req.body.grade_key || 'std_5';
    const subjectId = req.body.subject_id || 'std_math';
    const term = req.body.term || 'Term 2';
    const title = req.body.title || path.basename(paperFile.originalname, path.extname(paperFile.originalname));

    // Extract text from paper
    let rawPaperText = '';
    const paperExt = path.extname(paperFile.path).toLowerCase();
    if (paperExt === '.pdf') {
      rawPaperText = await extractPdfText(paperFile.path);
    } else if (paperExt === '.docx') {
      rawPaperText = await extractDocxText(paperFile.path);
    } else {
      return res.status(400).json({ error: 'Unsupported paper format. Only PDF and DOCX supported.' });
    }

    // Extract text from marking scheme if uploaded
    let markingMap = {};
    if (markingFile) {
      const msExt = path.extname(markingFile.path).toLowerCase();
      let msText = '';
      if (msExt === '.pdf') {
        msText = await extractPdfText(markingFile.path);
      } else if (msExt === '.docx') {
        msText = await extractDocxText(markingFile.path);
      }
      markingMap = parseMarkingScheme(msText);
    }

    const paperId = `pp_${gradeKey}_${new Date().getFullYear()}_${subjectId}_${Date.now()}`;
    const meta = {
      paperId,
      gradeKey,
      subjectId,
      year: new Date().getFullYear(),
      term,
      markingFilePath: markingFile ? markingFile.originalname : null
    };

    const questions = parseQuestionsFromText(rawPaperText, meta, markingMap);

    // Save into database
    insertPaper({
      id: paperId,
      grade_key: gradeKey,
      subject_id: subjectId,
      term,
      title,
      type: 'PAST_PAPER_SAMPLE',
      reading_content: `Uploaded Examination Paper: ${title}.\n\nSource: ${paperFile.originalname}`,
      source_file: paperFile.originalname
    });

    for (const q of questions) {
      insertQuestion({
        ...q,
        paper_id: paperId
      });
    }

    res.json({
      success: true,
      paper_id: paperId,
      title,
      extracted_questions_count: questions.length,
      marking_scheme_matched: Object.keys(markingMap).length > 0
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process and parse document: ' + err.message });
  }
});

// 9b. Batch Upload & Ingest Exam Papers (+ optional Marking Schemes)
app.post('/api/upload-batch', upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded. Select one or more exam papers.' });
    }

    const defaultGrade = req.body.default_grade || '';
    const defaultSubject = req.body.default_subject || '';
    const defaultTerm = req.body.default_term || '';

    const markingFiles = [];
    const questionPaperFiles = [];

    // Segregate question papers vs marking schemes based on filename
    for (const f of req.files) {
      const name = f.originalname.toLowerCase();
      if (name.includes('marking') || name.includes('mark_sc') || name.includes('scheme') || name.includes('key') || name.includes('answers')) {
        markingFiles.push(f);
      } else {
        questionPaperFiles.push(f);
      }
    }

    // Pre-parse all marking schemes
    const markingMapByFile = {};
    for (const mf of markingFiles) {
      const ext = path.extname(mf.path).toLowerCase();
      let text = '';
      try {
        if (ext === '.pdf') text = await extractPdfText(mf.path);
        else if (ext === '.docx') text = await extractDocxText(mf.path);
        markingMapByFile[mf.originalname] = parseMarkingScheme(text);
      } catch (err) {
        console.warn(`Could not parse batch marking scheme ${mf.originalname}:`, err.message);
      }
    }

    const results = [];
    let totalQuestionsExtracted = 0;

    for (const pf of questionPaperFiles) {
      const ext = path.extname(pf.path).toLowerCase();
      let rawText = '';
      try {
        if (ext === '.pdf') {
          rawText = await extractPdfText(pf.path);
        } else if (ext === '.docx') {
          rawText = await extractDocxText(pf.path);
        } else {
          results.push({ file: pf.originalname, status: 'SKIPPED', error: 'Unsupported format' });
          continue;
        }
      } catch (err) {
        results.push({ file: pf.originalname, status: 'FAILED', error: err.message });
        continue;
      }

      // Metadata inference with fallback to user defaults
      const autoMeta = extractMetadata(pf.originalname, rawText);
      const gradeKey = (defaultGrade && defaultGrade !== 'auto') ? defaultGrade : autoMeta.gradeKey;
      const subjectId = (defaultSubject && defaultSubject !== 'auto') ? defaultSubject : autoMeta.subjectId;
      const term = (defaultTerm && defaultTerm !== 'auto') ? defaultTerm : autoMeta.termString;
      const title = autoMeta.paperTitle;

      // Find best marking scheme match
      let matchedScheme = null;
      let matchedSchemeName = null;
      const baseName = path.basename(pf.originalname, ext).toLowerCase();
      for (const mf of markingFiles) {
        const msBase = path.basename(mf.originalname, path.extname(mf.originalname)).toLowerCase();
        if (msBase.includes(baseName.slice(0, 8)) || baseName.includes(msBase.slice(0, 8))) {
          matchedScheme = markingMapByFile[mf.originalname] || {};
          matchedSchemeName = mf.originalname;
          break;
        }
      }

      const paperId = `pp_${gradeKey}_${autoMeta.year}_${subjectId}_${pf.originalname.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 30)}_${Date.now()}`;
      const meta = {
        paperId,
        gradeKey,
        subjectId,
        year: autoMeta.year,
        term,
        markingFilePath: matchedSchemeName
      };

      const questions = parseQuestionsFromText(rawText, meta, matchedScheme || {});

      // Insert paper & questions
      insertPaper({
        id: paperId,
        grade_key: gradeKey,
        subject_id: subjectId,
        term,
        title,
        type: 'PAST_PAPER_SAMPLE',
        reading_content: `Uploaded Examination Paper: ${title}.\n\nSource: ${pf.originalname}`,
        source_file: pf.originalname
      });

      for (const q of questions) {
        insertQuestion({
          ...q,
          paper_id: paperId
        });
      }

      totalQuestionsExtracted += questions.length;
      results.push({
        paper_id: paperId,
        file: pf.originalname,
        title,
        grade_key: gradeKey,
        subject_id: subjectId,
        term,
        questions_count: questions.length,
        has_marking_scheme: Boolean(matchedSchemeName),
        status: 'SUCCESS'
      });
    }

    res.json({
      success: true,
      processed_count: questionPaperFiles.length,
      marking_schemes_count: markingFiles.length,
      total_questions: totalQuestionsExtracted,
      results
    });
  } catch (err) {
    console.error('Batch upload error:', err);
    res.status(500).json({ error: 'Batch processing failed: ' + err.message });
  }
});

// Helper: Sync current DB state to Flutter seed_materials.json
function syncDbToSeedMaterials() {
  const papers = db.prepare('SELECT * FROM exam_papers ORDER BY grade_key DESC, title ASC').all();
  const seedMaterials = [];
  let totalQuestions = 0;
  let totalDiagrams = 0;

  for (const p of papers) {
    const questions = db.prepare('SELECT * FROM questions WHERE paper_id = ? ORDER BY rowid ASC').all(p.id);
    totalQuestions += questions.length;
    
    const parsedQuestions = questions.map(q => {
      const hasDiag = Boolean(q.has_diagram);
      if (hasDiag) totalDiagrams++;
      return {
        id: q.id,
        question_number: q.question_number,
        parent_question_number: q.parent_question_number,
        question_type: q.question_type,
        prompt: q.prompt,
        marks: q.marks,
        options: JSON.parse(q.options_json || '[]'),
        correct_index: q.correct_index,
        explanation: q.explanation,
        has_diagram: hasDiag,
        diagram_filename: q.diagram_filename,
        diagram_description: q.diagram_description,
        confidence: q.confidence,
        marking_scheme: q.marking_scheme_json ? JSON.parse(q.marking_scheme_json) : null
      };
    });

    seedMaterials.push({
      id: p.id,
      grade_key: p.grade_key,
      subject_id: p.subject_id,
      term: p.term,
      title: p.title,
      type: p.type,
      reading_content: p.reading_content || '',
      questions: parsedQuestions
    });
  }

  const payload = {
    batch_root: '/resources/past-papers-1',
    audit_log: {
      timestamp: new Date().toISOString(),
      total_files_scanned: papers.length,
      question_papers_processed: papers.length,
      unmatched_marking_schemes: [],
      extraction_warnings: [],
      extracted_images_count: totalDiagrams,
      total_extracted_questions: totalQuestions,
      status: 'SUCCESS'
    },
    seed_materials: seedMaterials
  };

  const targetPath = path.resolve(__dirname, '../assets/data/seed_materials.json');
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), 'utf8');
  return { papersCount: papers.length, questionsCount: totalQuestions };
}

// 10. Sync back to Flutter seed_materials.json
app.post('/api/sync/to-flutter', (req, res) => {
  try {
    const syncRes = syncDbToSeedMaterials();
    res.json({
      success: true,
      message: `Successfully synchronized ${syncRes.papersCount} papers and ${syncRes.questionsCount} questions directly into Flutter seed_materials.json!`,
      papers_count: syncRes.papersCount,
      questions_count: syncRes.questionsCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Clear All Exams
app.post('/api/actions/clear-exams', (req, res) => {
  try {
    const removedCount = clearAllExams();
    const syncRes = syncDbToSeedMaterials();
    res.json({
      success: true,
      message: `Cleared all Exam Papers from frontend! (${removedCount} papers removed, ${syncRes.papersCount} remaining)`,
      remaining_papers: syncRes.papersCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Clear All Notes
app.post('/api/actions/clear-notes', (req, res) => {
  try {
    const updatedCount = clearAllNotes();
    syncDbToSeedMaterials();
    res.json({
      success: true,
      message: `Cleared all Study Notes from frontend! (${updatedCount} documents updated to empty notes)`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Clear All Quizzes
app.post('/api/actions/clear-quizzes', (req, res) => {
  try {
    const removedCount = clearAllQuizzes();
    syncDbToSeedMaterials();
    res.json({
      success: true,
      message: `Cleared all Quizzes from frontend! (${removedCount} questions deleted across all papers)`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Restore Default Data from Backup
app.post('/api/actions/restore-defaults', (req, res) => {
  try {
    const backupPath = path.resolve(__dirname, '../assets/data/seed_materials_backup.json');
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }
    const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Clear and re-populate
    db.exec('BEGIN TRANSACTION;');
    db.prepare('DELETE FROM questions').run();
    db.prepare('DELETE FROM exam_papers').run();

    for (const mat of (data.seed_materials || [])) {
      insertPaper({
        id: mat.id,
        grade_key: mat.grade_key,
        subject_id: mat.subject_id,
        term: mat.term,
        title: mat.title,
        type: mat.type,
        reading_content: mat.reading_content,
        source_file: mat.reading_content ? mat.reading_content.split('Source: ')[1] : ''
      });
      for (const q of (mat.questions || [])) {
        insertQuestion({
          ...q,
          paper_id: mat.id
        });
      }
    }
    db.exec('COMMIT;');
    const syncRes = syncDbToSeedMaterials();
    res.json({
      success: true,
      message: `Restored default materials! (${syncRes.papersCount} papers and ${syncRes.questionsCount} questions synced to frontend)`
    });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 YIVU EXAM PAPERS MANAGEMENT BACKEND RUNNING`);
  console.log(`📡 API & Admin Dashboard URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

