export interface User {
  id: string;
  email?: string;
  nickname: string;
  role: 'student' | 'teacher' | 'admin';
  isVerified?: boolean;
  xp: number;
  level: number;
  rankTitle: string;
  streak: number;
  longestStreak?: number;
  lastActiveDate?: string;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  gardenPlants: number;
  organismStage: number;
  unlockedAchievements: string[];
  unlockedSecretLab: boolean;
  createdAt?: string;
  updatedAt?: string;
  schemaVersion?: number;
}

export interface Question {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctAnswer?: number;
  explanation?: string;
  category: 'bio1' | 'bio2' | 'ecology';
  categoryLabel?: string;
  unit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'tahsili' | 'post_unit' | 'daily' | 'secret_lab';
  status?: 'published' | 'draft';
  isDeleted?: boolean;
  stats?: {
    timesAnswered: number;
    timesCorrect: number;
    avgTimeSeconds: number;
  };
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizType: 'tahsili' | 'post_unit' | 'daily' | 'secret_lab';
  category?: string;
  startedAt: number;
  completedAt?: number;
  completed: boolean;
  score?: number;
  accuracy?: number;
  totalQuestions: number;
  correctCount: number;
  timeTakenSeconds?: number;
  topicBreakdown?: Record<string, { total: number; correct: number }>;
  xpEarned?: number;
  rankUp?: { oldRank: string; newRank: string; level: number } | null;
  newBadges?: string[];
  answers?: any;
}

export interface ReviewQuestion {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
  category: string;
  categoryLabel?: string;
  unit: string;
  selectedOption: number;
  isCorrect: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredCondition: string;
  xpReward: number;
  isUnlocked?: boolean;
}

export interface Realm {
  id: string;
  title: string;
  description: string;
  category: string;
  unit: string;
  questionsSolved: number;
  mastery: number;
  unlocked: boolean;
  icon: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  adminNickname: string;
  action: string;
  details: string;
  targetId?: string;
  timestamp: string;
}
