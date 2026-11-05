import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useCurriculumStore } from '../store/useCurriculumStore';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { activeProfile, profiles, updateGrade } = useUserStore();
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

  // Leaderboard ranking preview
  const sortedProfiles = [...profiles].sort((a, b) => b.weeklyStars - a.weeklyStars);
  const activeRank = sortedProfiles.findIndex(p => p.id === activeProfile.id) + 1;
  const topLearner = sortedProfiles[0] || activeProfile;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1st ROW: LEARNER INFO / GREETING, LEADERBOARD, ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1.1 Learner Info / Greeting */}
        <div className="cognix-card p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Dumela, {activeProfile.displayName}!
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curriculum Neural Pathway: <span className="text-cyan-400 font-medium">{activeProfile.gradeKey.toUpperCase().replace('_', ' ')}</span>
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:check-circle-bold" class="text-cyan-400" width="13" height="13"></iconify-icon>
              <span>Target Standard</span>
            </span>
            <span className="font-semibold text-white">Botswana PSLE / JCE</span>
          </div>
        </div>

        {/* 1.2 Leaderboard Card */}
        <div
          onClick={() => navigate('/leaderboard')}
          className="cognix-card cognix-card-hover p-6 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-100 uppercase flex items-center space-x-2">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:cup-star-bold-duotone" class="text-amber-400" width="18" height="18"></iconify-icon>
              <span>Leaderboard</span>
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Rank #{activeRank || 1}
            </span>
          </div>

          <div className="my-3 flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-white/5">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">👑</span>
              <div>
                <div className="text-xs font-bold text-white">{topLearner.displayName}</div>
                <div className="text-[10px] text-slate-400">Pace Sovereign</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-extrabold text-amber-400 flex items-center justify-end space-x-1">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:star-bold" width="13" height="13"></iconify-icon>
                <span>{topLearner.weeklyStars}</span>
              </div>
              <div className="text-[10px] text-slate-400">Weekly Stars</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-amber-400/90 font-medium pt-1">
            <span>Explore Standings</span>
            {/* @ts-ignore */}
            <iconify-icon icon="solar:arrow-right-line-duotone" class="group-hover:translate-x-1 transition" width="16" height="16"></iconify-icon>
          </div>
        </div>

        {/* 1.3 Analytics Card */}
        <div
          onClick={() => navigate('/analytics')}
          className="cognix-card cognix-card-hover p-6 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-100 uppercase flex items-center space-x-2">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:graph-bold-duotone" class="text-cyan-400" width="18" height="18"></iconify-icon>
              <span>Analytics</span>
            </span>
            <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:round-arrow-right-up-bold" width="12" height="12"></iconify-icon>
              <span>Grade A Velocity</span>
            </div>
          </div>

          <div className="my-3 flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-white/5">
            <div className="flex items-center space-x-2.5">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:medal-ribbon-star-bold-duotone" class="text-cyan-400" width="22" height="22"></iconify-icon>
              <div>
                <div className="text-xs font-bold text-white">88% Attainment</div>
                <div className="text-[10px] text-slate-400">Curriculum Retention</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-cyan-300">Level 4</div>
              <div className="text-[10px] text-slate-400">Cognitive Mastery</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-cyan-400/90 font-medium pt-1">
            <span>Open Performance Mesh</span>
            {/* @ts-ignore */}
            <iconify-icon icon="solar:arrow-right-line-duotone" class="group-hover:translate-x-1 transition" width="16" height="16"></iconify-icon>
          </div>
        </div>
      </div>

      {/* 2nd ROW: 3 COLUMNS (SELECT GRADE / STANDARD, SELECT SUBJECT, QUICK ACTION / STATS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 2.1 Select Grade / Standard */}
        <div className="cognix-card p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-100 uppercase flex items-center space-x-2">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:graduation-cap-bold-duotone" class="text-cyan-400" width="18" height="18"></iconify-icon>
                <span>Select Grade / Standard</span>
              </span>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                {activeProfile.gradeKey.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Calibrate learning tier to stream matched syllabus questions and exam papers.
            </p>
          </div>

          <div className="pt-4">
            <div className="relative">
              <select
                value={activeProfile.gradeKey}
                onChange={(e) => handleGradeChange(e.target.value)}
                className="w-full bg-slate-950/70 border border-white/10 hover:border-cyan-400/50 rounded-full px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 transition cursor-pointer appearance-none"
              >
                <optgroup label="Primary Curriculum (Standards 1 – 7)" className="bg-slate-900 text-white">
                  {gradeOptions.slice(0, 7).map(g => (
                    <option key={g.key} value={g.key}>{g.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Junior Secondary (Forms 1 – 3)" className="bg-slate-900 text-white">
                  {gradeOptions.slice(7).map(g => (
                    <option key={g.key} value={g.key}>{g.label}</option>
                  ))}
                </optgroup>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:alt-arrow-down-bold" width="14" height="14"></iconify-icon>
              </div>
            </div>
          </div>
        </div>

        {/* 2.2 Select Subject (Quick Switcher / Jump) */}
        <div className="cognix-card p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-100 uppercase flex items-center space-x-2">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:book-bookmark-bold-duotone" class="text-fuchsia-400" width="18" height="18"></iconify-icon>
                <span>Select Subject</span>
              </span>
              <span className="text-[10px] font-bold text-fuchsia-300 bg-fuchsia-500/10 px-2.5 py-0.5 rounded-full border border-fuchsia-500/20">
                {subjects.length} Tracks Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct neural jump into revision summaries, exercises, and past papers.
            </p>
          </div>

          <div className="pt-4">
            <div className="relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectDropdown(e.target.value)}
                className="w-full bg-slate-950/70 border border-white/10 hover:border-fuchsia-400/50 rounded-full px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-fuchsia-400 transition cursor-pointer appearance-none"
              >
                <option value="" className="bg-slate-900 text-slate-400">-- Choose Subject Stream --</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-slate-900 text-white">
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:alt-arrow-down-bold" width="14" height="14"></iconify-icon>
              </div>
            </div>
          </div>
        </div>

        {/* 2.3 Quick Action / Stats */}
        <div className="cognix-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-100 uppercase flex items-center space-x-2">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:bolt-bold-duotone" class="text-amber-400" width="18" height="18"></iconify-icon>
              <span>Momentum</span>
            </span>
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:fire-bold" width="12" height="12"></iconify-icon>
              <span>5-Day Streak</span>
            </div>
          </div>

          <div className="my-3 flex items-center justify-between bg-slate-950/40 px-4 py-3 rounded-xl border border-white/5">
            <div className="flex items-center space-x-2">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:star-bold" class="text-amber-400" width="16" height="16"></iconify-icon>
              <span className="text-xs font-extrabold text-white">{activeProfile.weeklyStars} Weekly Stars</span>
            </div>
            <div className="text-[11px] text-cyan-300 font-semibold flex items-center space-x-1">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:round-transfer-vertical-bold" width="12" height="12"></iconify-icon>
              <span>{activeProfile.weeklyXP} XP</span>
            </div>
          </div>

          <div>
            <button
              onClick={() => navigate('/custom-test')}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs py-3 px-6 rounded-full shadow-[0_0_20px_rgba(217,70,239,0.3)] transition transform active:scale-95"
            >
              {/* @ts-ignore */}
              <iconify-icon icon="solar:magic-stick-3-bold" width="16" height="16"></iconify-icon>
              <span>Generate Practice Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
