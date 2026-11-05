import Dexie, { type Table } from 'dexie';
import type { LearningMaterial, Question, LearnerProfile } from '../types/curriculum';

export class YivuOfflineDB extends Dexie {
  materials!: Table<LearningMaterial, string>;
  questions!: Table<Question, string>;
  profiles!: Table<LearnerProfile, string>;

  constructor() {
    super('YivuOfflineDB');
    this.version(1).stores({
      materials: 'id, grade_key, subject_id, term, type',
      questions: 'id, question_number',
      profiles: 'id, gradeKey, division',
    });
  }
}

export const db = new YivuOfflineDB();
