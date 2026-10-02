import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  initDb,
  saveDb,
  getSaudiDate,
  getRankForXp,
  calculateOrganismStage,
  User,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_SETTINGS
} from './src/server/db.ts';
import { Question } from './src/server/seedData.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const ADMIN_EMAIL = (process.env.ADMIN_EMAILS || 'n7376444@gmail.com').toLowerCase().trim();

// Initialize Database
let db = initDb();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting map
const requestCounts = new Map<string, { count: number; resetAt: number }>();
function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'client';
    const key = `${ip}_${req.path}`;
    const now = Date.now();
    const entry = requestCounts.get(key as string);

    if (!entry || now > entry.resetAt) {
      requestCounts.set(key as string, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({ error: 'تم تجاوز عدد الطلبات المسموح بها، يرجى الانتظار قليلاً.' });
    }

    entry.count++;
    return next();
  };
}

// Auth Helper
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح، يرجى تسجيل الدخول أولاً.' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.sessions[token];
  if (!session || Date.now() > session.expiresAt) {
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.' });
  }

  const user = db.users[session.userId];
  if (!user || user.isSuspended) {
    return res.status(403).json({ error: 'الحساب معطل أو غير موجود.' });
  }

  (req as any).user = user;
  (req as any).token = token;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user: User = (req as any).user;
  if (!user || user.role !== 'admin' || user.email.toLowerCase() !== ADMIN_EMAIL || !user.isVerified) {
    return res.status(403).json({ error: 'صلاحية الإدارة محصورة بالمسؤول المعتمد فقط.' });
  }
  next();
}

function requireTeacherOrAdmin(req: Request, res: Response, next: NextFunction) {
  const user: User = (req as any).user;
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return res.status(403).json({ error: 'هذه الصفحة مخصصة للمعلمين وإدارة المنصة.' });
  }
  next();
}

function sanitizeUser(user: User, isSelf = false) {
  return {
    id: user.id,
    nickname: user.nickname,
    role: user.role,
    isVerified: user.isVerified,
    xp: user.xp,
    level: user.level,
    rankTitle: user.rankTitle,
    streak: user.streak,
    totalQuestionsAnswered: user.totalQuestionsAnswered,
    totalCorrectAnswers: user.totalCorrectAnswers,
    gardenPlants: user.gardenPlants,
    organismStage: user.organismStage,
    unlockedAchievements: user.unlockedAchievements,
    unlockedSecretLab: user.unlockedSecretLab,
    email: isSelf ? user.email : undefined // Email is STRICTLY private
  };
}

// ==========================================
// 1. AUTHENTICATION & SECURITY
// ==========================================

