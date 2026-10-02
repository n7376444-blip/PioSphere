import fs from 'fs';
import path from 'path';
import { initialQuestions, Question } from './seedData.ts';

export interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'student' | 'teacher' | 'admin';
  isVerified: boolean;
  otpCode?: string;
  otpExpiresAt?: number;
  xp: number;
  level: number;
  rankTitle: string;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD (Asia/Riyadh UTC+3)
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  gardenPlants: number;
  organismStage: number; // 1 to 5
  unlockedAchievements: string[];
  unlockedSecretLab: boolean;
  createdAt: string;
  isSuspended?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredCondition: string;
  xpReward: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizType: 'tahsili' | 'post_unit' | 'daily' | 'secret_lab';
  startedAt: number;
  currentQuestionIndex: number;
  questionIds: string[];
  questionData?: Record<string, {
    options: [string, string, string, string];
    correctAnswer: number;
  }>;
  answers: Record<string, {
    selectedOption: number;
    answeredAt: number;
    timeTakenMs: number;
    isCorrect: boolean;
  }>;
  completed: boolean;
  completedAt?: number;
  score?: number;
  accuracy?: number;
  totalQuestions: number;
  correctCount: number;
  topicBreakdown?: Record<string, { total: number; correct: number }>;
  xpEarned?: number;
  rankUp?: { oldRank: string; newRank: string; level?: number } | null;
  newBadges?: string[];
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

export interface Settings {
  xpValues: {
    correct: number;
    completeQuiz: number;
    score80: number;
    perfectScore: number;
    dailyLogin: number;
    streak7: number;
  };
  rankThresholds: {
    level: number;
    title: string;
    minXp: number;
    badge: string;
  }[];
}

export interface DatabaseSchema {
  users: Record<string, User>;
  sessions: Record<string, { userId: string; token: string; expiresAt: number }>;
  questions: Record<string, Question>;
  attempts: Record<string, QuizAttempt>;
  auditLogs: AuditLog[];
  settings: Settings;
  dailyState: Record<string, { questionId: string; participants: number; correct: number }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_quiz', title: 'الخطوة الأولى', description: 'أكملت أول اختبار في مسيرتك العلمية', icon: '🌱', requiredCondition: 'إكمال اختبار واحد', xpReward: 50 },
  { id: 'perfect_100', title: 'العلامة الكاملة', description: 'حصلت على 100% في اختبار كامل', icon: '🎯', requiredCondition: 'درجة 100% في اختبار', xpReward: 100 },
  { id: 'century_solved', title: 'مئوية الأسئلة', description: 'حللت أكثر من 100 سؤال بيولوجي', icon: '📚', requiredCondition: 'حل 100 سؤال', xpReward: 150 },
  { id: 'streak_7', title: 'شغف أسبوعي', description: 'حافظت على وتيرة دراسية 7 أيام متتالية', icon: '🔥', requiredCondition: 'سلسلة 7 أيام', xpReward: 100 },
  { id: 'streak_14', title: 'عالم مثابر', description: 'واصلت التعلم 14 يومًا دون انقطاع', icon: '⚡', requiredCondition: 'سلسلة 14 يوماً', xpReward: 200 },
  { id: 'streak_30', title: 'عالم راسخ', description: 'سلسلة تفوق لمدة شهر كامل', icon: '🌟', requiredCondition: 'سلسلة 30 يوماً', xpReward: 500 },
  { id: 'tahsili_master', title: 'ملك التحصيلي', description: 'أتممت اختبار التحصيلي الشامل بنجاح', icon: '👑', requiredCondition: 'إكمال التحصيلي بدرجة ≥ 80%', xpReward: 250 },
  { id: 'secret_lab_unlock', title: 'مفتاح الأسرار', description: 'فتحت أبواب المختبر السري الحصري', icon: '🧪', requiredCondition: 'فتح المختبر السري', xpReward: 150 },
  { id: 'bio_explorer', title: 'مستكشف الأحياء', description: 'أتقنت موضوعات في جميع الأقسام الثلاثة', icon: '🗺️', requiredCondition: 'حل أسئلة من أحياء 1 و2 والبيئة', xpReward: 120 }
];

