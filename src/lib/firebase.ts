import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  writeBatch,
  persistentLocalCache,
  persistentMultipleTabManager,
  getDocFromServer,
  Timestamp
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import config from '../../firebase-applet-config.json';
import { initialQuestions, Question } from '../server/seedData.ts';

// 1. Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(config) : getApp();

// 2. Initialize Firestore with Offline Persistence enabled
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, config.firestoreDatabaseId);
  } catch {
    // If already initialized
    return getFirestore(app, config.firestoreDatabaseId);
  }
})();

// 3. Initialize Firebase Auth
export const auth = getAuth(app);

// 4. Test connection helper
export async function testFirestoreConnection(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await getDocFromServer(doc(db, 'system', 'connection_health'));
    return { connected: true, latencyMs: Date.now() - start };
  } catch (err: any) {
    // If doc not found, it still proves connection reached Firestore server!
    if (err?.code === 'not-found' || err?.message?.includes('not-found') || !err?.message?.includes('offline')) {
      return { connected: true, latencyMs: Date.now() - start };
    }
    return { connected: false, latencyMs: Date.now() - start, error: err?.message || 'offline' };
  }
}

// 5. Types
export interface FirestoreUserProfile {
  id: string; // Auth UID
  nickname: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  xp: number;
  level: number;
  rankTitle: string;
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  gardenPlants: number;
  organismStage: number;
  unlockedSecretLab: boolean;
  unlockedAchievements: string[];
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export interface XpLedgerRecord {
  id: string;
  userId: string;
  source: 'quiz' | 'daily' | 'streak' | 'achievement' | 'bonus';
  amount: number;
  description: string;
  referenceId: string;
  timestamp: string;
  schemaVersion: number;
}

export interface FirestoreQuizAttempt {
  id: string;
  userId: string;
  quizType: 'tahsili' | 'post_unit' | 'daily' | 'secret_lab';
  category?: string;
  startedAt: number;
  completedAt: number;
  score: number;
  accuracy: number;
  totalQuestions: number;
  correctCount: number;
  timeTakenSeconds: number;
  xpEarned: number;
  answers: {
    questionId: string;
    questionText: string;
    selectedOption: number;
    correctAnswer: number;
    options: string[];
    isCorrect: boolean;
    timeTakenMs: number;
    unit?: string;
  }[];
  schemaVersion: number;
}

export interface LeaderboardCard {
  userId: string;
  nickname: string;
  rankTitle: string;
  level: number;
  xp: number;
  streak: number;
  gardenPlants: number;
  organismStage: number;
  rank: number;
  updatedAt: string;
}

// 6. Saudi Date Helper (UTC+3)
export function getSaudiDate(): string {
  const now = new Date();
  const riyadhTime = new Date(now.getTime() + (3 * 60 + now.getTimezoneOffset()) * 60000);
  return riyadhTime.toISOString().split('T')[0];
}

// 7. Seed Questions into Firestore if collection is empty
export async function seedQuestionsIfEmpty(): Promise<number> {
  try {
    const qSnap = await getDocs(query(collection(db, 'questions'), limit(1)));
    if (!qSnap.empty) {
      return 0; // Already seeded
    }

    const batch = writeBatch(db);
    let count = 0;
    for (const q of initialQuestions) {
      const qRef = doc(db, 'questions', q.id);
      batch.set(qRef, {
        ...q,
        schemaVersion: 1,
        createdAt: new Date().toISOString()
      });
      count++;
    }
    await batch.commit();
    return count;
  } catch (err) {
    console.error('Failed to seed questions to Firestore:', err);
    return 0;
  }
}

// 8. User Profile Operations (Firestore as Single Source of Truth)
export async function fetchUserProfile(userId: string): Promise<FirestoreUserProfile | null> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as FirestoreUserProfile;
}

