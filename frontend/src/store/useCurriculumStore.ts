import { create } from 'zustand';
import curriculumData from '../assets/curriculum.json';
import type { Subject, LearningMaterial } from '../core/types/curriculum';

const API_BASE = 'http://localhost:5050/api';

interface CurriculumState {
  selectedDivision: 'standards' | 'forms';
  subjects: Subject[];
  materials: LearningMaterial[];
  isLoading: boolean;
  error: string | null;
  setDivision: (div: 'standards' | 'forms') => void;
  fetchMaterials: (gradeKey?: string, subjectId?: string) => Promise<void>;
  getPaperById: (id: string) => Promise<LearningMaterial | null>;
}

export const useCurriculumStore = create<CurriculumState>((set, get) => ({
  selectedDivision: 'standards',
  subjects: [],
  materials: [],
  isLoading: false,
  error: null,

  setDivision: (div) => {
    const divisionObj = curriculumData.divisions.find((d) => d.id === div);
    const subjects = divisionObj ? (divisionObj.subjects as unknown as Subject[]) : [];
    set({ selectedDivision: div, subjects });
  },

  fetchMaterials: async (gradeKey, subjectId) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (gradeKey) params.append('grade_key', gradeKey);
      if (subjectId) params.append('subject_id', subjectId);

      const res = await fetch(`${API_BASE}/papers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch from backend server');
      const data = await res.json();
      set({ materials: data, isLoading: false });
    } catch (err: any) {
      console.warn('Backend server unavailable, attempting fallback:', err.message);
      set({ error: err.message, isLoading: false });
    }
  },

  getPaperById: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/papers/${id}`);
      if (!res.ok) throw new Error('Paper not found');
      return await res.json();
    } catch (err) {
      console.error('Error fetching paper details:', err);
      // Fallback search in locally loaded materials
      return get().materials.find((m) => m.id === id) || null;
    }
  },
}));
