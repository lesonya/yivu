import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useCurriculumStore } from '../store/useCurriculumStore';
import {
  Sparkles,
  Flame,
  Star,
  GraduationCap,
  BookOpen,
  Zap
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { activeProfile, updateGrade } = useUserStore();
  const { subjects, setDivision, fetchMaterials } = useCurriculumStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  useEffect(() => {
    setDivision(activeProfile.division);
    fetchMaterials(activeProfile.gradeKey);
  }, [activeProfile.division, activeProfile.gradeKey]);

  const handleSelectSubject = (subject: any) => {
    navigate(`/subject/${subject.id}`, { state: { subject } });
  };

  const handleGradeChange = (gradeKey: string) => {
    updateGrade(gradeKey);
    const div = gradeKey.startsWith('form') ? 'forms' : 'standards';
    setDivision(div);
    fetchMaterials(gradeKey);
  };

  const handleSubjectDropdown = (subId: string) => {
    setSelectedSubjectId(subId);
    if (!subId) return;
    const sub = subjects.find(s => s.id === subId);
    if (sub) {
      handleSelectSubject(sub);
    }
  };

  const gradeOptions = [
    { key: 'std_1', label: 'Standard 1 (Lower Primary)' },
    { key: 'std_2', label: 'Standard 2 (Lower Primary)' },
    { key: 'std_3', label: 'Standard 3 (Lower Primary)' },
    { key: 'std_4', label: 'Standard 4 (Middle Primary)' },
    { key: 'std_5', label: 'Standard 5 (Attainment Prep)' },
    { key: 'std_6', label: 'Standard 6 (Upper Primary)' },
    { key: 'std_7', label: 'Standard 7 (PSLE Candidate)' },
    { key: 'form_1', label: 'Form 1 (Junior Secondary)' },
    { key: 'form_2', label: 'Form 2 (Junior Secondary)' },
    { key: 'form_3', label: 'Form 3 (JCE Candidate)' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP ROW: 4 BALANCED CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Column 1: Learner Info / Greeting */}
        <div className="bg-gradient-to-br from-surface-navy to-slate-900 border border-border-navy p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-blue/20 text-brand-cyan border border-brand-cyan/30 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Learner Profile</span>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight truncate">
              Dumela, {activeProfile.displayName}! 🇧🇼
            </h1>
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              Active track: <span className="text-brand-cyan font-bold">{activeProfile.gradeKey.toUpperCase().replace('_', ' ')}</span>
            </p>
          </div>

          <div className="pt-3 border-t border-border-navy/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Botswana Curriculum</span>
            <span className="font-bold text-white">PSLE / JCE</span>
          </div>
        </div>

        {/* Column 2: Select Grade / Standard */}
        <div className="bg-surface-navy border border-border-navy p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-brand-cyan" />
                <span>Select Grade/Standard</span>
              </span>
              <span className="text-[10px] font-bold text-brand-cyan bg-brand-blue/20 px-2 py-0.5 rounded border border-brand-cyan/30">
                {activeProfile.gradeKey.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Switch learning level to load matched examination papers.
            </p>
          </div>

          <div className="pt-3">
            <select
              value={activeProfile.gradeKey}
              onChange={(e) => handleGradeChange(e.target.value)}
              className="w-full bg-dark-navy border border-border-navy hover:border-brand-cyan/60 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-brand-cyan transition cursor-pointer"
            >
              <optgroup label="Primary Curriculum (Standards 1 – 7)">
                {gradeOptions.slice(0, 7).map(g => (
                  <option key={g.key} value={g.key}>{g.label}</option>
                ))}
              </optgroup>
              <optgroup label="Junior Secondary (Forms 1 – 3)">
                {gradeOptions.slice(7).map(g => (
                  <option key={g.key} value={g.key}>{g.label}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Column 3: Select Subject (Quick Switcher / Jump) */}
        <div className="bg-surface-navy border border-border-navy p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Select Subject</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                {subjects.length} Tracks
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Jump directly into revision notes & past exam papers.
            </p>
          </div>

          <div className="pt-3">
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectDropdown(e.target.value)}
              className="w-full bg-dark-navy border border-border-navy hover:border-emerald-400/60 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 transition cursor-pointer"
            >
              <option value="">-- Jump to a Subject --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Column 4: Quick Action / Stats */}
        <div className="bg-surface-navy border border-border-navy p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Practice & Stats</span>
            </span>
            <div className="flex items-center space-x-1 text-amber-500 font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Flame className="w-3 h-3 fill-current" />
              <span>5d Streak</span>
            </div>
          </div>

          <div className="my-2 flex items-center justify-between bg-dark-navy px-3 py-2 rounded-xl border border-border-navy">
            <div className="flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-gold-star fill-current" />
              <span className="text-xs font-extrabold text-white">{activeProfile.weeklyStars} Stars</span>
            </div>
            <div className="text-[10px] text-brand-cyan font-bold">
              {activeProfile.weeklyXP} XP
            </div>
          </div>

          <div>
            <button
              onClick={() => navigate('/custom-test')}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-lg transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Practice Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
