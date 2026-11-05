import Dexie, { type Table } from 'dexie';
import type { LearningMaterial, Question, LearnerProfile } from '../types/curriculum';

export interface ExamAttempt {
  id: string;
  learnerId: string;
  learnerName: string;
  materialId: string;
  materialTitle: string;
  subjectId: string;
  gradeKey: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  gradeBand: 'A' | 'B' | 'C' | 'D' | 'E';
  timeSpentSeconds: number;
  completedAt: string;
}

export class YivuOfflineDB extends Dexie {
  materials!: Table<LearningMaterial, string>;
  questions!: Table<Question, string>;
  profiles!: Table<LearnerProfile, string>;
  attempts!: Table<ExamAttempt, string>;

  constructor() {
    super('YivuOfflineDB');
    this.version(2).stores({
      materials: 'id, grade_key, subject_id, term, type',
      questions: 'id, question_number',
      profiles: 'id, gradeKey, division',
      attempts: 'id, learnerId, materialId, subjectId, gradeKey, completedAt',
    });
  }
}

export const db = new YivuOfflineDB();

