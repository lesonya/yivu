import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useCurriculumStore } from '../store/useCurriculumStore';
import {
  Award,
  Sparkles,
  ChevronRight,
  Flame,
  Star,
  Compass,
  FileText
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { activeProfile } = useUserStore();
  const { selectedDivision, subjects, setDivision, fetchMaterials } = useCurriculumStore();

  useEffect(() => {
    setDivision(activeProfile.division);
    fetchMaterials(activeProfile.gradeKey);
  }, [activeProfile.division, activeProfile.gradeKey]);

  const handleSelectSubject = (subject: any) => {
    navigate(`/subject/${subject.id}`, { state: { subject } });
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'calculate': return '📐';
      case 'auto_stories': return '📖';
      case 'science': return '🔬';
      case 'language': return '🗣️';
      case 'public': return '🌍';
      case 'palette': return '🎨';
      case 'agriculture': return '🌱';
      case 'self_improvement': return '🕊️';
      default: return '📚';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. GREETING & RESUME BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Learner Greeting & Resume */}
        <div className="md:col-span-2 bg-gradient-to-r from-surface-navy to-slate-900 border border-border-navy p-6 rounded-2xl relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-blue/20 text-brand-cyan border border-brand-cyan/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Botswana Curriculum Explorer</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Dumela, {activeProfile.displayName}! 🇧🇼
            </h1>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Continue your journey in {activeProfile.gradeKey.toUpperCase().replace('_', ' ')}. Practice real past examination papers, earn Stars, and climb the national leaderboard.
            </p>
          </div>

          <div className="pt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const math = subjects.find(s => s.id.includes('math')) || subjects[0];
                if (math) handleSelectSubject(math);
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition active:scale-95"
            >
              <span>Resume Last Revision</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/custom-test')}
              className="flex items-center space-x-2 bg-dark-navy hover:bg-slate-800 text-brand-cyan border border-brand-cyan/40 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Practice Test</span>
            </button>
            <div className="text-xs text-slate-400 font-medium">
              Target: <span className="text-white font-bold">Standard 5 Attainment & JC</span>
            </div>
          </div>
        </div>

        {/* Gamification Stats Card */}
        <div className="bg-surface-navy border border-border-navy p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Progress</span>
            <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>5 Day Streak</span>
            </div>
          </div>

          <div className="my-4 grid grid-cols-2 gap-3 text-center">
            <div className="bg-dark-navy p-3.5 rounded-xl border border-border-navy">
              <div className="text-xl font-extrabold text-gold-star flex items-center justify-center space-x-1">
                <Star className="w-5 h-5 fill-current" />
                <span>{activeProfile.weeklyStars}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">Stars Collected</div>
            </div>
            <div className="bg-dark-navy p-3.5 rounded-xl border border-border-navy">
              <div className="text-xl font-extrabold text-brand-cyan flex items-center justify-center space-x-1">
                <Award className="w-5 h-5" />
                <span>{activeProfile.weeklyXP}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">Experience Points</div>
            </div>
          </div>

          <div className="text-center">
            <div className="w-full bg-dark-navy h-2 rounded-full overflow-hidden border border-border-navy">
              <div className="bg-gradient-to-r from-brand-blue to-brand-cyan h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1.5">65% to next Mastery Level</p>
          </div>
        </div>
      </div>

      {/* 2. DIVISION SELECTOR TABS (Primary vs Secondary) */}
      <div className="flex items-center justify-between border-b border-border-navy pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDivision('standards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              selectedDivision === 'standards'
                ? 'bg-brand-blue text-white shadow-lg'
                : 'bg-surface-navy text-slate-400 hover:text-white border border-border-navy'
            }`}
          >
            <span>Primary Curriculum (Standards 1 – 7)</span>
          </button>
          <button
            onClick={() => setDivision('forms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              selectedDivision === 'forms'
                ? 'bg-brand-blue text-white shadow-lg'
                : 'bg-surface-navy text-slate-400 hover:text-white border border-border-navy'
            }`}
          >
            <span>Secondary Curriculum (Forms 1 – 3)</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Select a subject to view Revision, Notes, and Exam Papers
        </div>
      </div>

      {/* 3. SUBJECT GRID */}
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Compass className="w-4 h-4 text-brand-cyan" />
          <span>Curriculum Learning Tracks</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => handleSelectSubject(sub)}
              className="group bg-surface-navy hover:bg-slate-800/90 border border-border-navy hover:border-brand-cyan/60 p-5 rounded-2xl transition duration-200 text-left flex flex-col justify-between shadow-lg active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl p-3 bg-dark-navy rounded-2xl border border-border-navy group-hover:scale-110 transition">
                  {getSubjectIcon(sub.icon)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-dark-navy px-2.5 py-1 rounded-md border border-border-navy">
                  {sub.code}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-brand-cyan transition">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Exam Papers & Exercises</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-navy/60 flex items-center justify-between text-xs text-brand-cyan font-bold">
                <span>Explore Materials</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
