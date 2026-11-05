import { Link } from 'react-router-dom';

interface TopNavProps {
  showBack?: boolean;
  backTitle?: string;
  onBack?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  showBack = false,
  backTitle,
  onBack,
}) => {
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
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Botswana Cognitive Curriculum Hub</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