export const DEFAULT_SETTINGS: Settings = {
  xpValues: {
    correct: 10,
    completeQuiz: 50,
    score80: 30,
    perfectScore: 100,
    dailyLogin: 5,
    streak7: 50
  },
  rankThresholds: [
    { level: 1, title: 'طالب مستجد', minXp: 0, badge: '🌱' },
    { level: 2, title: 'مساعد باحث', minXp: 150, badge: '🔬' },
    { level: 3, title: 'باحث حيوي', minXp: 400, badge: '🧫' },
    { level: 4, title: 'عالم أحياء ناشئ', minXp: 900, badge: '🧬' },
    { level: 5, title: 'مستكشف الأحياء', minXp: 1700, badge: '🌿' },
    { level: 6, title: 'خبير الأنظمة الحيوية', minXp: 3000, badge: '🧠' },
    { level: 7, title: 'عالم الجينوم', minXp: 5000, badge: '🧬' },
    { level: 8, title: 'عالم المستقبل', minXp: 8000, badge: '🌎' }
  ]
};

// In-memory cache synced with disk
let dbMemory: DatabaseSchema | null = null;

export function getSaudiDate(): string {
  // Asia/Riyadh is UTC+3
  const now = new Date();
  const riyadhTime = new Date(now.getTime() + (3 * 60 + now.getTimezoneOffset()) * 60000);
  return riyadhTime.toISOString().split('T')[0];
}

export function initDb(): DatabaseSchema {
  if (dbMemory) return dbMemory;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbMemory = JSON.parse(content);
      // Ensure seed questions are populated if empty
      if (!dbMemory || !dbMemory.questions || Object.keys(dbMemory.questions).length === 0) {
        dbMemory = createDefaultDatabase();
        saveDb(dbMemory);
      }
      return dbMemory;
    } catch {
      // Fallback if corrupt
      dbMemory = createDefaultDatabase();
      saveDb(dbMemory);
      return dbMemory;
    }
  } else {
    dbMemory = createDefaultDatabase();
    saveDb(dbMemory);
    return dbMemory;
  }
}

function createDefaultDatabase(): DatabaseSchema {
  const questionsMap: Record<string, Question> = {};
  for (const q of initialQuestions) {
    questionsMap[q.id] = q;
  }

  // Only real registered students and administrators will appear in the system
  const defaultUsers: Record<string, User> = {};

  return {
    users: defaultUsers,
    sessions: {},
    questions: questionsMap,
    attempts: {},
    auditLogs: [
      {
        id: 'log-seed-1',
        adminEmail: 'system',
        adminNickname: 'النظام',
        action: 'init_system',
        details: 'تمت تهيئة بنك الأسئلة الأولي والأدوار والقيم الافتراضية بنجاح.',
        timestamp: new Date().toISOString()
      }
    ],
    settings: DEFAULT_SETTINGS,
    dailyState: {}
  };
}

export function saveDb(data: DatabaseSchema) {
  dbMemory = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

export function getRankForXp(xp: number, settings: Settings): { level: number; title: string; badge: string; nextThreshold?: number } {
  const sorted = [...settings.rankThresholds].sort((a, b) => b.minXp - a.minXp);
  for (let i = 0; i < sorted.length; i++) {
    if (xp >= sorted[i].minXp) {
      const current = sorted[i];
      const next = sorted[i - 1];
      return {
        level: current.level,
        title: current.title,
        badge: current.badge,
        nextThreshold: next ? next.minXp : undefined
      };
    }
  }
  const lowest = settings.rankThresholds[0];
  return { level: lowest.level, title: lowest.title, badge: lowest.badge, nextThreshold: settings.rankThresholds[1]?.minXp };
}

export function calculateOrganismStage(solvedCount: number, level: number): number {
  if (solvedCount >= 200 || level >= 6) return 5; // كائن حي متكامل
  if (solvedCount >= 100 || level >= 4) return 4; // جزيء DNA حلزوني
  if (solvedCount >= 50 || level >= 3) return 3;  // خلية متطورة
  if (solvedCount >= 20 || level >= 2) return 2;  // خلية أولية
  return 1; // كائن مجهري
}
