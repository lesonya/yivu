import { create } from 'zustand';
import curriculumData from '../assets/curriculum.json';
import { db } from '../core/database/offlineDb';
import type { Subject, LearningMaterial } from '../core/types/curriculum';

const API_BASE = 'http://localhost:5050/api';

interface CurriculumState {
  selectedDivision: 'standards' | 'forms';
  subjects: Subject[];
  materials: LearningMaterial[];
  isLoading: boolean;
  isOffline: boolean;
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
  isOffline: false,
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
      if (!res.ok) throw new Error('Backend returned status ' + res.status);
      const data: LearningMaterial[] = await res.json();

      // Cache directly into offline IndexedDB for full offline resilience
      try {
        await db.materials.bulkPut(data);
      } catch (dbErr) {
        console.warn('Could not cache to IndexedDB:', dbErr);
      }

      set({ materials: data, isLoading: false, isOffline: false });
    } catch (err: any) {
      console.warn('Backend server unavailable, loading from offline IndexedDB storage:', err.message);
      
      // Fallback to IndexedDB
      try {
        let cached = await db.materials.toArray();
        if (gradeKey) cached = cached.filter((m) => m.grade_key === gradeKey);
        if (subjectId) cached = cached.filter((m) => m.subject_id === subjectId);
        
        set({ materials: cached, isLoading: false, isOffline: true });
      } catch {
        set({ error: err.message, isLoading: false, isOffline: true });
      }
    }
  },

  getPaperById: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/papers/${id}`);
      if (res.ok) {
        const fullPaper = await res.json();
        // Cache full paper with questions to IndexedDB
        if (fullPaper) await db.materials.put(fullPaper);
        return fullPaper;
      }
    } catch (err) {
      console.warn('Could not fetch from server, checking local IndexedDB:', err);
    }

    // Check IndexedDB
    try {
      const offlinePaper = await db.materials.get(id);
      if (offlinePaper) return offlinePaper;
    } catch (dbErr) {
      console.warn('IndexedDB read error:', dbErr);
    }

    return get().materials.find((m) => m.id === id) || null;
  },
}));