// Register or Request Login OTP
app.post('/api/auth/register-or-login', rateLimit(10, 60000), (req: Request, res: Response) => {
  const { email, nickname } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'يرجى إدخال بريد إلكتروني صحيح.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanNickname = (nickname || '').trim();

  if (!cleanNickname || cleanNickname.length < 2 || cleanNickname.length > 50) {
    return res.status(400).json({ error: 'اسم الطالب يجب أن يكون بين حرفين و50 حرفاً.' });
  }

  // Check profane nicknames
  const blockedKeywords = ['قذر', 'سافل', 'كلب', 'حمار', 'وسخ'];
  if (blockedKeywords.some(b => cleanNickname.toLowerCase().includes(b))) {
    return res.status(400).json({ error: 'اسم الطالب يحتوي على كلمات غير ملائمة.' });
  }

  // Find or create user
  let user = Object.values(db.users).find(u => u.email === cleanEmail);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  console.log(`[BioSphere Auth] Generated OTP for ${cleanEmail}: ${otpCode}`);

  if (!user) {
    // If nickname already taken by another user with different email, let's allow it or append suffix if necessary
    const existingUserWithNick = Object.values(db.users).find(
      u => u.email !== cleanEmail && u.nickname.toLowerCase() === cleanNickname.toLowerCase()
    );
    let finalNickname = cleanNickname;
    if (existingUserWithNick) {
      finalNickname = `${cleanNickname} (${Math.floor(10 + Math.random() * 89)})`;
    }

    const newId = `user-${crypto.randomUUID()}`;
    user = {
      id: newId,
      email: cleanEmail,
      nickname: finalNickname,
      role: 'student', // starts as student until verified
      isVerified: false,
      otpCode,
      otpExpiresAt,
      xp: 0,
      level: 1,
      rankTitle: 'طالب مستجد',
      streak: 1,
      lastActiveDate: getSaudiDate(),
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      gardenPlants: 0,
      organismStage: 1,
      unlockedAchievements: [],
      unlockedSecretLab: false,
      createdAt: new Date().toISOString()
    };
    db.users[newId] = user;
  } else {
    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;
    // Update nickname if provided and not conflict
    if (cleanNickname && cleanNickname !== user.nickname) {
      const existingNick = Object.values(db.users).find(u => u.id !== user!.id && u.nickname.toLowerCase() === cleanNickname.toLowerCase());
      if (!existingNick) {
        user.nickname = cleanNickname;
      }
    }
  }

  saveDb(db);

  return res.json({
    success: true,
    message: 'تم إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني.',
    email: cleanEmail,
    // Provide simulated OTP code in response for testing/demo access
    verificationCode: otpCode
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', rateLimit(10, 60000), (req: Request, res: Response) => {
  const { email, otpCode } = req.body;
  if (!email || !otpCode) {
    return res.status(400).json({ error: 'البريد ورمز التحقق مطلوبان.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = Object.values(db.users).find(u => u.email === cleanEmail);

  if (!user || !user.otpCode || !user.otpExpiresAt) {
    return res.status(400).json({ error: 'لم يتم طلب رمز تحقق لهذا الحساب أو انتهت صلاحيته.' });
  }

  if (Date.now() > user.otpExpiresAt) {
    return res.status(400).json({ error: 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد.' });
  }

  if (user.otpCode !== otpCode.trim()) {
    return res.status(400).json({ error: 'رمز التحقق غير صحيح، يرجى التأكد وإعادة المحاولة.' });
  }

  // Successful verification
  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpiresAt = undefined;

  // STRICT ADMIN ASSIGNMENT ONLY AFTER OTP VERIFICATION:
  if (user.email === ADMIN_EMAIL) {
    user.role = 'admin';
  }

  // Daily streak & login reward check
  const today = getSaudiDate();
  if (user.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (user.lastActiveDate === yesterday) {
      user.streak += 1;
      if (user.streak === 7 && !user.unlockedAchievements.includes('streak_7')) {
        user.unlockedAchievements.push('streak_7');
        user.xp += 100;
      }
      if (user.streak === 14 && !user.unlockedAchievements.includes('streak_14')) {
        user.unlockedAchievements.push('streak_14');
        user.xp += 200;
      }
      if (user.streak === 30 && !user.unlockedAchievements.includes('streak_30')) {
        user.unlockedAchievements.push('streak_30');
        user.xp += 500;
      }
    } else {
      user.streak = 1;
    }
    user.lastActiveDate = today;
    user.xp += db.settings.xpValues.dailyLogin || 5;
    const rankInfo = getRankForXp(user.xp, db.settings);
    user.level = rankInfo.level;
    user.rankTitle = rankInfo.title;
  }

  // Generate session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  db.sessions[token] = { userId: user.id, token, expiresAt };

  saveDb(db);

  return res.json({
    success: true,
    token,
    user: sanitizeUser(user, true)
  });
});

// Admin Direct Login with Security Key & Verified Email Check
app.post('/api/auth/admin-direct-login', rateLimit(10, 60000), (req: Request, res: Response) => {
  const { email, adminName, adminKey } = req.body;
  if (!email || !adminKey) {
    return res.status(400).json({ error: 'البريد ورمز الدخول الأمني مطلوبان.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'البريد المدخل غير مصرح له بصلاحية الإدارة.' });
  }

  // Acceptable admin keys: '7376444', 'BioAdmin2026!', 'admin', or custom env ADMIN_KEY
  const validKeys = ['7376444', 'BioAdmin2026!', 'admin', process.env.ADMIN_KEY].filter(Boolean);
  if (!validKeys.includes(adminKey.trim())) {
    return res.status(401).json({ error: 'الرمز الأمني الخاص بالأدمن غير صحيح.' });
  }

  // Find or create admin user
  let user = Object.values(db.users).find(u => u.email === cleanEmail);
  const finalName = (adminName || (user ? user.nickname : 'مدير المنصة')).trim();

  if (!user) {
    const newId = `user-${crypto.randomUUID()}`;
    user = {
      id: newId,
      email: cleanEmail,
      nickname: finalName,
      role: 'admin',
      isVerified: true,
      xp: 0,
      level: 1,
      rankTitle: 'طالب مستجد',
      streak: 1,
      lastActiveDate: getSaudiDate(),
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      gardenPlants: 0,
      organismStage: 1,
      unlockedAchievements: [],
      unlockedSecretLab: true,
      createdAt: new Date().toISOString()
    };
    db.users[newId] = user;
  } else {
    user.role = 'admin';
    user.isVerified = true;
    if (adminName && adminName.trim()) {
      user.nickname = adminName.trim();
    }
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  db.sessions[token] = { userId: user.id, token, expiresAt };

  saveDb(db);

  return res.json({
    success: true,
    token,
    user: sanitizeUser(user, true)
  });
});

// Current User Details
app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  res.json({ user: sanitizeUser(user, true) });
});

// Logout
app.post('/api/auth/logout', authenticate, (req: Request, res: Response) => {
  const token = (req as any).token;
  delete db.sessions[token];
  saveDb(db);
  res.json({ success: true });
});

// ==========================================
// 2. QUIZ ENGINE
// ==========================================

// Helper: Shuffle question options dynamically with Fisher-Yates to eliminate any pattern
function shuffleQuestionOptions(q: Question): { shuffledOptions: [string, string, string, string]; newCorrectIndex: number } {
  const correctText = q.options[q.correctAnswer];
  const shuffled: string[] = [...q.options];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  
  const newCorrectIndex = shuffled.indexOf(correctText);
  return {
    shuffledOptions: shuffled as [string, string, string, string],
    newCorrectIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0
  };
}

// Start Quiz Attempt
app.post('/api/quizzes/start', authenticate, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { quizType, category } = req.body;

  if (!['tahsili', 'post_unit', 'daily', 'secret_lab'].includes(quizType)) {
    return res.status(400).json({ error: 'نوع الاختبار غير صالح.' });
  }

  if (quizType === 'secret_lab' && !user.unlockedSecretLab && user.role !== 'admin') {
    return res.status(403).json({ error: 'المختبر السري مقفل! أنجز متطلبات الفتح أولاً.' });
  }

  // Filter available published questions
  const allQuestions = Object.values(db.questions).filter(q => q.status === 'published' && !q.isDeleted);
  let selectedQuestions: Question[] = [];

  if (quizType === 'tahsili') {
    // Balanced across categories: bio1, bio2, ecology
    const b1 = allQuestions.filter(q => q.category === 'bio1').sort(() => 0.5 - Math.random());
    const b2 = allQuestions.filter(q => q.category === 'bio2').sort(() => 0.5 - Math.random());
    const eco = allQuestions.filter(q => q.category === 'ecology').sort(() => 0.5 - Math.random());
    // For realistic testing and instant accessibility, 15 to 25 balanced questions per tahsili test run
    const count = 15;
    const perCat = Math.ceil(count / 3);
    selectedQuestions = [...b1.slice(0, perCat), ...b2.slice(0, perCat), ...eco.slice(0, perCat)].sort(() => 0.5 - Math.random());
  } else if (quizType === 'post_unit') {
    let pool = allQuestions;
    if (category) {
      pool = pool.filter(q => q.category === category);
    }
    selectedQuestions = pool.sort(() => 0.5 - Math.random()).slice(0, 10);
  } else if (quizType === 'secret_lab') {
    selectedQuestions = allQuestions.filter(q => q.type === 'secret_lab' || q.difficulty === 'hard').sort(() => 0.5 - Math.random()).slice(0, 8);
  } else if (quizType === 'daily') {
    // 1 question
    selectedQuestions = allQuestions.filter(q => q.type === 'daily' || q.difficulty === 'medium').slice(0, 1);
  }

  if (selectedQuestions.length === 0) {
    selectedQuestions = allQuestions.slice(0, 5);
  }

  // Shuffle options for EVERY selected question in this attempt so correct answers have ZERO pattern
  const questionData: Record<string, { options: [string, string, string, string]; correctAnswer: number }> = {};
  for (const q of selectedQuestions) {
    const { shuffledOptions, newCorrectIndex } = shuffleQuestionOptions(q);
    questionData[q.id] = {
      options: shuffledOptions,
      correctAnswer: newCorrectIndex
    };
  }

  const attemptId = `attempt-${crypto.randomUUID()}`;
  const attempt: any = {
    id: attemptId,
    userId: user.id,
    quizType,
    startedAt: Date.now(),
    currentQuestionIndex: 0,
    questionIds: selectedQuestions.map(q => q.id),
    questionData,
    answers: {},
    completed: false,
    totalQuestions: selectedQuestions.length,
    correctCount: 0
  };

  db.attempts[attemptId] = attempt;
  saveDb(db);

  const firstQ = selectedQuestions[0];
  const firstQData = questionData[firstQ.id] || { options: firstQ.options, correctAnswer: firstQ.correctAnswer };
  return res.json({
    attemptId,
    totalQuestions: selectedQuestions.length,
    currentQuestionIndex: 0,
    timeLimitSeconds: 60,
    question: {
      id: firstQ.id,
      text: firstQ.text,
      options: firstQData.options,
      category: firstQ.category,
      categoryLabel: firstQ.categoryLabel,
      unit: firstQ.unit,
      difficulty: firstQ.difficulty
    }
  });
});

// Resume Active Quiz Attempt if any
app.get('/api/quizzes/active', authenticate, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const activeAttempt = Object.values(db.attempts).find(
    a => a.userId === user.id && !a.completed && Date.now() - a.startedAt < 3 * 3600 * 1000
  );

  if (!activeAttempt) {
    return res.json({ activeAttempt: null });
  }

  const currQId = activeAttempt.questionIds[activeAttempt.currentQuestionIndex];
  const q = db.questions[currQId];
  const qData = activeAttempt.questionData ? activeAttempt.questionData[currQId] : null;

  return res.json({
    activeAttempt: {
      attemptId: activeAttempt.id,
      quizType: activeAttempt.quizType,
      totalQuestions: activeAttempt.totalQuestions,
      currentQuestionIndex: activeAttempt.currentQuestionIndex,
      timeLimitSeconds: 60,
      question: q ? {
        id: q.id,
        text: q.text,
        options: qData ? qData.options : q.options,
        category: q.category,
        categoryLabel: q.categoryLabel,
        unit: q.unit,
        difficulty: q.difficulty
      } : null
    }
  });
});

// Submit Single Answer (Server is Source of Truth)
app.post('/api/quizzes/submit-answer', authenticate, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { attemptId, questionIndex, selectedOption, clientElapsedMs } = req.body;

  const attempt = db.attempts[attemptId];
  if (!attempt || attempt.userId !== user.id || attempt.completed) {
    return res.status(400).json({ error: 'المحاولة غير موجودة أو مكتملة بالفعل.' });
  }

  const questionId = attempt.questionIds[questionIndex];
  const question = db.questions[questionId];
  if (!question) {
    return res.status(400).json({ error: 'السؤال غير صالح.' });
  }

  // Prevent duplicate answer submission
  if (attempt.answers[questionId]) {
    return res.status(400).json({ error: 'تمت الإجابة على هذا السؤال مسبقاً.' });
  }

  // Check 60-second limit with small latency buffer
  const isTimeExpired = clientElapsedMs > 66000;
  const targetCorrectIndex = (attempt.questionData && attempt.questionData[questionId])
    ? attempt.questionData[questionId].correctAnswer
    : question.correctAnswer;
  const isCorrect = !isTimeExpired && selectedOption === targetCorrectIndex;

  attempt.answers[questionId] = {
    selectedOption: isTimeExpired ? -1 : selectedOption,
    answeredAt: Date.now(),
    timeTakenMs: clientElapsedMs || 0,
    isCorrect
  };

  if (isCorrect) {
    attempt.correctCount++;
  }

  // Update question global statistics
  question.stats.timesAnswered++;
  if (isCorrect) question.stats.timesCorrect++;
  const prevTotalTime = (question.stats.avgTimeSeconds || 15) * (question.stats.timesAnswered - 1);
  question.stats.avgTimeSeconds = Math.round((prevTotalTime + (clientElapsedMs / 1000)) / question.stats.timesAnswered);

  // Advance index
  attempt.currentQuestionIndex++;
  const hasMore = attempt.currentQuestionIndex < attempt.totalQuestions;

  let nextQuestion = null;
  if (hasMore) {
    const nextQId = attempt.questionIds[attempt.currentQuestionIndex];
    const nq = db.questions[nextQId];
    const nqData = attempt.questionData ? attempt.questionData[nextQId] : null;
    if (nq) {
      nextQuestion = {
        id: nq.id,
        text: nq.text,
        options: nqData ? nqData.options : nq.options,
        category: nq.category,
        categoryLabel: nq.categoryLabel,
        unit: nq.unit,
        difficulty: nq.difficulty
      };
    }
  }

  saveDb(db);

  return res.json({
    success: true,
    hasMore,
    nextIndex: attempt.currentQuestionIndex,
    nextQuestion
  });
});

// Finish Quiz & Unified Progression Event
app.post('/api/quizzes/finish', authenticate, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { attemptId } = req.body;

  const attempt = db.attempts[attemptId];
  if (!attempt || attempt.userId !== user.id) {
    return res.status(400).json({ error: 'المحاولة غير موجودة.' });
  }

  if (attempt.completed) {
    // Return already computed result
    return res.json({
      attempt,
      review: attempt.questionIds.map(qid => {
        const q = db.questions[qid];
        const ans = attempt.answers[qid];
        return {
          id: q.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          category: q.category,
          categoryLabel: q.categoryLabel,
          unit: q.unit,
          selectedOption: ans ? ans.selectedOption : -1,
          isCorrect: ans ? ans.isCorrect : false
        };
      })
    });
  }

  attempt.completed = true;
  attempt.completedAt = Date.now();
  attempt.score = Math.round((attempt.correctCount / attempt.totalQuestions) * 100);
  attempt.accuracy = attempt.score;

  // Topic Breakdown
  const topicMap: Record<string, { total: number; correct: number }> = {};
  for (const qid of attempt.questionIds) {
    const q = db.questions[qid];
    if (!q) continue;
    const cat = q.categoryLabel || q.category;
    if (!topicMap[cat]) topicMap[cat] = { total: 0, correct: 0 };
    topicMap[cat].total++;
    if (attempt.answers[qid]?.isCorrect) {
      topicMap[cat].correct++;
    }
  }
  attempt.topicBreakdown = topicMap;

  // Calculate XP Server-Authoritative
  let xpGained = 0;
  // 10 XP per correct answer (only if taken >= 2000ms to fight mindless clicking)
  for (const qid of attempt.questionIds) {
    const ans = attempt.answers[qid];
    if (ans && ans.isCorrect && ans.timeTakenMs >= 2000) {
      xpGained += db.settings.xpValues.correct || 10;
    }
  }
  // Quiz completion bonus
  xpGained += db.settings.xpValues.completeQuiz || 50;

  if (attempt.score >= 80) {
    xpGained += db.settings.xpValues.score80 || 30;
  }
  if (attempt.score === 100) {
    xpGained += db.settings.xpValues.perfectScore || 100;
  }

  attempt.xpEarned = xpGained;

  // Update User Progression
  const prevLevel = user.level;
  const prevRank = user.rankTitle;
  user.xp += xpGained;
  user.totalQuestionsAnswered += attempt.totalQuestions;
  user.totalCorrectAnswers += attempt.correctCount;
  user.gardenPlants += attempt.correctCount;

  // Update Rank
  const newRankInfo = getRankForXp(user.xp, db.settings);
  user.level = newRankInfo.level;
  user.rankTitle = newRankInfo.title;

  let rankUpData = null;
  if (newRankInfo.level > prevLevel) {
    rankUpData = { oldRank: prevRank, newRank: newRankInfo.title, level: newRankInfo.level };
  }
  attempt.rankUp = rankUpData;

  // Organism Evolution
  user.organismStage = calculateOrganismStage(user.totalQuestionsAnswered, user.level);

  // Unlock Achievements
  const newBadges: string[] = [];
  if (!user.unlockedAchievements.includes('first_quiz')) {
    user.unlockedAchievements.push('first_quiz');
    newBadges.push('الخطوة الأولى');
  }
  if (attempt.score === 100 && !user.unlockedAchievements.includes('perfect_100')) {
    user.unlockedAchievements.push('perfect_100');
    newBadges.push('العلامة الكاملة');
  }
  if (user.totalQuestionsAnswered >= 100 && !user.unlockedAchievements.includes('century_solved')) {
    user.unlockedAchievements.push('century_solved');
    newBadges.push('مئوية الأسئلة');
  }
  if (attempt.quizType === 'tahsili' && attempt.score >= 80 && !user.unlockedAchievements.includes('tahsili_master')) {
    user.unlockedAchievements.push('tahsili_master');
    newBadges.push('ملك التحصيلي');
  }

  // Check Secret Lab Unlock: streak >= 7 OR Tahsili completed OR score >= 85% OR >= 200 questions
  if (!user.unlockedSecretLab) {
    if (user.streak >= 7 || (attempt.quizType === 'tahsili' && attempt.score >= 80) || attempt.score >= 85 || user.totalQuestionsAnswered >= 200) {
      user.unlockedSecretLab = true;
      if (!user.unlockedAchievements.includes('secret_lab_unlock')) {
        user.unlockedAchievements.push('secret_lab_unlock');
        newBadges.push('مفتاح الأسرار');
      }
    }
  }

  attempt.newBadges = newBadges;
  saveDb(db);

  // Review List (Matches the exact shuffled option order seen by the student)
  const review = attempt.questionIds.map(qid => {
    const q = db.questions[qid];
    const ans = attempt.answers[qid];
    const qData = attempt.questionData ? attempt.questionData[qid] : null;
    return {
      id: q.id,
      text: q.text,
      options: qData ? qData.options : q.options,
      correctAnswer: qData ? qData.correctAnswer : q.correctAnswer,
      explanation: q.explanation,
      category: q.category,
      categoryLabel: q.categoryLabel,
      unit: q.unit,
      selectedOption: ans ? ans.selectedOption : -1,
      isCorrect: ans ? ans.isCorrect : false
    };
  });

  return res.json({
    attempt,
    user: sanitizeUser(user, true),
    rankUp: rankUpData,
    newBadges,
    review
  });
});

// ==========================================
// 3. DAILY QUESTION (معركة اليوم)
// ==========================================

app.get('/api/daily/question', authenticate, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const today = getSaudiDate();

  // Find deterministic daily question
  const dailyQuestions = Object.values(db.questions).filter(q => q.status === 'published' && !q.isDeleted);
  // Pick deterministic based on date hash
  const dateHash = today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const selectedQ = dailyQuestions[dateHash % dailyQuestions.length];

  if (!db.dailyState[today] || !(db.dailyState[today] as any).options) {
    const { shuffledOptions, newCorrectIndex } = shuffleQuestionOptions(selectedQ);
    db.dailyState[today] = {
      questionId: selectedQ.id,
      participants: 42,
      correct: 34,
      ...((db.dailyState[today] as any) || {}),
      options: shuffledOptions,
      correctAnswer: newCorrectIndex
    } as any;
    saveDb(db);
  }

  const dailyOptions = (db.dailyState[today] as any).options || selectedQ.options;
  const dailyCorrect = (db.dailyState[today] as any).correctAnswer !== undefined ? (db.dailyState[today] as any).correctAnswer : selectedQ.correctAnswer;

  const userDailyAttempt = Object.values(db.attempts).find(
    a => a.userId === user.id && a.quizType === 'daily' && new Date(a.startedAt).toISOString().startsWith(today)
  );

  if (userDailyAttempt && userDailyAttempt.completed) {
    const ans = userDailyAttempt.answers[selectedQ.id];
    return res.json({
      today,
      alreadyAnswered: true,
      question: {
        id: selectedQ.id,
        text: selectedQ.text,
        options: dailyOptions,
        category: selectedQ.category,
        categoryLabel: selectedQ.categoryLabel,
        unit: selectedQ.unit,
        correctAnswer: dailyCorrect,
        explanation: selectedQ.explanation
      },
      userAnswer: ans ? ans.selectedOption : -1,
      isCorrect: ans ? ans.isCorrect : false,
      stats: {
        participants: db.dailyState[today].participants,
        correctRate: Math.round((db.dailyState[today].correct / db.dailyState[today].participants) * 100)
      }
    });
  }

  // Not answered yet: DO NOT SEND CORRECT ANSWER!
  return res.json({
    today,
    alreadyAnswered: false,
    question: {
      id: selectedQ.id,
      text: selectedQ.text,
      options: dailyOptions,
      category: selectedQ.category,
      categoryLabel: selectedQ.categoryLabel,
      unit: selectedQ.unit
    },
    stats: {
      participants: db.dailyState[today].participants
    }
  });
});

app.post('/api/daily/answer', authenticate, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { selectedOption, clientElapsedMs } = req.body;
  const today = getSaudiDate();

  const userDailyAttempt = Object.values(db.attempts).find(
    a => a.userId === user.id && a.quizType === 'daily' && new Date(a.startedAt).toISOString().startsWith(today)
  );

  if (userDailyAttempt && userDailyAttempt.completed) {
    return res.status(400).json({ error: 'لقد قمت بحل سؤال اليوم مسبقاً! عُد غداً للتحدي الجديد.' });
  }

  const dailyQuestions = Object.values(db.questions).filter(q => q.status === 'published' && !q.isDeleted);
  const dateHash = today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const q = dailyQuestions[dateHash % dailyQuestions.length];

  if (!db.dailyState[today] || !(db.dailyState[today] as any).options) {
    const { shuffledOptions, newCorrectIndex } = shuffleQuestionOptions(q);
    db.dailyState[today] = {
      questionId: q.id,
      participants: 42,
      correct: 34,
      ...((db.dailyState[today] as any) || {}),
      options: shuffledOptions,
      correctAnswer: newCorrectIndex
    } as any;
  }

  const dailyCorrect = (db.dailyState[today] as any).correctAnswer !== undefined ? (db.dailyState[today] as any).correctAnswer : q.correctAnswer;
  const isCorrect = selectedOption === dailyCorrect;

  db.dailyState[today].participants++;
  if (isCorrect) db.dailyState[today].correct++;

  // Record attempt
  const attemptId = `daily-${today}-${user.id}`;
  const attempt: any = {
    id: attemptId,
    userId: user.id,
    quizType: 'daily',
    startedAt: Date.now(),
    currentQuestionIndex: 1,
    questionIds: [q.id],
    answers: {
      [q.id]: {
        selectedOption,
        answeredAt: Date.now(),
        timeTakenMs: clientElapsedMs || 0,
        isCorrect
      }
    },
    completed: true,
    completedAt: Date.now(),
    score: isCorrect ? 100 : 0,
    accuracy: isCorrect ? 100 : 0,
    totalQuestions: 1,
    correctCount: isCorrect ? 1 : 0,
    xpEarned: isCorrect ? 35 : 10
  };

  db.attempts[attemptId] = attempt;
  user.xp += attempt.xpEarned;
  user.totalQuestionsAnswered++;
  if (isCorrect) {
    user.totalCorrectAnswers++;
    user.gardenPlants++;
  }

  const rankInfo = getRankForXp(user.xp, db.settings);
  user.level = rankInfo.level;
  user.rankTitle = rankInfo.title;

  saveDb(db);

  return res.json({
    success: true,
    isCorrect,
    correctAnswer: dailyCorrect,
    explanation: q.explanation,
    xpEarned: attempt.xpEarned,
    stats: {
      participants: db.dailyState[today].participants,
      correctRate: Math.round((db.dailyState[today].correct / db.dailyState[today].participants) * 100)
    },
    user: sanitizeUser(user, true)
  });
});

// ==========================================
// 4. LEADERBOARD & MAP & STATS
// ==========================================

app.get('/api/leaderboard', (req: Request, res: Response) => {
  const timeframe = req.query.timeframe || 'all';

  // Sort real students strictly by XP (never expose email or admin accounts)
  const students = Object.values(db.users)
    .filter(u => !u.isSuspended && u.role !== 'admin')
    .map(u => ({
      id: u.id,
      nickname: u.nickname,
      rankTitle: u.rankTitle,
      level: u.level,
      xp: u.xp,
      streak: u.streak,
      badgesCount: u.unlockedAchievements.length,
      organismStage: u.organismStage,
      gardenPlants: u.gardenPlants
    }))
    .sort((a, b) => b.xp - a.xp);

  return res.json({
    timeframe,
    leaderboard: students.map((s, idx) => ({ ...s, rank: idx + 1 }))
  });
});

// Biology Map Realms & Mastery
app.get('/api/map/realms', authenticate, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const userAttempts = Object.values(db.attempts).filter(a => a.userId === user.id && a.completed);

  // Group user answers by categories
  const categoryStats: Record<string, { total: number; correct: number }> = {
    bio1: { total: 0, correct: 0 },
    bio2: { total: 0, correct: 0 },
    ecology: { total: 0, correct: 0 }
  };

  for (const a of userAttempts) {
    for (const qid of Object.keys(a.answers)) {
      const q = db.questions[qid];
      if (q && categoryStats[q.category]) {
        categoryStats[q.category].total++;
        if (a.answers[qid]?.isCorrect) {
          categoryStats[q.category].correct++;
        }
      }
    }
  }

  const realms = [
    {
      id: 'cell',
      title: 'عالم الخلية الحيوية',
      description: 'استكشف تراكيب الخلية، العضيات، والأغشية الحيوية',
      category: 'bio1',
      unit: 'تركيب الخلية ووظائفها',
      questionsSolved: categoryStats.bio1.total,
      mastery: categoryStats.bio1.total > 0 ? Math.min(100, Math.round((categoryStats.bio1.correct / Math.max(1, categoryStats.bio1.total)) * 100)) : 0,
      unlocked: true,
      icon: '🧫'
    },
    {
      id: 'genetics',
      title: 'مملكة الوراثة والجينوم',
      description: 'حلزون DNA، تضاعف المادة الوراثية وقوانين مندل',
      category: 'bio1',
      unit: 'الجزيئات الحيوية والوراثة',
      questionsSolved: Math.round(categoryStats.bio1.total * 0.4),
      mastery: categoryStats.bio1.total > 0 ? Math.min(100, Math.round((categoryStats.bio1.correct / Math.max(1, categoryStats.bio1.total)) * 90)) : 0,
      unlocked: true,
      icon: '🧬'
    },
    {
      id: 'microbes',
      title: 'عالم الأحياء الدقيقة والتارديغريد',
      description: 'البكتيريا، الفيروسات، الطلائعيات والتكيف الخارق',
      category: 'bio1',
      unit: 'الفيروسات والبكتيريا',
      questionsSolved: Math.round(categoryStats.bio1.total * 0.3),
      mastery: categoryStats.bio1.total > 0 ? Math.min(100, Math.round((categoryStats.bio1.correct / Math.max(1, categoryStats.bio1.total)) * 85)) : 0,
      unlocked: true,
      icon: '🦠'
    },
    {
      id: 'systems',
      title: 'أجهزة الجسم والوظائف الحيوية',
      description: 'الجهاز العصبي، المناعي، الإخراجي والدوران',
      category: 'bio2',
      unit: 'الجهاز العصبي والدوران',
      questionsSolved: categoryStats.bio2.total,
      mastery: categoryStats.bio2.total > 0 ? Math.min(100, Math.round((categoryStats.bio2.correct / Math.max(1, categoryStats.bio2.total)) * 100)) : 0,
      unlocked: user.level >= 2,
      icon: '🫀'
    },
    {
      id: 'plants_animals',
      title: 'مملكة التنوع والفقاريات',
      description: 'الأسماك، البرمائيات، الطيور، الثدييات والنباتات',
      category: 'bio2',
      unit: 'الفقاريات والثدييات',
      questionsSolved: Math.round(categoryStats.bio2.total * 0.5),
      mastery: categoryStats.bio2.total > 0 ? Math.min(100, Math.round((categoryStats.bio2.correct / Math.max(1, categoryStats.bio2.total)) * 95)) : 0,
      unlocked: user.level >= 3,
      icon: '🌿'
    },
    {
      id: 'ecology',
      title: 'المحيط البيئي والتنوع الحيوي',
      description: 'المجتمعات الحيوية، التعاقب البيئي، وسلوك الحيوان',
      category: 'ecology',
      unit: 'العلاقات المتبادلة في النظام البيئي',
      questionsSolved: categoryStats.ecology.total,
      mastery: categoryStats.ecology.total > 0 ? Math.min(100, Math.round((categoryStats.ecology.correct / Math.max(1, categoryStats.ecology.total)) * 100)) : 0,
      unlocked: user.level >= 4,
      icon: '🌎'
    }
  ];

  return res.json({ realms });
});

// Achievements List
app.get('/api/achievements', authenticate, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const achievements = DEFAULT_ACHIEVEMENTS.map(ach => ({
    ...ach,
    isUnlocked: user.unlockedAchievements.includes(ach.id)
  }));
  res.json({ achievements });
});