export async function createOrUpdateProfile(profile: Partial<FirestoreUserProfile> & { id: string }): Promise<FirestoreUserProfile> {
  const ref = doc(db, 'users', profile.id);
  const snap = await getDoc(ref);
  const now = new Date().toISOString();

  if (!snap.exists()) {
    const newProfile: FirestoreUserProfile = {
      id: profile.id,
      nickname: profile.nickname || 'طالب جديد',
      email: profile.email || '',
      role: profile.role || (profile.email === 'n7376444@gmail.com' ? 'admin' : 'student'),
      xp: profile.xp || 0,
      level: profile.level || 1,
      rankTitle: profile.rankTitle || 'طالب مستجد',
      streak: 1,
      longestStreak: 1,
      lastActiveDate: getSaudiDate(),
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      gardenPlants: 0,
      organismStage: 1,
      unlockedSecretLab: profile.email === 'n7376444@gmail.com',
      unlockedAchievements: [],
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1
    };
    await setDoc(ref, newProfile);
    return newProfile;
  } else {
    const existing = snap.data() as FirestoreUserProfile;
    const updated: FirestoreUserProfile = {
      ...existing,
      ...profile,
      role: existing.role === 'admin' ? 'admin' : (profile.role || existing.role),
      updatedAt: now
    };
    await setDoc(ref, updated, { merge: true });
    return updated;
  }
}

