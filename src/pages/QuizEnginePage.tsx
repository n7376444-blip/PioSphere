import React, { useState, useEffect, useRef } from 'react';
import { Clock, ArrowLeft, CheckCircle2, XCircle, Award, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import { Question, ReviewQuestion } from '../types.ts';

interface QuizEnginePageProps {
  quizType: 'tahsili' | 'post_unit' | 'daily' | 'secret_lab';
  category?: 'bio1' | 'bio2' | 'ecology';
  onExit: () => void;
  onRefreshUser: () => void;
  onTriggerCelebration: (data: { type: 'rank_up' | 'badge'; title: string; subtitle: string; badge?: string }) => void;
}

export const QuizEnginePage: React.FC<QuizEnginePageProps> = ({
  quizType,
  category,
  onExit,
  onRefreshUser,
  onTriggerCelebration
}) => {
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // 60-second question timer
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Results State
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [reviewList, setReviewList] = useState<ReviewQuestion[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const token = localStorage.getItem('biosphere_token');

  // Start or resume quiz attempt
  useEffect(() => {
    let isMounted = true;

    async function initQuiz() {
      setLoading(true);
      setErrorNotice(null);

      try {
        // First check for active ongoing attempt
        const activeRes = await fetch('/api/quizzes/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const activeData = await activeRes.json();

        if (isMounted && activeData.activeAttempt && activeData.activeAttempt.quizType === quizType) {
          // Resume existing attempt
          const a = activeData.activeAttempt;
          setAttemptId(a.attemptId);
          setTotalQuestions(a.totalQuestions);
          setCurrentIndex(a.currentQuestionIndex);
          setCurrentQuestion(a.question);
          setSecondsRemaining(60);
          startTimeRef.current = Date.now();
          setLoading(false);
          return;
        }

        // Otherwise create new attempt
        const startRes = await fetch('/api/quizzes/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quizType, category })
        });

        const startData = await startRes.json();
        if (!startRes.ok) {
          throw new Error(startData.error || 'تعذر بدء الاختبار');
        }

        if (isMounted) {
          setAttemptId(startData.attemptId);
          setTotalQuestions(startData.totalQuestions);
          setCurrentIndex(0);
          setCurrentQuestion(startData.question);
          setSecondsRemaining(60);
          startTimeRef.current = Date.now();
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorNotice(err.message || 'حدث خطأ أثناء تحميل الاختبار');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initQuiz();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizType, category, token]);

  // 60-second countdown timer effect
  useEffect(() => {
    if (loading || quizFinished || !currentQuestion) return;

    if (timerRef.current) clearInterval(timerRef.current);

    startTimeRef.current = Date.now();
    setSecondsRemaining(60);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion, loading, quizFinished]);

  // When 60s time expires, auto-submit with timeout (-1)
  const handleTimeExpired = async () => {
    if (submitting || quizFinished || !attemptId) return;
    await submitAnswerInternal(-1);
  };

  const handleSelectAndSubmit = async (optionIdx: number) => {
    if (submitting || quizFinished || !attemptId) return;
    setSelectedOption(optionIdx);
    await submitAnswerInternal(optionIdx);
  };

  const submitAnswerInternal = async (choiceIndex: number) => {
    setSubmitting(true);
    const clientElapsedMs = Date.now() - startTimeRef.current;

    try {
      const res = await fetch('/api/quizzes/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          attemptId,
          questionIndex: currentIndex,
          selectedOption: choiceIndex,
          clientElapsedMs
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إرسال الإجابة');
      }

      if (data.hasMore && data.nextQuestion) {
        setCurrentIndex(data.nextIndex);
        setCurrentQuestion(data.nextQuestion);
        setSelectedOption(null);
      } else {
        // Finished all questions! Complete attempt
        await finishQuizAttempt();
      }
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setErrorNotice(err.message || 'حدث خطأ أثناء معالجة الإجابة');
    } finally {
      setSubmitting(false);
    }
  };

  const finishQuizAttempt = async () => {
    try {
      const finishRes = await fetch('/api/quizzes/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ attemptId })
      });

      const finishData = await finishRes.json();
      if (!finishRes.ok) {
        throw new Error(finishData.error || 'فشل إكمال الاختبار');
      }

      setQuizResult(finishData);
      setReviewList(finishData.review || []);
      setQuizFinished(true);
      onRefreshUser();

      // Trigger Celebration if Rank-Up or New Badge!
      if (finishData.rankUp) {
        onTriggerCelebration({
          type: 'rank_up',
          title: `مبارك! رتبتك الجديدة: ${finishData.rankUp.newRank}`,
          subtitle: `ارتقيت إلى المستوى ${finishData.rankUp.level} في سلم علماء الأحياء.`,
          badge: '🧬'
        });
      } else if (finishData.newBadges && finishData.newBadges.length > 0) {
        onTriggerCelebration({
          type: 'badge',
          title: `وسام جديد: ${finishData.newBadges[0]}`,
          subtitle: 'تمت إضافة الوسام إلى سجلك العلمي وحديقة إنجازاتك.',
          badge: '🏅'
        });
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'حدث خطأ أثناء استخراج النتيجة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-12 h-12 border-3 border-[#2EC4C6]/30 border-t-[#2EC4C6] rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#1F3A4A]">جارٍ تجهيز أسئلة الاختبار ومزامنة الخادم...</p>
        <p className="text-xs text-slate-400 mt-1">يتم التحقق من النزاهة العلمية وتوزيع الموضوعات</p>
      </div>
    );
  }

  if (errorNotice && !quizFinished) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">تعذر استكمال الاختبار</h3>
        <p className="text-xs text-slate-500">{errorNotice}</p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          العودة لقائمة الاختبارات
        </button>
      </div>
    );
  }

  // ================= RESULTS VIEW =================
  if (quizFinished && quizResult) {
    const attempt = quizResult.attempt;
    const isPassing = (attempt.score || 0) >= 60;

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12 select-none">
        
        {/* Results Hero Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#2EC4C6]/20 shadow-xs text-center space-y-4 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2EC4C6]/10 to-[#1FA97A]/10 border border-[#2EC4C6]/30 flex items-center justify-center text-3xl mx-auto shadow-2xs">
            {isPassing ? '🎯' : '🌱'}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-[#1FA97A] uppercase tracking-wider">
              تم إكمال الاختبار بنجاح
            </span>
            <h2 className="text-2xl font-bold text-[#1F3A4A]">
              تقرير النتيجة والتحليل البيولوجي
            </h2>
            <p className="text-xs text-slate-500">
              {isPassing
                ? 'أداء متميز يبرهن على استيعابك للمفاهيم الحيوية الأساسية!'
                : 'محاولة جيدة، راجع نقاط الضعف أدناه وكرر التدريب لرفع الإتقان.'}
            </p>
          </div>

          {/* 4 Primary Metric Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 font-medium">الدرجة النهائية</span>
              <div className="text-xl font-bold font-mono text-[#1F3A4A] tabular-nums mt-0.5">
                {attempt.score}%
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100 text-center">
              <span className="text-[11px] text-teal-700 font-medium">الإجابات الصحيحة</span>
              <div className="text-xl font-bold font-mono text-[#1FA97A] tabular-nums mt-0.5">
                {attempt.correctCount} / {attempt.totalQuestions}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 text-center">
              <span className="text-[11px] text-amber-800 font-medium">XP المكتسب</span>
              <div className="text-xl font-bold font-mono text-amber-600 tabular-nums mt-0.5">
                +{attempt.xpEarned}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 text-center">
              <span className="text-[11px] text-sky-700 font-medium">الدقة الإجمالية</span>
              <div className="text-xl font-bold font-mono text-sky-700 tabular-nums mt-0.5">
                {attempt.accuracy}%
              </div>
            </div>
          </div>

          {/* Topic Breakdown */}
          {attempt.topicBreakdown && (
            <div className="pt-4 border-t border-slate-100 text-right space-y-2">
              <h4 className="text-xs font-bold text-[#1F3A4A]">تحليل الأداء حسب الموضوع:</h4>
              <div className="space-y-2">
                {Object.entries(attempt.topicBreakdown).map(([topic, data]: [string, any]) => {
                  const rate = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{topic}</span>
                        <span className="font-mono text-slate-500 tabular-nums">{data.correct}/{data.total} ({rate}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${rate >= 70 ? 'bg-[#1FA97A]' : rate >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setShowReviewModal(true)}
              className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>راجع أخطاءك وشرح الأسئلة</span>
            </button>

            <button
              onClick={onExit}
              className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              العودة لقائمة الاختبارات
            </button>
          </div>

        </div>

        {/* Detailed Review Section */}
        {showReviewModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1F3A4A]">مراجعة جميع الأسئلة والشروحات العلمية</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                إخفاء المراجعة
              </button>
            </div>

            <div className="space-y-3">
              {reviewList.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border text-right space-y-3 ${
                    item.isCorrect
                      ? 'bg-emerald-50/30 border-emerald-200/60'
                      : 'bg-rose-50/30 border-rose-200/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">سؤال {idx + 1}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{item.isCorrect ? 'إجابة صحيحة (+10 XP)' : 'إجابة غير صحيحة'}</span>
                    </span>
                  </div>

                  <p className="text-sm font-bold text-[#1F3A4A] leading-relaxed">
                    {item.text}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {item.options.map((opt, optIdx) => {
                      const isUserChoice = item.selectedOption === optIdx;
                      const isCorrectAnswer = item.correctAnswer === optIdx;

                      let style = 'bg-white border-slate-200 text-slate-700';
                      if (isCorrectAnswer) {
                        style = 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-bold';
                      } else if (isUserChoice && !item.isCorrect) {
                        style = 'bg-rose-100/70 border-rose-300 text-rose-900 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${style}`}
                        >
                          <span>{opt}</span>
                          {isCorrectAnswer && <span className="text-[10px] text-emerald-700 font-bold shrink-0">✓ الصحيحة</span>}
                          {isUserChoice && !isCorrectAnswer && <span className="text-[10px] text-rose-700 font-bold shrink-0">اختيارك</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Scientific Explanation */}
                  {item.explanation && (
                    <div className="p-3 rounded-xl bg-white/80 border border-slate-200/60 text-xs text-slate-600 leading-relaxed">
                      <span className="font-bold text-[#2EC4C6] block mb-0.5">🧬 الشرح العلمي:</span>
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  // ================= ACTIVE QUESTION VIEW =================
  if (!currentQuestion) return null;

  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const isUrgent = secondsRemaining <= 10;

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12 select-none">
      
      {/* Top Bar: Progress and Server-Clock Countdown */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={onExit}
          className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>مغادرة الاختبار</span>
        </button>

        {/* 60s Server Countdown Timer */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold transition-colors ${
          isUrgent ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'
        }`}>
          <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`} />
          <span>{secondsRemaining} ثانية</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-[#1F3A4A]">السؤال {currentIndex + 1} من {totalQuestions}</span>
          <span className="font-mono">{progressPercentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2EC4C6] to-[#4FB3D9] rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#2EC4C6]/20 shadow-xs text-right space-y-6">
        
        {/* Category & Unit metadata */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-[#2EC4C6] font-semibold">{currentQuestion.categoryLabel || currentQuestion.category}</span>
          <span>{currentQuestion.unit}</span>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-bold text-[#1F3A4A] leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* 4 Interactive Option Buttons */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                type="button"
                disabled={submitting}
                onClick={() => handleSelectAndSubmit(idx)}
                className={`w-full p-4 rounded-2xl border text-right text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#2EC4C6] bg-[#2EC4C6]/10 text-[#1F3A4A] font-bold shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-[#2EC4C6]/50 hover:bg-slate-50/70 text-[#1F3A4A]'
                }`}
              >
                <span className="leading-relaxed flex-1">{opt}</span>
                <span className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center font-mono font-bold shrink-0 mr-3 ${
                  isSelected ? 'border-[#2EC4C6] bg-[#2EC4C6] text-white' : 'border-slate-300 text-slate-400'
                }`}>
                  {['أ', 'ب', 'ج', 'د'][idx]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hint footer */}
        <div className="text-[11px] text-slate-400 text-center pt-2">
          يتم الانتقال تلقائيًا وحفظ الإجابة على السيرفر بعد اختيار الإجابة أو عند انتهاء الـ 60 ثانية.
        </div>

      </div>

    </div>
  );
};
