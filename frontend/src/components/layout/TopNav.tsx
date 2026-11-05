import { Link } from 'react-router-dom';
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
    <header className="relative z-40 w-full px-6 py-4 flex items-center justify-between transition-all bg-transparent border-none">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {/* Left: Brand or Back Button */}
        <div className="flex items-center space-x-3.5">
          {showBack ? (
            <button
              onClick={onBack || (() => window.history.back())}
              className="flex items-center space-x-2 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-white/10 hover:border-white/20 transition active:scale-95 text-xs font-semibold backdrop-blur-md"
            >
              {/* @ts-ignore */}
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

        {/* Right Controls: Learner Profile & Upload Action */}
        <div className="flex items-center space-x-2.5">
          <Link
            to="/upload"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900/40 text-slate-300 border border-white/10 hover:border-white/20 hover:text-white transition active:scale-95 backdrop-blur-md"
          >
            {/* @ts-ignore */}
            <iconify-icon icon="solar:cloud-upload-bold" width="14" class="text-purple-400"></iconify-icon>
            <span className="hidden sm:inline">Upload</span>
          </Link>

          {/* Profile Pill Button */}
          <button
            onClick={onOpenProfileSwitcher}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-900/40 to-slate-900/80 border border-purple-500/30 hover:border-purple-400 text-white px-3.5 py-1.5 rounded-full transition active:scale-95 shadow-lg backdrop-blur-md"
          >
            <span className="text-base">{getMascotEmoji(activeProfile.avatarMascot)}</span>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold leading-none">{activeProfile.displayName}</div>
              <div className="text-[10px] text-purple-300 font-medium">
                {activeProfile.gradeKey.toUpperCase().replace('_', ' ')}
              </div>
            </div>
            {/* @ts-ignore */}
            <iconify-icon icon="solar:alt-arrow-down-bold" width="12" class="text-purple-300"></iconify-icon>
          </button>
        </div>
      </div>
    </header>
  );
};