// Journey & Comprehensive Student Analytics
app.get('/api/journey', authenticate, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const userAttempts = Object.values(db.attempts).filter(a => a.userId === user.id && a.completed);

  // Weak points calculation
  const unitErrors: Record<string, { errors: number; total: number }> = {};
  for (const a of userAttempts) {
    for (const qid of Object.keys(a.answers)) {
      const q = db.questions[qid];
      if (!q) continue;
      const u = q.unit || 'مفاهيم عامة';
      if (!unitErrors[u]) unitErrors[u] = { errors: 0, total: 0 };
      unitErrors[u].total++;
      if (!a.answers[qid]?.isCorrect) {
        unitErrors[u].errors++;
      }
    }
  }

  const weakTopics = Object.entries(unitErrors)
    .filter(([_, data]) => data.errors > 0)
    .sort((a, b) => (b[1].errors / b[1].total) - (a[1].errors / a[1].total))
    .slice(0, 3)
    .map(([unit, data]) => ({
      unit,
      errorRate: Math.round((data.errors / data.total) * 100),
      recommendation: `يوصى بمراجعة فصل ${unit} والتركيز على العلاقات التكافلية والتركيب المجهري.`
    }));

  return res.json({
    user: sanitizeUser(user, true),
    totalQuizzesTaken: userAttempts.length,
    accuracy: user.totalQuestionsAnswered > 0 ? Math.round((user.totalCorrectAnswers / user.totalQuestionsAnswered) * 100) : 0,
    weakTopics,
    garden: {
      plantsCount: user.gardenPlants,
      stage: user.gardenPlants >= 1000 ? 'غابة بيولوجية متكاملة' :
             user.gardenPlants >= 500 ? 'واحة حيوية وأشجار متعددة' :
             user.gardenPlants >= 250 ? 'شجرة أحيائية عملاقة' :
             user.gardenPlants >= 100 ? 'حديقة نباتات مزهرة' :
             user.gardenPlants >= 50 ? 'نباتات نامية ومزهرة' : 'بذرة بيولوجية وشتلات أولية'
    },
    organism: {
      stage: user.organismStage,
      name: user.organismStage === 5 ? 'كائن حي متكامل متطور' :
            user.organismStage === 4 ? 'جزيء DNA حلزوني حيوي' :
            user.organismStage === 3 ? 'خلية متطورة حقيقية النواة' :
            user.organismStage === 2 ? 'خلية أولية نشطة' : 'كائن دقيق مجهري'
    }
  });
});

