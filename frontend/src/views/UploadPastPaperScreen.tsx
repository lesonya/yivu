import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

export const UploadPastPaperScreen: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [markingFile, setMarkingFile] = useState<File | null>(null);
  const [gradeKey, setGradeKey] = useState('std_5');
  const [subjectId, setSubjectId] = useState('std_math');
  const [term, setTerm] = useState('Term 2');
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an exam document (PDF or DOCX)');
      return;
    }

    setIsUploading(true);
    setStatusMessage('Uploading and extracting questions via AI parser...');

    const formData = new FormData();
    formData.append('paper_file', file);
    if (markingFile) formData.append('marking_file', markingFile);
    formData.append('grade_key', gradeKey);
    formData.append('subject_id', subjectId);
    formData.append('term', term);
    if (title) formData.append('title', title);

    try {
      const res = await fetch('http://localhost:5050/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setIsSuccess(true);
      setStatusMessage(`Successfully extracted ${data.extracted_questions_count} questions into the curriculum database!`);
      setTimeout(() => {
        navigate(`/subject/${subjectId}`);
      }, 1500);
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <div className="bg-surface-navy border border-border-navy p-6 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-brand-blue/20 text-brand-cyan rounded-2xl border border-brand-cyan/30">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Upload Past Exam Paper</h1>
            <p className="text-xs text-slate-400">Ingest past paper PDFs or DOCX into CBT questions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Exam Document (PDF or DOCX) *</label>
            <input
              type="file"
              required
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full bg-dark-navy border border-border-navy rounded-xl p-2.5 text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-blue file:text-white file:font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Marking Scheme / Answers (Optional)</label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setMarkingFile(e.target.files ? e.target.files[0] : null)}
              className="w-full bg-dark-navy border border-border-navy rounded-xl p-2.5 text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-surface-navy file:text-slate-300 file:font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Grade Level *</label>
              <select
                value={gradeKey}
                onChange={(e) => setGradeKey(e.target.value)}
                className="w-full bg-dark-navy border border-border-navy rounded-xl p-2.5 text-slate-200"
              >
                <option value="std_5">Standard 5</option>
                <option value="std_4">Standard 4</option>
                <option value="form_1">Form 1</option>
                <option value="form_2">Form 2</option>
                <option value="form_3">Form 3</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Term *</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full bg-dark-navy border border-border-navy rounded-xl p-2.5 text-slate-200"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Subject *</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-dark-navy border border-border-navy rounded-xl p-2.5 text-slate-200"
            >
              <option value="std_math">Mathematics</option>
              <option value="std_english">English</option>
              <option value="std_science">Science</option>
              <option value="std_setswana">Setswana</option>
              <option value="std_social_studies">Social Studies</option>
              <option value="std_capa">Creative & Performing Arts (CAPA)</option>
              <option value="std_agriculture">Agriculture</option>
              <option value="std_rme">Religious & Moral Education</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Custom Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Standard 5 Mathematics Mid-Year Exam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-navy border border-border-navy rounded-xl p-2.5 text-slate-200 placeholder-slate-500"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center space-x-2 text-xs ${
                isSuccess
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition active:scale-95"
            >
              {isUploading ? 'Extracting Questions...' : 'Start Extraction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
