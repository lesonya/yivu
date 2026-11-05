import { create } from 'zustand';
import type { LearnerProfile } from '../core/types/curriculum';

interface UserState {
  activeProfile: LearnerProfile;
  profiles: LearnerProfile[];
  setProfile: (profile: LearnerProfile) => void;
  addXP: (amount: number) => void;
  addStars: (amount: number) => void;
  updateGrade: (gradeKey: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  activeProfile: {
    id: 'child_aaba',
    displayName: 'Aaba',
    avatarMascot: 'owl',
    gradeKey: 'std_5',
    division: 'standards',
    weeklyXP: 500,
    weeklyStars: 30,
  },
  profiles: [
    {
      id: 'child_aaba',
      displayName: 'Aaba',
      avatarMascot: 'owl',
      gradeKey: 'std_5',
      division: 'standards',
      weeklyXP: 500,
      weeklyStars: 30,
    },
    {
      id: 'child_1',
      displayName: 'Kagiso',
      avatarMascot: 'owl',
      gradeKey: 'std_4',
      division: 'standards',
      weeklyXP: 420,
      weeklyStars: 24,
    },
    {
      id: 'child_2',
      displayName: 'Tebogo',
      avatarMascot: 'lion',
      gradeKey: 'std_2',
      division: 'standards',
      weeklyXP: 310,
      weeklyStars: 18,
    },
    {
      id: 'child_3',
      displayName: 'Lorato',
      avatarMascot: 'cheetah',
      gradeKey: 'form_1',
      division: 'forms',
      weeklyXP: 250,
      weeklyStars: 15,
    },
  ],
  setProfile: (profile) => set({ activeProfile: profile }),
  addXP: (amount) =>
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        weeklyXP: state.activeProfile.weeklyXP + amount,
      },
    })),
  addStars: (amount) =>
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        weeklyStars: state.activeProfile.weeklyStars + amount,
      },
    })),
  updateGrade: (gradeKey) =>
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        gradeKey,
        division: gradeKey.startsWith('form') ? 'forms' : 'standards',
      },
    })),
}));