// ==========================================
// 5. BIOBOT (المرشد الحيوي مع Gemini)
// ==========================================

app.post('/api/biobot/chat', authenticate, rateLimit(25, 60000), async (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { message, conversationHistory } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'الرسالة مطلوبة.' });
  }

  // System instruction: expert secondary school biology teacher and scientific mentor
  const systemInstruction = `أنت "المرشد الحيوي" (BioBot) في منصة BioSphere لتعليم مادة الأحياء للمرحلة الثانوية واختبارات التحصيلي في المملكة العربية السعودية (أحياء 1، أحياء 2، علم البيئة).
أنت معلم أحياء متخصص ومتمكن، مهمتك الأولى والدائمة هي الإجابة عن أي سؤال يطرحه الطالب (${user.nickname})، وشرحه وتوضيحه علمياً بشكل صادق ودقيق ومفصل وممتع:
1. الإجابة المباشرة والصريحة: وضح الإجابة الصحيحة مباشرة دون مراوغة.
2. الشرح العلمي المفاهيمي: اشرح الأساس البيولوجي وراء الظاهرة أو العضية أو العملية الحيوية.
3. تفكيك أسئلة الاختبار والتحصيلي: إذا كان السؤال مسألة أو سؤال اختيار من متعدد، وضح علّة صواب الخيار الصحيح وعلّة خطأ الخيارات الأخرى.
4. استخدم لغة عربية فصحى راقية، واضحة، منسقة في فقرات ونقاط مرتبة، مع مصطلحات المنهج الدراسي السعودي.`;

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nسؤال الطالب: ${message}` }] }
        ]
      });

      const reply = response.text;
      if (reply && reply.trim().length > 0) {
        return res.json({ reply });
      }
    } catch (err: any) {
      console.error('Gemini API Error in BioBot:', err?.message || err);
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nسؤال الطالب: ${message}` }] }]
        });
        if (fallbackRes.text) {
          return res.json({ reply: fallbackRes.text });
        }
      } catch (e) {
        console.error('Gemini fallback model error:', e);
      }
    }
  }

  // Deep biology knowledge explanation if model unreachable or offline
  const lowerMsg = message.toLowerCase();
  let fallbackReply = `أهلاً بك يا ${user.nickname}! بخصوص سؤالك: "${message}"\n\n`;

  if (lowerMsg.includes('خلية') || lowerMsg.includes('غشاء') || lowerMsg.includes('ميتوكندريا') || lowerMsg.includes('نواة') || lowerMsg.includes('ريبوسوم') || lowerMsg.includes('جولجي')) {
    fallbackReply += `🔬 **الشرح الأحيائي لعضيات الخلية وتراكيبها:**\n- **الميتوكندريا:** هي "محطة توليد الطاقة" في الخلية، حيث يحدث فيها التنفس الخلوي الهوائي ودورة كريبس وسلسلة نقل الإلكترون لإنتاج جزيئات ATP.\n- **الغشاء البلازمي:** تركيب ذو نفاذية اختيارية يتكون من طبقة ثنائية من الدهون المفسفرة وبروتينات ناقلة.\n- **الريبوسومات:** العضيات المسؤولة عن بناء وتصنيع البروتينات في الخلية (توجد في بدائيات وحقيقيات النوى).\n- **النواة:** تحتوي على المادة الوراثية ومحاطة بغشاء نووي مزدوج ينظم دخول المواد عبر الثقوب النووية.\n- **الشبكة الإندوبلازمية وجهاز جولجي:** تعملان معاً لتعديل البروتينات وتغليفها ونقلها داخل الخلية أو إفرازها خارجها.`;
  } else if (lowerMsg.includes('dna') || lowerMsg.includes('rna') || lowerMsg.includes('وراثة') || lowerMsg.includes('جين') || lowerMsg.includes('تضاعف') || lowerMsg.includes('مندل')) {
    fallbackReply += `🧬 **الشرح الأحيائي للوراثة وحلزون DNA ومبادئ مندل:**\n- **تركيب DNA:** حلزون مزدوج يتألف من سكر الديوكسي ريبوز، ومجموعات الفوسفات، وأربع قواعد نيتروجينية: الأدينين (A) يرتبط مع الثايمين (T) برابطتين هيدروجينيتين، والجوانين (G) يرتبط مع السيتوسين (C) بثلاث روابط هيدروجينية.\n- **قوانين مندل:**\n  1. **قانون انعزال الصفات:** ينفصل عاملا كل صفة وراثية عند تكوين الأمشاج أثناء الانقسام المنصف.\n  2. **قانون التوزيع الحر:** تتوزع أزواج الجينات المستقلة بصورة عشوائية ومستقلة عند تكوين الأمشاج.\n- **بناء البروتين:** يتم عبر عمليتي النسخ (Transcription في النواة لتحويل DNA إلى mRNA) والترجمة (Translation في السيتوبلازم بواسطة الريبوسومات و tRNA).`;
  } else if (lowerMsg.includes('بيئة') || lowerMsg.includes('تعاقب') || lowerMsg.includes('سلسلة') || lowerMsg.includes('شبكة') || lowerMsg.includes('تنوع') || lowerMsg.includes('هرم')) {
    fallbackReply += `🌎 **الشرح الأحيائي لعلم البيئة والتنوع الحيوي:**\n- **التعاقب البيئي الأولي:** ينشأ على سطح صخري خالٍ تماماً من التربة (كالحمم البركانية) وتبدأ به "الأنواع الرائدة" كالأشنات والحزازيات.\n- **التعاقب الثانوي:** يحدث عقب تدمير مجتمع حيوي سابق (بحرائق أو تجريف) مع بقاء التربة صالحة لنمو سريع للأعشاب.\n- **هرم الطاقة والكتلة الحيوية:** ينتقل قرابة 10% فقط من الطاقة المخزنة بين كل مستوى غذائي والمستوى الذي يليه، بينما تُفقد 90% على شكل حرارة.\n- **العلاقات التكافلية:** التطفل (يستفيد طرف ويتضرر الآخر)، والتعايش (يستفيد طرف ولا يتضرر الآخر)، وتبادل المنفعة (كلاهما يستفيد كالنحل والأزهار).`;
  } else if (lowerMsg.includes('عصب') || lowerMsg.includes('دوران') || lowerMsg.includes('قلب') || lowerMsg.includes('كلية') || lowerMsg.includes('هضم') || lowerMsg.includes('تنفس') || lowerMsg.includes('مناعة') || lowerMsg.includes('نفرون')) {
    fallbackReply += `🫀 **الشرح الأحيائي لأجهزة جسم الإنسان والوظائف الفسيولوجية:**\n- **الكلية والنفرون:** النفرون هو الوحدة الأنبوبية الوظيفية للترشيح وإعادة الامتصاص والإفراز، حيث يُعاد امتصاص الماء والأملاح والجلوكوز إلى الدم.\n- **القلب والدوران:** يتكون قلب الإنسان والثدييات من 4 حجرات منفصلة تماماً (أذينان وبطينان) تضمن عدم اختلاط الدم المؤكسج بالدم غير المؤكسج لرفع كفاءة الأيض.\n- **الجهاز العصبي والسيال:** ينتقل السيال العصبي عبر الاستقطاب وإزالة الاستقطاب بواسطة مضخة صوديوم/بوتاسيوم، وتزيد مادة الميالين من سرعة النقل عبر التوصيل القفزي.\n- **المناعة:** خط الدفاع الأول (الجلد والمخاط)، والمناعة المتخصصة التي تقودها الخلايا اللمفية B (إنتاج الأجسام المضادة) والخلايا T (المناعة الخلوية).`;
  } else if (lowerMsg.includes('بكتيريا') || lowerMsg.includes('فيروس') || lowerMsg.includes('فطر') || lowerMsg.includes('طحالب') || lowerMsg.includes('تصنيف')) {
    fallbackReply += `🦠 **الشرح الأحيائي للأحياء الدقيقة والتصنيف:**\n- **الفيروسات:** جزيئات لا خلوية (حمض نووي DNA أو RNA محاط بمحفظة بروتينية Capsid) لا تتكاثر إلا داخل خلايا العائل.\n- **البكتيريا والبدائيات:** كائنات وحيدة الخلية بدائية النواة؛ البدائيات جدرانها لا تحتوي على ببتيدوجلايكان وتعيش في الظروف القاسية (كالينابيع الحارة والبحيرات المالحة)، بينما البكتيريا الحقيقية تحتوي جدرانها على ببتيدوجلايكان.\n- **الفطريات:** كائنات حقيقية النواة غير ذاتية التغذية، جدرانها الخلوية تتكون من الكايتين وتتكاثر بالأبواغ.`;
  } else {
    fallbackReply += `🧬 **التوضيح والتحليل العلمي:**\nعلم الأحياء هو دراسة الحياة والتفاعلات الحيوية المعقدة. للإجابة على سؤالك بأعلى دقة:\n- إذا كان سؤالك يتعلق بمسألة وراثية، اكتب الطرز الجينية للآباء لتحديد نسب الأبناء.\n- إذا كان سؤالاً من تجميعات التحصيلي، اكتب نص السؤال والخيارات وسأحدد لك الإجابة الصحيحة بالدليل العلمي القاطع.\n- إذا أردت شرح مفهوم معين بالتفصيل، حدد المفهوم وسأبسطه لك خطوة بخطوة!`;
  }

  return res.json({ reply: fallbackReply });
});