// 9. Atomic XP Transaction & Ledger (Append-Only)
export async function recordXpTransaction(
  userId: string,
  source: 'quiz' | 'daily' | 'streak' | 'achievement' | 'bonus',
  amount: number,
  description: string,
  referenceId: string
): Promise<{ newXp: number; newLevel: number; newRank: string }> {
  const userRef = doc(db, 'users', userId);
  const ledgerId = `xp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const ledgerRef = doc(db, 'users', userId, 'xpLedger', ledgerId);

  return await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('المستخدم غير موجود');
    }

    const userData = userSnap.data() as FirestoreUserProfile;
    const newXp = userData.xp + amount;
    const { level: newLevel, title: newRank } = calculateRank(newXp);

    // 1. Write immutable append-only ledger record
    const ledgerEntry: XpLedgerRecord = {
      id: ledgerId,
      userId,
      source,
      amount,
      description,
      referenceId,
      timestamp: new Date().toISOString(),
      schemaVersion: 1
    };
    transaction.set(ledgerRef, ledgerEntry);

    // 2. Update user profile XP and rank
    transaction.update(userRef, {
      xp: newXp,
      level: newLevel,
      rankTitle: newRank,
      updatedAt: new Date().toISOString()
    });

    return { newXp, newLevel, newRank };
  });
}

// 10. Complete Quiz Atomic Batch / Transaction
export async function saveCompletedQuizAttempt(
  userId: string,
  attemptData: Omit<FirestoreQuizAttempt, 'id' | 'userId' | 'schemaVersion'>,
  newAchievementsToUnlock: { id: string; title: string; xpReward: number; icon: string }[]
): Promise<{ success: boolean; attemptId: string; updatedProfile: FirestoreUserProfile; newBadges: string[] }> {
  const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const userRef = doc(db, 'users', userId);
  const attemptRef = doc(db, 'users', userId, 'quizAttempts', attemptId);
  const now = new Date().toISOString();

  return await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('المستخدم غير موجود');
    }

    const userData = userSnap.data() as FirestoreUserProfile;
    const xpGained = attemptData.xpEarned;
    const totalNewXp = userData.xp + xpGained;
    const { level: newLevel, title: newRank } = calculateRank(totalNewXp);

    const updatedTotalAnswered = userData.totalQuestionsAnswered + attemptData.totalQuestions;
    const updatedCorrect = userData.totalCorrectAnswers + attemptData.correctCount;
    const updatedGarden = userData.gardenPlants + attemptData.correctCount;
    const newOrganismStage = calculateOrganismStage(updatedTotalAnswered, newLevel);
    const newSecretLab = userData.unlockedSecretLab || (attemptData.quizType === 'tahsili' && attemptData.score >= 80) || totalNewXp >= 1500;

    const newlyUnlockedBadgeIds = newAchievementsToUnlock
      .map(a => a.id)
      .filter(id => !userData.unlockedAchievements.includes(id));

    const finalAchievements = [...userData.unlockedAchievements, ...newlyUnlockedBadgeIds];

    // 1. Save Quiz Attempt doc
    const fullAttempt: FirestoreQuizAttempt = {
      ...attemptData,
      id: attemptId,
      userId,
      schemaVersion: 1
    };
    transaction.set(attemptRef, fullAttempt);

    // 2. Append to XP Ledger
    if (xpGained > 0) {
      const ledgerId = `xp-quiz-${Date.now()}`;
      const ledgerRef = doc(db, 'users', userId, 'xpLedger', ledgerId);
      const ledgerEntry: XpLedgerRecord = {
        id: ledgerId,
        userId,
        source: 'quiz',
        amount: xpGained,
        description: `إكمال اختبار ${attemptData.quizType} بنتيجة ${attemptData.score}%`,
        referenceId: attemptId,
        timestamp: now,
        schemaVersion: 1
      };
      transaction.set(ledgerRef, ledgerEntry);
    }

    // 3. Save unlocked achievements in subcollection
    for (const ach of newAchievementsToUnlock) {
      if (newlyUnlockedBadgeIds.includes(ach.id)) {
        const achRef = doc(db, 'users', userId, 'userAchievements', ach.id);
        transaction.set(achRef, {
          id: ach.id,
          achievementId: ach.id,
          title: ach.title,
          unlockedAt: now,
          xpReward: ach.xpReward,
          icon: ach.icon,
          schemaVersion: 1
        });
      }
    }

    // 4. Update User Doc
    const updatedUser: FirestoreUserProfile = {
      ...userData,
      xp: totalNewXp,
      level: newLevel,
      rankTitle: newRank,
      totalQuestionsAnswered: updatedTotalAnswered,
      totalCorrectAnswers: updatedCorrect,
      gardenPlants: updatedGarden,
      organismStage: newOrganismStage,
      unlockedSecretLab: newSecretLab,
      unlockedAchievements: finalAchievements,
      updatedAt: now
    };
    transaction.update(userRef, updatedUser as any);

    return {
      success: true,
      attemptId,
      updatedProfile: updatedUser,
      newBadges: newAchievementsToUnlock.filter(a => newlyUnlockedBadgeIds.includes(a.id)).map(a => a.title)
    };
  });
}

// 11. Sync Leaderboard in Firestore
export async function fetchLiveLeaderboard(): Promise<LeaderboardCard[]> {
  try {
    const usersSnap = await getDocs(
      query(collection(db, 'users'), where('role', '==', 'student'), orderBy('xp', 'desc'), limit(100))
    );
    if (!usersSnap.empty) {
      return usersSnap.docs.map((d, index) => {
        const u = d.data() as FirestoreUserProfile;
        return {
          userId: u.id,
          nickname: u.nickname || 'طالب مجهول',
          rankTitle: u.rankTitle || 'طالب مستجد',
          level: u.level || 1,
          xp: u.xp || 0,
          streak: u.streak || 1,
          gardenPlants: u.gardenPlants || 0,
          organismStage: u.organismStage || 1,
          rank: index + 1,
          updatedAt: u.updatedAt || new Date().toISOString()
        };
      });
    }
  } catch (err) {
    console.error('Error fetching live leaderboard from Firestore:', err);
  }
  return [];
}

// 12. Save Periodic Leaderboard Snapshot (Weekly/Monthly/Term)
export async function saveLeaderboardSnapshot(periodType: 'week' | 'month' | 'term', periodKey: string): Promise<void> {
  const currentBoard = await fetchLiveLeaderboard();
  const snapRef = doc(db, 'leaderboardSummary', `${periodType}_${periodKey}`);
  await setDoc(snapRef, {
    id: `${periodType}_${periodKey}`,
    periodType,
    periodKey,
    createdAt: new Date().toISOString(),
    rankings: currentBoard
  });
}

// 13. Student Data Export (Self-service export)
export async function exportStudentPersonalData(userId: string): Promise<string> {
  const user = await fetchUserProfile(userId);
  const attemptsSnap = await getDocs(collection(db, 'users', userId, 'quizAttempts'));
  const ledgerSnap = await getDocs(collection(db, 'users', userId, 'xpLedger'));
  const achSnap = await getDocs(collection(db, 'users', userId, 'userAchievements'));

  const exportObject = {
    profile: user,
    quizAttempts: attemptsSnap.docs.map(d => d.data()),
    xpLedger: ledgerSnap.docs.map(d => d.data()),
    achievements: achSnap.docs.map(d => d.data()),
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(exportObject, null, 2);
}

// 14. Full Admin System Export (Backup JSON)
export async function exportEntireFirestoreDatabase(): Promise<string> {
  const usersSnap = await getDocs(collection(db, 'users'));
  const questionsSnap = await getDocs(collection(db, 'questions'));
  const leaderboardSnap = await getDocs(collection(db, 'leaderboardSummary'));

  const allUsersWithSubcollections = await Promise.all(
    usersSnap.docs.map(async (uDoc) => {
      const u = uDoc.data();
      const attempts = await getDocs(collection(db, 'users', uDoc.id, 'quizAttempts'));
      const ledger = await getDocs(collection(db, 'users', uDoc.id, 'xpLedger'));
      const ach = await getDocs(collection(db, 'users', uDoc.id, 'userAchievements'));
      return {
        ...u,
        quizAttempts: attempts.docs.map(d => d.data()),
        xpLedger: ledger.docs.map(d => d.data()),
        achievements: ach.docs.map(d => d.data())
      };
    })
  );

  const fullBackup = {
    backupTimestamp: new Date().toISOString(),
    databaseId: config.firestoreDatabaseId,
    totalUsers: usersSnap.size,
    totalQuestions: questionsSnap.size,
    users: allUsersWithSubcollections,
    questions: questionsSnap.docs.map(d => d.data()),
    leaderboardSummaries: leaderboardSnap.docs.map(d => d.data())
  };

  return JSON.stringify(fullBackup, null, 2);
}

// 15. Admin System Diagnostics & Connection Health
export async function getFirestoreSystemDiagnostics(): Promise<{
  connected: boolean;
  latencyMs: number;
  databaseId: string;
  totalUsers: number;
  totalAttempts: number;
  totalQuestions: number;
  lastWriteTimestamp: string;
}> {
  const health = await testFirestoreConnection();
  let totalUsers = 0;
  let totalAttempts = 0;
  let totalQuestions = 0;
  let lastWrite = 'غير متوفر';

  try {
    const uSnap = await getDocs(collection(db, 'users'));
    totalUsers = uSnap.size;

    const qSnap = await getDocs(collection(db, 'questions'));
    totalQuestions = qSnap.size;

    for (const uDoc of uSnap.docs) {
      const aSnap = await getDocs(collection(db, 'users', uDoc.id, 'quizAttempts'));
      totalAttempts += aSnap.size;
      const uData = uDoc.data();
      if (uData.updatedAt && (!lastWrite || uData.updatedAt > lastWrite)) {
        lastWrite = uData.updatedAt;
      }
    }
  } catch (e) {
    console.error('Error fetching diagnostics:', e);
  }

  return {
    connected: health.connected,
    latencyMs: health.latencyMs,
    databaseId: config.firestoreDatabaseId,
    totalUsers,
    totalAttempts,
    totalQuestions,
    lastWriteTimestamp: lastWrite
  };
}

// Helpers
export function calculateRank(xp: number): { level: number; title: string; badge: string } {
  const ranks = [
    { level: 8, title: 'عالم المستقبل', minXp: 8000, badge: '🌎' },
    { level: 7, title: 'عالم الجينوم', minXp: 5000, badge: '🧬' },
    { level: 6, title: 'خبير الأنظمة الحيوية', minXp: 3000, badge: '🧠' },
    { level: 5, title: 'مستكشف الأحياء', minXp: 1700, badge: '🌿' },
    { level: 4, title: 'عالم أحياء ناشئ', minXp: 900, badge: '🧬' },
    { level: 3, title: 'باحث حيوي', minXp: 400, badge: '🧫' },
    { level: 2, title: 'مساعد باحث', minXp: 150, badge: '🔬' },
    { level: 1, title: 'طالب مستجد', minXp: 0, badge: '🌱' }
  ];

  for (const r of ranks) {
    if (xp >= r.minXp) {
      return { level: r.level, title: r.title, badge: r.badge };
    }
  }
  return { level: 1, title: 'طالب مستجد', badge: '🌱' };
}

export function calculateOrganismStage(totalQuestions: number, level: number): number {
  if (totalQuestions >= 200 || level >= 6) return 5;
  if (totalQuestions >= 100 || level >= 4) return 4;
  if (totalQuestions >= 50 || level >= 3) return 3;
  if (totalQuestions >= 20 || level >= 2) return 2;
  return 1;
}
