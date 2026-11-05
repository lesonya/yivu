import { Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

interface TopNavProps {
  onOpenProfileSwitcher: () => void;
  showBack?: boolean;
  backTitle?: string;
  onBack?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenProfileSwitcher,
  showBack = false,
  backTitle,
  onBack,
}) => {
  const location = useLocation();
  const { activeProfile } = useUserStore();

  const getMascotEmoji = (mascot: string) => {
    switch (mascot) {
      case 'owl': return '🦉';
      case 'lion': return '🦁';
      case 'cheetah': return '🐆';
      default: return '🐘';
    }
  };

  return (
    <header className="bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between transition-all">
      {/* Left: Brand or Back Button */}
      <div className="flex items-center space-x-3.5">
        {showBack ? (
          <button
            onClick={onBack || (() => window.history.back())}
            className="flex items-center space-x-2 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-white/10 hover:border-white/20 transition active:scale-95 text-xs font-semibold"
          >
            <iconify-icon icon="solar:arrow-left-linear" width="16"></iconify-icon>
            <span>{backTitle || 'Back'}</span>
          </button>
        ) : (
          <Link to="/" className="flex items-center space-x-3 focus:outline-none group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition" />
              <img src="/logo.png" alt="Yivu Logo" className="relative w-8 h-8 object-contain drop-shadow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-300 transition">
                  yivu
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                  Cognix UI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Botswana Cognitive Curriculum Hub</p>
            </div>
          </Link>
        )}
      </div>

      {/* Right Controls: Learner Profile & Actions (Pill/Capsule Styled) */}
      <div className="flex items-center space-x-2.5">
        <Link
          to="/leaderboard"
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition active:scale-95 ${
            location.pathname === '/leaderboard'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900/40 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
          }`}
        >
          <iconify-icon icon="solar:cup-star-bold" width="14" class="text-amber-400"></iconify-icon>
          <span className="hidden sm:inline">Leaderboard</span>
        </Link>

        <Link
          to="/analytics"
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition active:scale-95 ${
            location.pathname === '/analytics'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-900/40 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
          }`}
        >
          <iconify-icon icon="solar:chart-2-bold" width="14" class="text-cyan-400"></iconify-icon>
          <span className="hidden sm:inline">Analytics</span>
        </Link>

        <Link
          to="/upload"
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900/40 text-slate-300 border border-white/10 hover:border-white/20 hover:text-white transition active:scale-95"
        >
          <iconify-icon icon="solar:cloud-upload-bold" width="14" class="text-purple-400"></iconify-icon>
          <span className="hidden sm:inline">Upload</span>
        </Link>

        {/* Profile Pill Button */}
        <button
          onClick={onOpenProfileSwitcher}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-900/40 to-slate-900/80 border border-purple-500/30 hover:border-purple-400 text-white px-3.5 py-1.5 rounded-full transition active:scale-95 shadow-lg backdrop-blur-md"
        >
          <span className="text-sm leading-none">{getMascotEmoji(activeProfile.avatarMascot)}</span>
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold leading-tight text-white">{activeProfile.displayName}</div>
            <div className="text-[9px] text-purple-300 uppercase font-semibold">
              {activeProfile.gradeKey.toUpperCase().replace('_', ' ')}
            </div>
          </div>
          <div className="flex items-center space-x-1 pl-1 text-[11px] text-amber-400 font-bold">
            <span>⭐ {activeProfile.weeklyStars}</span>
          </div>
        </button>
      </div>
    </header>
  );
};