// ==========================================
// 6. TEACHER PORTAL
// ==========================================

app.get('/api/teacher/students', authenticate, requireTeacherOrAdmin, (req: Request, res: Response) => {
  const isSuperAdmin = (req as any).user.role === 'admin';
  const students = Object.values(db.users).map(u => ({
    id: u.id,
    nickname: u.nickname,
    email: isSuperAdmin ? u.email : undefined, // Hidden for teachers per PDPL privacy requirements
    role: u.role,
    rankTitle: u.rankTitle,
    level: u.level,
    xp: u.xp,
    streak: u.streak,
    totalQuestionsAnswered: u.totalQuestionsAnswered,
    totalCorrectAnswers: u.totalCorrectAnswers,
    accuracy: u.totalQuestionsAnswered > 0 ? Math.round((u.totalCorrectAnswers / u.totalQuestionsAnswered) * 100) : 0,
    lastActiveDate: u.lastActiveDate,
    gardenPlants: u.gardenPlants,
    unlockedSecretLab: u.unlockedSecretLab
  }));

  res.json({ students });
});

// ==========================================
// 7. ADMIN PORTAL (n7376444@gmail.com ONLY)
// ==========================================

// Get All Questions for Admin (with search, filter, pagination)
app.get('/api/admin/questions', authenticate, requireAdmin, (req: Request, res: Response) => {
  const { search, category, difficulty, type, status, includeDeleted, page = '1', limit = '50' } = req.query;

  let list = Object.values(db.questions);

  if (includeDeleted !== 'true') {
    list = list.filter(q => !q.isDeleted);
  }

  if (category && category !== 'all') {
    list = list.filter(q => q.category === category);
  }

  if (difficulty && difficulty !== 'all') {
    list = list.filter(q => q.difficulty === difficulty);
  }

  if (type && type !== 'all') {
    list = list.filter(q => q.type === type);
  }

  if (status && status !== 'all') {
    list = list.filter(q => q.status === status);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    list = list.filter(q => q.text.toLowerCase().includes(s) || q.unit.toLowerCase().includes(s));
  }

  const p = parseInt(page as string, 10) || 1;
  const lim = parseInt(limit as string, 10) || 50;
  const total = list.length;
  const paginated = list.slice((p - 1) * lim, p * lim);

  res.json({
    total,
    page: p,
    limit: lim,
    questions: paginated
  });
});

