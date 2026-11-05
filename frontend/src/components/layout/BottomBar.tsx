import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

interface BottomBarProps {
  onOpenProfileSwitcher: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ onOpenProfileSwitcher }) => {
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
    <footer className="relative z-30 w-full px-6 py-5 mt-auto bg-transparent">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-t border-white/5 pt-4">
        {/* Left: Botswana curriculum status indicator */}
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Botswana MoE Curriculum System</span>
        </div>

        {/* Right: Upload & Profile Switcher Buttons */}
        <div className="flex items-center space-x-3">
          {/* Upload Button */}
          <Link
            to="/upload"
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold border transition active:scale-95 backdrop-blur-md ${
              location.pathname === '/upload'
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-lg shadow-purple-500/10'
                : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {/* @ts-ignore */}
            <iconify-icon icon="solar:cloud-upload-bold" width="16" class="text-purple-400"></iconify-icon>
            <span>Upload Past Paper</span>
          </Link>

          {/* Profile Switcher Button */}
          <button
            onClick={onOpenProfileSwitcher}
            className="flex items-center space-x-2.5 bg-gradient-to-r from-purple-900/40 via-slate-900/80 to-slate-900/90 border border-purple-500/30 hover:border-purple-400 text-white px-4 py-2 rounded-full transition active:scale-95 shadow-lg backdrop-blur-md"
          >
            <span className="text-base">{getMascotEmoji(activeProfile.avatarMascot)}</span>
            <div className="text-left">
              <div className="text-xs font-bold leading-none">{activeProfile.displayName}</div>
              <div className="text-[10px] text-purple-300 font-medium mt-0.5">
                {activeProfile.gradeKey.toUpperCase().replace('_', ' ')}
              </div>
            </div>
            {/* @ts-ignore */}
            <iconify-icon icon="solar:alt-arrow-down-bold" width="12" class="text-purple-300 ml-1"></iconify-icon>
          </button>
        </div>
      </div>
    </footer>
  );
};
