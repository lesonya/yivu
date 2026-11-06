import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useUserStore } from '../store/useUserStore';
import { Sliders, Play, BookOpen, Layers, Check } from 'lucide-react';

export const CustomTestGeneratorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { activeProfile } = useUserStore();
  const { subjects, materials, fetchMaterials } = useCurriculumStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('std_math');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [onlyMCQ, setOnlyMCQ] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    fetchMaterials(activeProfile.gradeKey, selectedSubjectId);
  }, [activeProfile.gradeKey, selectedSubjectId]);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Gather all questions from materials belonging to this subject
      const subjectMaterials = materials.filter((m) => m.subject_id === selectedSubjectId);
      let poolOfQuestions: any[] = [];

      for (const mat of subjectMaterials) {
        if (selectedTerm !== 'all' && mat.term !== selectedTerm) continue;
        if (mat.questions && mat.questions.length > 0) {
          poolOfQuestions = poolOfQuestions.concat(mat.questions);
        }
      }

      if (onlyMCQ) {
        poolOfQuestions = poolOfQuestions.filter((q) => !q.question_type || q.question_type === 'MCQ');
      }

      // Shuffle pool using Fisher-Yates
      for (let i = poolOfQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [poolOfQuestions[i], poolOfQuestions[j]] = [poolOfQuestions[j], poolOfQuestions[i]];
      }

      const selectedQuestions = poolOfQuestions.slice(0, Math.min(questionCount, poolOfQuestions.length));

      if (selectedQuestions.length === 0) {
        alert('No questions found for the selected combination. Try selecting All Terms or a different subject.');
        setIsGenerating(false);
        return;
      }

      const customMaterial = {
        id: `custom_${Date.now()}`,
        grade_key: activeProfile.gradeKey,
        subject_id: selectedSubjectId,
        term: selectedTerm === 'all' ? 'Diagnostic Test' : selectedTerm,
        title: `Custom ${selectedQuestions.length}-Question Practice (${activeProfile.gradeKey.toUpperCase().replace('_', ' ')})`,
        type: 'CUSTOM_DIAGNOSTIC',
        questions: selectedQuestions,
        question_count: selectedQuestions.length,
      };

      const currentSub = subjects.find((s) => s.id === selectedSubjectId);
      navigate(`/quiz/${customMaterial.id}`, {
        state: {
          material: customMaterial,
          subjectName: currentSub ? currentSub.name : 'Custom Subject',
        },
      });
    } catch (e: any) {
      alert('Failed to generate test: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div className="bg-gradient-to-r from-surface-navy via-slate-900 to-brand-blue/30 border border-border-navy p-6 rounded-3xl shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-cyan uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Curriculum Customizer</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Practice Test Generator</h1>
          <p className="text-xs text-slate-300">
            Build a targeted test for {activeProfile.displayName} ({activeProfile.gradeKey.toUpperCase().replace('_', ' ')}).
          </p>
        </div>
        <div className="text-4xl">⚡</div>
      </div>

      <div className="bg-surface-navy border border-border-navy rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-xs">
        {/* 1. Subject Selector */}
        <div>
          <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Select Learning Area *</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {subjects.map((sub) => {
              const isSelected = sub.id === selectedSubjectId;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`p-3 rounded-xl border text-left transition active:scale-95 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-blue/30 border-brand-cyan text-white shadow'
                      : 'bg-dark-navy/60 border-border-navy text-slate-400 hover:text-white hover:bg-dark-navy'
                  }`}
                >
                  <span className="text-xs font-bold">{sub.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1">{sub.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Number of Questions */}
        <div>
          <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-gold-star" />
            <span>Question Batch Size</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[5, 10, 20, 30].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setQuestionCount(num)}
                className={`py-3 rounded-xl font-extrabold text-sm border transition active:scale-95 ${
                  questionCount === num
                    ? 'bg-gold-star/20 border-gold-star text-gold-star shadow'
                    : 'bg-dark-navy border-border-navy text-slate-400 hover:text-white'
                }`}
              >
                {num} Qs
              </button>
            ))}
          </div>
        </div>

        {/* 3. Term Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-2">
              Syllabus Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full bg-dark-navy border border-border-navy rounded-xl p-3 text-slate-200 text-xs font-medium focus:outline-none focus:border-brand-cyan"
            >
              <option value="all">All Terms (Comprehensive)</option>
              <option value="Term 1">Term 1 Only</option>
              <option value="Term 2">Term 2 Only</option>
              <option value="Term 3">Term 3 (Final Exam Prep)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-2">
              Format Preference
            </label>
            <button
              type="button"
              onClick={() => setOnlyMCQ(!onlyMCQ)}
              className="w-full p-3 rounded-xl border border-border-navy bg-dark-navy flex items-center justify-between text-left active:scale-[0.99] transition"
            >
              <span className="font-semibold text-slate-200">Only Multiple Choice (MCQ)</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  onlyMCQ ? 'bg-brand-cyan border-brand-cyan text-dark-navy' : 'border-slate-600'
                }`}
              >
                {onlyMCQ && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4 border-t border-border-navy">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full py-3.5 bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-blue-600 hover:to-cyan-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isGenerating ? 'Assembling Test Questions...' : 'Take Test'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