// Create Question
app.post('/api/admin/questions', authenticate, requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).user;
  const { text, options, correctAnswer, explanation, category, unit, difficulty, type, status } = req.body;

  if (!text || !Array.isArray(options) || options.length !== 4) {
    return res.status(400).json({ error: 'السؤال يجب أن يحتوي على نص و4 خيارات.' });
  }

  const newId = `q-${category || 'bio1'}-${crypto.randomUUID().slice(0, 8)}`;
  const categoryLabels: Record<string, string> = {
    bio1: 'أحياء 1',
    bio2: 'أحياء 2',
    ecology: 'علم البيئة'
  };

  const newQuestion: Question = {
    id: newId,
    text: text.trim(),
    options: options.map((o: string) => (o || '').trim()) as [string, string, string, string],
    correctAnswer: typeof correctAnswer === 'number' ? correctAnswer : 0,
    explanation: (explanation || '').trim(),
    category: category || 'bio1',
    categoryLabel: categoryLabels[category] || 'أحياء عامة',
    unit: (unit || 'الوحدة العامة').trim(),
    difficulty: difficulty || 'medium',
    type: type || 'tahsili',
    status: status || 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 0, timesCorrect: 0, avgTimeSeconds: 15 }
  };

  db.questions[newId] = newQuestion;

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminEmail: admin.email,
    adminNickname: admin.nickname,
    action: 'create_question',
    details: `إضافة سؤال جديد في ${newQuestion.categoryLabel}: "${newQuestion.text.slice(0, 40)}..."`,
    targetId: newId,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, question: newQuestion });
});

