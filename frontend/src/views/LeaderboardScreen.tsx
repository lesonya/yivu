import { useUserStore } from '../store/useUserStore';
import { Trophy, Crown } from 'lucide-react';

export const LeaderboardScreen: React.FC = () => {
  const { profiles, activeProfile } = useUserStore();

  const sorted = [...profiles].sort((a, b) => b.weeklyStars - a.weeklyStars);

  const getMascotEmoji = (mascot: string) => {
    switch (mascot) {
      case 'owl': return '🦉';
      case 'lion': return '🦁';
      case 'cheetah': return '🐆';
      default: return '🐘';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-surface-navy via-slate-900 to-amber-950/40 border border-border-navy p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-gold-star uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Weekly Attainment Leaderboard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Botswana National Standings</h1>
          <p className="text-xs text-slate-300">
            Top performing primary and junior secondary learners this week.
          </p>
        </div>
        <div className="text-5xl">🏆</div>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-3 gap-3 pt-4 items-end text-center">
        {/* 2nd place */}
        {sorted[1] && (
          <div className="bg-surface-navy border border-border-navy rounded-2xl p-4 flex flex-col items-center">
            <div className="text-2xl">{getMascotEmoji(sorted[1].avatarMascot)}</div>
            <div className="w-6 h-6 rounded-full bg-slate-300 text-dark-navy text-xs font-extrabold flex items-center justify-center my-1">
              2
            </div>
            <div className="text-xs font-bold text-white truncate max-w-full">{sorted[1].displayName}</div>
            <div className="text-[11px] text-gold-star font-bold mt-1">⭐ {sorted[1].weeklyStars}</div>
          </div>
        )}

        {/* 1st place */}
        {sorted[0] && (
          <div className="bg-gradient-to-b from-amber-500/20 to-surface-navy border-2 border-gold-star rounded-2xl p-5 flex flex-col items-center shadow-lg -translate-y-2">
            <Crown className="w-6 h-6 text-gold-star mb-1 fill-current" />
            <div className="text-3xl">{getMascotEmoji(sorted[0].avatarMascot)}</div>
            <div className="w-7 h-7 rounded-full bg-gold-star text-dark-navy text-xs font-extrabold flex items-center justify-center my-1">
              1
            </div>
            <div className="text-sm font-extrabold text-white truncate max-w-full">{sorted[0].displayName}</div>
            <div className="text-xs text-gold-star font-extrabold mt-1">⭐ {sorted[0].weeklyStars} Stars</div>
          </div>
        )}

        {/* 3rd place */}
        {sorted[2] && (
          <div className="bg-surface-navy border border-border-navy rounded-2xl p-4 flex flex-col items-center">
            <div className="text-2xl">{getMascotEmoji(sorted[2].avatarMascot)}</div>
            <div className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-extrabold flex items-center justify-center my-1">
              3
            </div>
            <div className="text-xs font-bold text-white truncate max-w-full">{sorted[2].displayName}</div>
            <div className="text-[11px] text-gold-star font-bold mt-1">⭐ {sorted[2].weeklyStars}</div>
          </div>
        )}
      </div>

      {/* Full Leaderboard List */}
      <div className="bg-surface-navy border border-border-navy rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Learner Rankings</h3>

        {sorted.map((learner, idx) => {
          const isCurrentUser = learner.id === activeProfile.id;
          return (
            <div
              key={learner.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${isCurrentUser
                  ? 'bg-brand-blue/20 border-brand-cyan shadow'
                  : 'bg-dark-navy/60 border-border-navy'
                }`}
            >
              <div className="flex items-center space-x-3.5">
                <span className="w-6 text-center text-xs font-extrabold text-slate-400">
                  #{idx + 1}
                </span>
                <span className="text-2xl">{getMascotEmoji(learner.avatarMascot)}</span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>{learner.displayName}</span>
                    {isCurrentUser && (
                      <span className="text-[9px] bg-brand-cyan text-dark-navy font-extrabold px-1.5 py-0.5 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {learner.gradeKey.toUpperCase().replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-gold-star">⭐ {learner.weeklyStars} Stars</div>
                <div className="text-[10px] text-slate-400 font-semibold">{learner.weeklyXP} XP</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
