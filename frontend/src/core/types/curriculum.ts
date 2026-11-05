export interface LearnerProfile {
  id: string;
  displayName: string;
  avatarMascot: 'owl' | 'lion' | 'cheetah' | 'elephant';
  gradeKey: string;
  division: 'standards' | 'forms';
  weeklyXP: number;
  weeklyStars: number;
}

export interface CurriculumDivision {
  id: string;
  name: string;
  grades: {
    key: string;
    label: string;
  }[];
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  icon: string;
  accent_color?: string;
  accentColor?: string;
}

export interface Question {
  id: string;
  question_number?: string;
  parent_question_number?: string;
  question_type?: 'MCQ' | 'SHORT_ANSWER' | 'MATCHING' | 'ESSAY' | 'TRUE_FALSE';
  prompt: string;
  options: string[];
  correct_index: number;
  marks?: number;
  explanation: string;
  has_diagram?: boolean;
  diagram_filename?: string | null;
  diagram_description?: string | null;
  marking_scheme?: {
    source_marking_file_path?: string | null;
    correct_answer?: string;
    grading_criteria?: string[];
  };
}

export interface LearningMaterial {
  id: string;
  grade_key: string;
  subject_id: string;
  term: string;
  title: string;
  type: string;
  reading_content?: string;
  source_file?: string;
  questions?: Question[];
  question_count?: number;
}
