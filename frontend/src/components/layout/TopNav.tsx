import { Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { Trophy, UploadCloud, ArrowLeft } from 'lucide-react';

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
    <header className="bg-surface-navy/90 backdrop-blur-md border-b border-border-navy sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      {/* Left: Brand or Back Button */}
      <div className="flex items-center space-x-3.5">
        {showBack ? (
          <button
            onClick={onBack || (() => window.history.back())}
            className="flex items-center space-x-2 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-dark-navy border border-border-navy transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">{backTitle || 'Back'}</span>
          </button>
        ) : (
          <Link to="/" className="flex items-center space-x-3 focus:outline-none">
            <img src="/logo.png" alt="Yivu Logo" className="w-9 h-9 object-contain drop-shadow" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-white">yivu</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-blue/30 text-brand-cyan px-2 py-0.5 rounded-md border border-brand-cyan/40">
                  Curriculum
                </span>
                <span className="text-xs text-slate-400">v1.0.0</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Botswana Primary & Secondary Learning</p>
            </div>
          </Link>
        )}
      </div>

      {/* Right Controls: Learner Profile & Actions */}
      <div className="flex items-center space-x-3">
        <Link
          to="/leaderboard"
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 ${
            location.pathname === '/leaderboard'
              ? 'bg-gold-star/20 text-gold-star border-gold-star/50'
              : 'bg-dark-navy text-slate-300 border-border-navy hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-gold-star" />
          <span>Leaderboard</span>
        </Link>

        <Link
          to="/analytics"
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 ${
            location.pathname === '/analytics'
              ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/50'
              : 'bg-dark-navy text-slate-300 border-border-navy hover:text-white'
          }`}
        >
          <span>Analytics</span>
        </Link>

        <Link
          to="/upload"
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-dark-navy text-slate-300 border border-border-navy hover:text-white transition active:scale-95"
        >
          <UploadCloud className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Upload Paper</span>
        </Link>

        <a
          href="/admin"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-dark-navy hover:bg-slate-800 text-purple-300 border border-purple-500/40 hover:border-purple-400 transition active:scale-95 shadow"
        >
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span>Admin Studio</span>
        </a>

        {/* Profile Pill */}
        <button
          onClick={onOpenProfileSwitcher}
          className="flex items-center space-x-2.5 bg-gradient-to-r from-brand-blue/30 to-brand-cyan/20 border border-brand-cyan/40 hover:border-brand-cyan text-white px-3 py-1.5 rounded-xl transition active:scale-95"
        >
          <span className="text-base leading-none">{getMascotEmoji(activeProfile.avatarMascot)}</span>
          <div className="text-left">
            <div className="text-xs font-bold leading-tight">{activeProfile.displayName}</div>
            <div className="text-[10px] text-brand-cyan uppercase font-semibold">
              {activeProfile.gradeKey.toUpperCase().replace('_', ' ')}
            </div>
          </div>
          <div className="flex items-center space-x-1 pl-1 text-[11px] text-gold-star font-bold">
            <span>⭐ {activeProfile.weeklyStars}</span>
          </div>
        </button>
      </div>
    </header>
  );
};
