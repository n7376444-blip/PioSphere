import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, XCircle, Users, BarChart3, Clock, Sparkles } from 'lucide-react';
import { User } from '../types.ts';

interface DailyBattlePageProps {
  user: User;
  onRefreshUser: () => void;
}

export const DailyBattlePage: React.FC<DailyBattlePageProps> = ({ user, onRefreshUser }) => {
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState<any>(null);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stats, setStats] = useState<{ participants: number; correctRate?: number }>({ participants: 0 });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [midnightCountdown, setMidnightCountdown] = useState('');

  const token = localStorage.getItem('biosphere_token');

  // Calculate countdown to midnight Saudi Arabia time (UTC+3)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // UTC+3 midnight
      const nowUtc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const riyadhNow = new Date(nowUtc + 3 * 3600000);

      const riyadhMidnight = new Date(riyadhNow);
      riyadhMidnight.setHours(24, 0, 0, 0);

      const diffMs = riyadhMidnight.getTime() - riyadhNow.getTime();
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);

      setMidnightCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDaily = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/daily/question', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setQuestionData(data.question);
      setAlreadyAnswered(data.alreadyAnswered);
      if (data.alreadyAnswered) {
        setUserAnswer(data.userAnswer);
        setIsCorrect(data.isCorrect);
      }
      setStats(data.stats || { participants: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDaily();
  }, [token]);

  const handleSubmitDaily = async (optIdx: number) => {
    if (submitting || alreadyAnswered) return;
    setSubmitting(true);
    setSelectedOption(optIdx);

    try {
      const res = await fetch('/api/daily/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          selectedOption: optIdx,
          clientElapsedMs: 5000
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'فشل إرسال الإجابة');
        return;
      }

      setAlreadyAnswered(true);
      setIsCorrect(data.isCorrect);
      setUserAnswer(optIdx);
      setStats(data.stats);
      if (questionData) {
        setQuestionData({
          ...questionData,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation
        });
      }
      onRefreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-10 h-10 border-3 border-amber-400 border-t-amber-600 rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500">جارٍ إعداد سؤال اليوم ومزامنة إحصاءات المملكة...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 select-none">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-200/80 shadow-xs text-right space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
            <span>معركة اليوم العلمية</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>يتجدد بعد: <strong className="text-[#1F3A4A]">{midnightCountdown}</strong></span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#1F3A4A]">
          سؤال اليوم الموحد
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          سؤال واحد حاسم يوميًا يُتاح لجميع طلاب المملكة بنفس التوقيت. اختبر سرعة بديهتك العلمية ولا تفوت نقاط الخبرة والتقدم!
        </p>

        {/* Live Participants Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-amber-200/50">
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-amber-600" />
            <span>{stats.participants} طالب شاركوا اليوم</span>
          </span>
          {alreadyAnswered && stats.correctRate !== undefined && (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <BarChart3 className="w-4 h-4" />
              <span>نسبة الإجابة الصحيحة: {stats.correctRate}%</span>
            </span>
          )}
        </div>
      </div>

      {/* Question Card */}
      {questionData && (
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-xs text-right space-y-6">
          
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="text-[#2EC4C6] font-semibold">{questionData.categoryLabel || questionData.category}</span>
            <span>{questionData.unit}</span>
          </div>

          <h2 className="text-lg font-bold text-[#1F3A4A] leading-relaxed">
            {questionData.text}
          </h2>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {questionData.options.map((opt: string, idx: number) => {
              const isUserChoice = (alreadyAnswered ? userAnswer : selectedOption) === idx;
              const isCorrectAnswer = alreadyAnswered && questionData.correctAnswer === idx;

              let style = 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 text-[#1F3A4A]';
              if (alreadyAnswered) {
                if (isCorrectAnswer) {
                  style = 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isUserChoice && !isCorrect) {
                  style = 'border-rose-300 bg-rose-50 text-rose-950 line-through';
                } else {
                  style = 'border-slate-100 bg-slate-50 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={alreadyAnswered || submitting}
                  onClick={() => handleSubmitDaily(idx)}
                  className={`w-full p-4 rounded-2xl border text-right text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${style} ${alreadyAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="leading-relaxed flex-1">{opt}</span>
                  <div className="flex items-center gap-2 mr-3 shrink-0">
                    {isCorrectAnswer && <span className="text-xs text-emerald-700 font-bold">✓ الإجابة الصحيحة</span>}
                    {isUserChoice && !isCorrectAnswer && alreadyAnswered && <span className="text-xs text-rose-600 font-bold">إجابتك</span>}
                    <span className="w-6 h-6 rounded-full border border-slate-200 text-xs flex items-center justify-center font-mono font-bold">
                      {['أ', 'ب', 'ج', 'د'][idx]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Post-Answer Result & Explanation */}
          {alreadyAnswered && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}
                <div className="text-xs leading-relaxed text-right">
                  <div className="font-bold text-sm">
                    {isCorrect ? 'إجابة عبقرية صحيحة! (+35 XP)' : 'محاولة مفيدة، لا تحزن! (+10 XP مشاركة)'}
                  </div>
                  <div>
                    {isCorrect
                      ? 'تم تسجيل نبتة جديدة في حديقتك البيولوجية والحفاظ على وتيرة الـ Streak!'
                      : 'راجع التوضيح العلمي أدناه لترسيخ المفهوم في ذهنك.'}
                  </div>
                </div>
              </div>

              {questionData.explanation && (
                <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-slate-200 text-right text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-[#2EC4C6] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> الشرح العلمي الدقيق:
                  </span>
                  <p className="leading-relaxed">{questionData.explanation}</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
