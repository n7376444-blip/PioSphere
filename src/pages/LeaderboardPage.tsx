import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Flame, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { User } from '../types.ts';

interface LeaderboardItem {
  id: string;
  nickname: string;
  rankTitle: string;
  level: number;
  xp: number;
  streak: number;
  badgesCount: number;
  organismStage: number;
  gardenPlants: number;
  rank: number;
}

interface LeaderboardPageProps {
  currentUser: User;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ currentUser }) => {
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  const [students, setStudents] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
        const data = await res.json();
        setStudents(data.leaderboard || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timeframe]);

  const top3 = students.slice(0, 3);
  const rest = students.slice(3);

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>المنافسة والتميز العلمي</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1F3A4A] tracking-tight">
            لوحة الصدارة وشرف الأحياء 🏆
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            تصنيف أفضل باحثي الأحياء حسب نقاط XP المكتسبة من الاختبارات والدقة.
          </p>
        </div>

        {/* Timeframe Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              timeframe === 'week' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            هذا الأسبوع
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              timeframe === 'month' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            هذا الشهر
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              timeframe === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            كل الأوقات
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xs text-center space-y-3 my-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-2xs">
            🏆
          </div>
          <h3 className="text-base font-bold text-[#1F3A4A]">لوحة الصدارة تنتظر الأوائل الحقيقيين!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            تعتمد المنصة تصنيفاً حقيقياً وعادلاً 100% مبنياً على نقاط الطلاب الفعليين فقط دون أي بيانات افتراضية. خض اختبارك الأول لتكون أول من يتصدر لوحة الشرف!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
              
              {/* 2nd Place */}
              {top3[1] && (
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center flex flex-col items-center order-2 md:order-1 relative">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xl mb-3 shadow-2xs">
                    🥈
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono">المركز الثاني</span>
                  <h3 className="text-base font-bold text-[#1F3A4A] mt-1 truncate max-w-[180px]">
                    {top3[1].nickname}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">{top3[1].rankTitle}</div>
                  <div className="mt-4 px-3 py-1 rounded-xl bg-slate-50 font-mono text-sm font-bold text-slate-700">
                    {top3[1].xp} XP
                  </div>
                </div>
              )}

              {/* 1st Place (Champion) */}
              {top3[0] && (
                <div className="p-7 rounded-3xl bg-gradient-to-b from-amber-500/10 via-white to-white border-2 border-amber-400/80 shadow-md text-center flex flex-col items-center order-1 md:order-2 relative -translate-y-2">
                  <div className="absolute -top-3.5 bg-amber-400 text-amber-950 px-3 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                    <Crown className="w-3.5 h-3.5" />
                    <span>بطل المنصة</span>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-3xl mb-3 shadow-xs">
                    🥇
                  </div>
                  <span className="text-xs font-bold text-amber-600 font-mono">المركز الأول</span>
                  <h3 className="text-lg font-bold text-[#1F3A4A] mt-1 truncate max-w-[200px]">
                    {top3[0].nickname}
                  </h3>
                  <div className="text-xs text-amber-700 font-semibold mt-0.5">{top3[0].rankTitle}</div>
                  <div className="mt-4 px-4 py-1.5 rounded-xl bg-amber-100/70 font-mono text-base font-bold text-amber-900 shadow-2xs">
                    {top3[0].xp} XP
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="p-6 rounded-3xl bg-white border border-amber-900/15 shadow-xs text-center flex flex-col items-center order-3 relative">
                  <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-xl mb-3 shadow-2xs">
                    🥉
                  </div>
                  <span className="text-xs font-bold text-amber-800/70 font-mono">المركز الثالث</span>
                  <h3 className="text-base font-bold text-[#1F3A4A] mt-1 truncate max-w-[180px]">
                    {top3[2].nickname}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">{top3[2].rankTitle}</div>
                  <div className="mt-4 px-3 py-1 rounded-xl bg-slate-50 font-mono text-sm font-bold text-slate-700">
                    {top3[2].xp} XP
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 text-right">
              <h3 className="text-sm font-bold text-[#1F3A4A]">قائمة الأوائل والمتفوقين</h3>
              <p className="text-[11px] text-slate-400">تُحدث القائمة تلقائيًا عند انتهاء كل محاولة اختبار</p>
            </div>

            <div className="divide-y divide-slate-100">
              {students.map((student) => {
                const isCurrentUser = student.id === currentUser.id;
                return (
                  <div
                    key={student.id}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      isCurrentUser ? 'bg-[#2EC4C6]/10 font-semibold' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-4 text-right">
                      {/* Rank Index */}
                      <span className="w-7 text-center font-mono font-bold text-sm text-slate-400 tabular-nums">
                        #{student.rank}
                      </span>

                      {/* Avatar organism stage */}
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                        {student.level === 8 ? '🌎' : student.level >= 6 ? '🧠' : student.level >= 4 ? '🧬' : student.level >= 2 ? '🔬' : '🌱'}
                      </div>

                      {/* Student Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1F3A4A]">{student.nickname}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-[#2EC4C6] text-white px-1.5 py-0.2 rounded-sm font-bold">
                              أنت
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>{student.rankTitle}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-amber-600">
                            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span className="font-mono">{student.streak}d</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & XP */}
                    <div className="flex items-center gap-4 text-left">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="font-mono tabular-nums">{student.badgesCount}</span>
                        <span className="text-[11px] text-slate-400">وسام</span>
                      </div>

                      <div className="font-mono text-sm font-bold text-[#1F3A4A] tabular-nums bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                        {student.xp} <span className="text-xs text-slate-400 font-normal">XP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