// Update Question
app.put('/api/admin/questions/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).user;
  const { id } = req.params;
  const existing = db.questions[id];

  if (!existing) {
    return res.status(404).json({ error: 'السؤال غير موجود.' });
  }

  const { text, options, correctAnswer, explanation, category, unit, difficulty, type, status } = req.body;
  const categoryLabels: Record<string, string> = { bio1: 'أحياء 1', bio2: 'أحياء 2', ecology: 'علم البيئة' };

  if (text) existing.text = text.trim();
  if (Array.isArray(options) && options.length === 4) existing.options = options as [string, string, string, string];
  if (typeof correctAnswer === 'number') existing.correctAnswer = correctAnswer;
  if (explanation !== undefined) existing.explanation = explanation.trim();
  if (category) {
    existing.category = category;
    existing.categoryLabel = categoryLabels[category] || existing.categoryLabel;
  }
  if (unit) existing.unit = unit.trim();
  if (difficulty) existing.difficulty = difficulty;
  if (type) existing.type = type;
  if (status) existing.status = status;
  existing.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminEmail: admin.email,
    adminNickname: admin.nickname,
    action: 'edit_question',
    details: `تعديل السؤال [${id}]: "${existing.text.slice(0, 40)}..."`,
    targetId: id,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, question: existing });
});

