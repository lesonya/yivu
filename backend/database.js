const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.resolve(__dirname, 'yivu_papers.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high performance
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS exam_papers (
    id TEXT PRIMARY KEY,
    grade_key TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    term TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'PAST_PAPER_SAMPLE',
    reading_content TEXT,
    source_file TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    paper_id TEXT NOT NULL,
    question_number TEXT,
    parent_question_number TEXT,
    question_type TEXT DEFAULT 'SHORT_ANSWER',
    prompt TEXT NOT NULL,
    options_json TEXT DEFAULT '[]',
    correct_index INTEGER DEFAULT 0,
    marks INTEGER DEFAULT 1,
    explanation TEXT,
    has_diagram INTEGER DEFAULT 0,
    diagram_filename TEXT,
    diagram_description TEXT,
    marking_scheme_json TEXT,
    confidence TEXT DEFAULT 'HIGH',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paper_id) REFERENCES exam_papers(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_papers_grade_sub ON exam_papers(grade_key, subject_id);
  CREATE INDEX IF NOT EXISTS idx_questions_paper ON questions(paper_id);
`);

module.exports = {
  db,

  // Helpers
  getAllPapers(filters = {}) {
    let sql = `
      SELECT p.*, COUNT(q.id) as question_count 
      FROM exam_papers p 
      LEFT JOIN questions q ON p.id = q.paper_id 
    `;
    const conditions = [];
    const params = [];

    if (filters.grade_key) {
      conditions.push('p.grade_key = ?');
      params.push(filters.grade_key);
    }
    if (filters.subject_id) {
      conditions.push('p.subject_id = ?');
      params.push(filters.subject_id);
    }
    if (filters.term) {
      conditions.push('p.term = ?');
      params.push(filters.term);
    }
    if (filters.search) {
      conditions.push('(p.title LIKE ? OR p.reading_content LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Dynamic Ordering
    let orderBy = 'p.grade_key DESC, p.title ASC';
    const sortField = filters.sort_by;
    const sortOrder = (filters.sort_order || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    if (sortField === 'grade') {
      orderBy = `p.grade_key ${sortOrder}, p.title ASC`;
    } else if (sortField === 'subject') {
      orderBy = `p.subject_id ${sortOrder}, p.title ASC`;
    } else if (sortField === 'questions') {
      orderBy = `question_count ${sortOrder}, p.title ASC`;
    } else if (sortField === 'title') {
      orderBy = `p.title ${sortOrder}`;
    } else if (sortField === 'term') {
      orderBy = `p.term ${sortOrder}, p.title ASC`;
    }

    sql += ` GROUP BY p.id ORDER BY ${orderBy}`;
    return db.prepare(sql).all(...params);
  },

  getPaperById(id) {
    const paper = db.prepare('SELECT * FROM exam_papers WHERE id = ?').get(id);
    if (!paper) return null;
    const questions = db.prepare('SELECT * FROM questions WHERE paper_id = ? ORDER BY rowid ASC').all(id);

    // Parse JSON fields
    paper.questions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options_json || '[]'),
      has_diagram: Boolean(q.has_diagram),
      marking_scheme: q.marking_scheme_json ? JSON.parse(q.marking_scheme_json) : null
    }));
    return paper;
  },

  insertPaper(paper) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO exam_papers (id, grade_key, subject_id, term, title, type, reading_content, source_file, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      paper.id,
      paper.grade_key,
      paper.subject_id,
      paper.term || 'Term 1',
      paper.title,
      paper.type || 'PAST_PAPER_SAMPLE',
      paper.reading_content || '',
      paper.source_file || ''
    );
  },

  insertQuestion(q) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO questions (
        id, paper_id, question_number, parent_question_number, question_type,
        prompt, options_json, correct_index, marks, explanation,
        has_diagram, diagram_filename, diagram_description, marking_scheme_json, confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      q.id,
      q.paper_id,
      q.question_number || '1',
      q.parent_question_number || '1',
      q.question_type || 'SHORT_ANSWER',
      q.prompt,
      typeof q.options === 'string' ? q.options : JSON.stringify(q.options || []),
      q.correct_index ?? 0,
      q.marks ?? 1,
      q.explanation || '',
      q.has_diagram ? 1 : 0,
      q.diagram_filename || null,
      q.diagram_description || null,
      typeof q.marking_scheme === 'string' ? q.marking_scheme : (q.marking_scheme ? JSON.stringify(q.marking_scheme) : null),
      q.confidence || 'HIGH'
    );
  },

  updateQuestion(id, updates) {
    const fields = [];
    const params = [];
    for (const [key, val] of Object.entries(updates)) {
      if (key === 'options') {
        fields.push('options_json = ?');
        params.push(JSON.stringify(val));
      } else if (key === 'has_diagram') {
        fields.push('has_diagram = ?');
        params.push(val ? 1 : 0);
      } else if (key === 'marking_scheme') {
        fields.push('marking_scheme_json = ?');
        params.push(val ? JSON.stringify(val) : null);
      } else if (['prompt', 'correct_index', 'marks', 'explanation', 'question_type'].includes(key)) {
        fields.push(`${key} = ?`);
        params.push(val);
      }
    }
    if (fields.length === 0) return;
    params.push(id);
    db.prepare(`UPDATE questions SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  },

  deleteQuestion(id) {
    db.prepare('DELETE FROM questions WHERE id = ?').run(id);
  },

  deletePaper(id) {
    db.prepare('DELETE FROM exam_papers WHERE id = ?').run(id);
  },

  clearAllExams() {
    const res = db.prepare(`DELETE FROM exam_papers WHERE type = 'PAST_PAPER_SAMPLE' OR title LIKE '%exam%' OR title LIKE '%paper%'`).run();
    return res.changes;
  },

  clearAllNotes() {
    const res = db.prepare(`UPDATE exam_papers SET reading_content = ''`).run();
    return res.changes;
  },

  clearAllQuizzes() {
    const res = db.prepare(`DELETE FROM questions`).run();
    return res.changes;
  },

  getStats() {
    const totalPapers = db.prepare('SELECT COUNT(*) as c FROM exam_papers').get().c;
    const totalQuestions = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
    const byGrade = db.prepare('SELECT grade_key, COUNT(*) as count FROM exam_papers GROUP BY grade_key').all();
    const bySubject = db.prepare(`
      SELECT p.subject_id, COUNT(DISTINCT p.id) as paper_count, COUNT(q.id) as question_count 
      FROM exam_papers p 
      LEFT JOIN questions q ON p.id = q.paper_id 
      GROUP BY p.subject_id
    `).all();

    return { totalPapers, totalQuestions, byGrade, bySubject };
  }
};

