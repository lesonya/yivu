import { useUserStore } from '../../store/useUserStore';
import { X, Check } from 'lucide-react';

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { profiles, activeProfile, setProfile } = useUserStore();

  if (!isOpen) return null;

  const getMascotEmoji = (mascot: string) => {
    switch (mascot) {
      case 'owl': return '🦉';
      case 'lion': return '🦁';
      case 'cheetah': return '🐆';
      default: return '🐘';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-navy border border-border-navy w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-border-navy flex items-center justify-between bg-dark-navy">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Learner Profile</h3>
            <p className="text-[11px] text-slate-400">Switch profile to track individual Stars & XP</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {profiles.map((p) => {
            const isSelected = p.id === activeProfile.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setProfile(p);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition text-left active:scale-[0.98] ${
                  isSelected
                    ? 'bg-brand-blue/20 border-brand-cyan text-white shadow-lg'
                    : 'bg-dark-navy/60 border-border-navy hover:bg-surface-navy text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-dark-navy border border-border-navy flex items-center justify-center text-2xl shadow">
                    {getMascotEmoji(p.avatarMascot)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{p.displayName}</h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {p.gradeKey.toUpperCase().replace('_', ' ')} • {p.division === 'standards' ? 'Standard' : 'Form'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-gold-star">⭐ {p.weeklyStars} Stars</div>
                    <div className="text-[11px] font-semibold text-slate-400">{p.weeklyXP} XP</div>
                  </div>
                  {isSelected && (
                    <div className="p-1 bg-brand-cyan text-dark-navy rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