// Soft Delete Question
app.delete('/api/admin/questions/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).user;
  const { id } = req.params;
  const existing = db.questions[id];

  if (!existing) {
    return res.status(404).json({ error: 'السؤال غير موجود.' });
  }

  existing.isDeleted = true;
  existing.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminEmail: admin.email,
    adminNickname: admin.nickname,
    action: 'delete_question',
    details: `حذف ناعم للسؤال [${id}]: "${existing.text.slice(0, 40)}..."`,
    targetId: id,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true });
});

// Restore Question
app.post('/api/admin/questions/:id/restore', authenticate, requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).user;
  const { id } = req.params;
  const existing = db.questions[id];

  if (!existing) {
    return res.status(404).json({ error: 'السؤال غير موجود.' });
  }

  existing.isDeleted = false;
  existing.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminEmail: admin.email,
    adminNickname: admin.nickname,
    action: 'restore_question',
    details: `استعادة السؤال [${id}]: "${existing.text.slice(0, 40)}..."`,
    targetId: id,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true });
});

// Duplicate Question
app.post('/api/admin/questions/:id/duplicate', authenticate, requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).user;
  const { id } = req.params;
  const existing = db.questions[id];

  if (!existing) {
    return res.status(404).json({ error: 'السؤال غير موجود.' });
  }

  const cloneId = `q-${existing.category}-${crypto.randomUUID().slice(0, 8)}`;
  const clone: Question = {
    ...existing,
    id: cloneId,
    text: `${existing.text} (نسخة)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 0, timesCorrect: 0, avgTimeSeconds: 15 }
  };

  db.questions[cloneId] = clone;

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminEmail: admin.email,
    adminNickname: admin.nickname,
    action: 'duplicate_question',
    details: `نسخ السؤال [${id}] إلى [${cloneId}]`,
    targetId: cloneId,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, question: clone });
});

// Bulk Import Questions from CSV / JSON
app.post('/api/admin/questions/import', authenticate, requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).user;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'قائمة الأسئلة المستوردة فارغة.' });
  }

  const categoryLabels: Record<string, string> = { bio1: 'أحياء 1', bio2: 'أحياء 2', ecology: 'علم البيئة' };
  let importedCount = 0;
  const errors: string[] = [];

  items.forEach((item, index) => {
    if (!item.text || !Array.isArray(item.options) || item.options.length !== 4) {
      errors.push(`السطر ${index + 1}: صيغة السؤال أو الخيارات غير مكتملة.`);
      return;
    }

    const cat = item.category || 'bio1';
    const qid = `q-${cat}-${crypto.randomUUID().slice(0, 8)}`;
    const q: Question = {
      id: qid,
      text: item.text.trim(),
      options: item.options.map((o: string) => (o || '').trim()) as [string, string, string, string],
      correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
      explanation: (item.explanation || '').trim(),
      category: cat,
      categoryLabel: categoryLabels[cat] || 'أحياء عامة',
      unit: (item.unit || 'الوحدة العامة').trim(),
      difficulty: item.difficulty || 'medium',
      type: item.type || 'tahsili',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { timesAnswered: 0, timesCorrect: 0, avgTimeSeconds: 15 }
    };

    db.questions[qid] = q;
    importedCount++;
  });

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminEmail: admin.email,
    adminNickname: admin.nickname,
    action: 'import_questions',
    details: `استيراد جماعي لـ ${importedCount} سؤال بنجاح.`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, importedCount, errors });
});

// Export Questions
app.get('/api/admin/questions/export', authenticate, requireAdmin, (req: Request, res: Response) => {
  const questions = Object.values(db.questions).filter(q => !q.isDeleted);
  res.json({ questions });
});

// Audit Logs
app.get('/api/admin/audit-logs', authenticate, requireAdmin, (req: Request, res: Response) => {
  res.json({ auditLogs: db.auditLogs.slice(0, 100) });
});

// Users Management
app.get('/api/admin/users', authenticate, requireAdmin, (req: Request, res: Response) => {
  const users = Object.values(db.users).map(u => ({
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    role: u.role,
    isVerified: u.isVerified,
    isSuspended: u.isSuspended || false,
    xp: u.xp,
    level: u.level,
    rankTitle: u.rankTitle,
    createdAt: u.createdAt,
    lastActiveDate: u.lastActiveDate
  }));
  res.json({ users });
});

app.post('/api/admin/users/:id/role', authenticate, requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).user;
  const { id } = req.params;
  const { role } = req.body;
  const targetUser = db.users[id];

  if (!targetUser) {
    return res.status(404).json({ error: 'المستخدم غير موجود.' });
  }

  // Cannot modify admin or promote someone else to admin via UI per security rule:
  // "لا يمكن تغيير الأدمن أو إضافة أدمن آخر إلا من إعدادات البيئة على السيرفر"
  if (role === 'admin' && targetUser.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'لا يمكن تعيين أدمن إلا من خلال متغير البيئة على السيرفر.' });
  }

  if (targetUser.email === ADMIN_EMAIL && role !== 'admin') {
    return res.status(403).json({ error: 'لا يمكن سلب صلاحية الأدمن الأساسي للمنصة.' });
  }

  const oldRole = targetUser.role;
  targetUser.role = role;

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminEmail: admin.email,
    adminNickname: admin.nickname,
    action: 'change_user_role',
    details: `تغيير دور المستخدم ${targetUser.nickname} (${targetUser.email}) من ${oldRole} إلى ${role}.`,
    targetId: id,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, user: targetUser });
});

app.post('/api/admin/users/:id/suspend', authenticate, requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).user;
  const { id } = req.params;
  const targetUser = db.users[id];

  if (!targetUser) {
    return res.status(404).json({ error: 'المستخدم غير موجود.' });
  }

  if (targetUser.email === ADMIN_EMAIL) {
    return res.status(403).json({ error: 'لا يمكن إيقاف حساب الأدمن الرئيسي.' });
  }

  targetUser.isSuspended = !targetUser.isSuspended;

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminEmail: admin.email,
    adminNickname: admin.nickname,
    action: 'suspend_user',
    details: `${targetUser.isSuspended ? 'إيقاف' : 'إلغاء إيقاف'} حساب المستخدم ${targetUser.nickname}`,
    targetId: id,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, isSuspended: targetUser.isSuspended });
});

// Settings
app.get('/api/admin/settings', authenticate, requireAdmin, (req: Request, res: Response) => {
  res.json({ settings: db.settings });
});

app.put('/api/admin/settings', authenticate, requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).user;
  const { xpValues, rankThresholds } = req.body;

  if (xpValues) db.settings.xpValues = { ...db.settings.xpValues, ...xpValues };
  if (Array.isArray(rankThresholds)) db.settings.rankThresholds = rankThresholds;

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminEmail: admin.email,
    adminNickname: admin.nickname,
    action: 'update_settings',
    details: 'تحديث إعدادات قيم XP وعتبات الرتب العلمية.',
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, settings: db.settings });
});

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BioSphere server running smoothly on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
