import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useUserStore } from '../store/useUserStore';
import type { LearningMaterial } from '../core/types/curriculum';
import {
  FileText,
  BookOpen,
  Play,
  Search
} from 'lucide-react';

export const SubjectMaterialsScreen: React.FC = () => {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProfile } = useUserStore();
  const { materials, fetchMaterials, isLoading } = useCurriculumStore();

  const [activeTab, setActiveTab] = useState<'all' | 'exams' | 'revision' | 'notes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [selectedMaterialForNotes, setSelectedMaterialForNotes] = useState<LearningMaterial | null>(null);

  const subject = location.state?.subject || {
    id: subjectId,
    name: 'Mathematics',
    code: 'MATH'
  };

  useEffect(() => {
    fetchMaterials(activeProfile.gradeKey, subjectId);
  }, [activeProfile.gradeKey, subjectId]);

  // Tab Filtering
  const filteredMaterials = materials.filter((m) => {
    // Subject filter
    if (m.subject_id !== subjectId) return false;

    // Search query filter
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Term filter
    if (selectedTerm !== 'all' && m.term !== selectedTerm) {
      return false;
    }

    // Tab Type filter
    const typeUpper = (m.type || '').toUpperCase();
    const titleLower = (m.title || '').toLowerCase();

    if (activeTab === 'exams') {
      return typeUpper.includes('PAST_PAPER') || titleLower.includes('exam') || titleLower.includes('paper');
    }
    if (activeTab === 'revision') {
      return typeUpper.includes('REVISION') || typeUpper.includes('MCQ') || titleLower.includes('practice') || titleLower.includes('revision');
    }
    if (activeTab === 'notes') {
      return Boolean(m.reading_content && m.reading_content.trim().length > 0);
    }

    return true;
  });

  const countForTab = (tab: 'all' | 'exams' | 'revision' | 'notes') => {
    return materials.filter((m) => {
      if (m.subject_id !== subjectId) return false;
      const typeUpper = (m.type || '').toUpperCase();
      const titleLower = (m.title || '').toLowerCase();
      if (tab === 'exams') return typeUpper.includes('PAST_PAPER') || titleLower.includes('exam') || titleLower.includes('paper');
      if (tab === 'revision') return typeUpper.includes('REVISION') || typeUpper.includes('MCQ') || titleLower.includes('practice') || titleLower.includes('revision');
      if (tab === 'notes') return Boolean(m.reading_content && m.reading_content.trim().length > 0);
      return true;
    }).length;
  };

  const handleStartQuiz = async (material: LearningMaterial) => {
    navigate(`/quiz/${material.id}`, { state: { material, subjectName: subject.name } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER BANNER */}
      <div className="bg-surface-navy border border-border-navy p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan bg-brand-cyan/20 px-2.5 py-1 rounded-md border border-brand-cyan/30">
              {activeProfile.gradeKey.toUpperCase().replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Botswana National Curriculum</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">{subject.name}</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Access official past examination papers, syllabus study notes, and test questions.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center space-x-3">
          <div className="bg-dark-navy px-4 py-2.5 rounded-xl border border-border-navy text-center">
            <div className="text-base font-extrabold text-white">{materials.length}</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Materials</div>
          </div>
          <div className="bg-dark-navy px-4 py-2.5 rounded-xl border border-border-navy text-center">
            <div className="text-base font-extrabold text-gold-star">
              {materials.reduce((sum, m) => sum + (m.question_count || 0), 0)}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">CBT Questions</div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & TERM FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 bg-surface-navy p-1.5 rounded-xl border border-border-navy">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'all' ? 'bg-brand-blue text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({countForTab('all')})
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'exams' ? 'bg-brand-blue text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Exam Papers ({countForTab('exams')})
          </button>
          <button
            onClick={() => setActiveTab('revision')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'revision' ? 'bg-brand-blue text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Revision & Practice ({countForTab('revision')})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'notes' ? 'bg-brand-blue text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Notes ({countForTab('notes')})
          </button>
        </div>

        {/* Search Bar & Term Selector */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search paper title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-navy border border-border-navy rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan w-52 sm:w-64"
            />
          </div>

          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="bg-surface-navy border border-border-navy rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan"
          >
            <option value="all">All Terms</option>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>
      </div>

      {/* 3. MATERIALS LIST */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading educational materials...</div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-surface-navy border border-border-navy rounded-2xl p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-white">No materials found matching your criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting your term filter or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-surface-navy border border-border-navy hover:border-brand-cyan/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-blue/20 text-brand-cyan border border-brand-cyan/30">
                    {mat.term || 'Term 1'}
                  </span>
                  <span className="text-xs font-bold text-gold-star bg-gold-star/10 px-2 py-0.5 rounded border border-gold-star/20">
                    {mat.question_count ?? (mat.questions ? mat.questions.length : 0)} Questions
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-brand-cyan transition line-clamp-2">
                  {mat.title}
                </h3>

                <p className="text-[11px] text-slate-400 mt-2 truncate flex items-center space-x-1">
                  <span>📄 Source:</span>
                  <span className="text-slate-300 font-medium">
                    {mat.source_file ? mat.source_file.split('\\').pop() : 'Standard Examination Document'}
                  </span>
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border-navy/60 flex items-center justify-between gap-2">
                {mat.reading_content ? (
                  <button
                    onClick={() => setSelectedMaterialForNotes(mat)}
                    className="flex items-center space-x-1 text-xs font-semibold text-slate-300 hover:text-white bg-dark-navy px-3 py-1.5 rounded-lg border border-border-navy transition active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand-teal" />
                    <span>View Notes</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={() => handleStartQuiz(mat)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-1.5 rounded-lg shadow transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Take Test</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. NOTES MODAL */}
      {selectedMaterialForNotes && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-navy border border-border-navy w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-border-navy flex items-center justify-between bg-dark-navy">
              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{selectedMaterialForNotes.title}</h3>
                <span className="text-[11px] text-brand-cyan font-semibold">Study Notes & Document Details</span>
              </div>
              <button
                onClick={() => setSelectedMaterialForNotes(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200 leading-relaxed font-normal">
              <pre className="whitespace-pre-wrap font-sans bg-dark-navy p-4 rounded-xl border border-border-navy text-slate-300">
                {selectedMaterialForNotes.reading_content}
              </pre>
            </div>

            <div className="p-4 border-t border-border-navy bg-dark-navy flex justify-end">
              <button
                onClick={() => setSelectedMaterialForNotes(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
