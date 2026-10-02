import React, { useState, useEffect } from 'react';
import { Award, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { Achievement, User } from '../types.ts';

interface AchievementsPageProps {
  user: User;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ user }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('biosphere_token');

  useEffect(() => {
    async function loadAchievements() {
      try {
        const res = await fetch('/api/achievements', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setAchievements(data.achievements || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, [token]);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-[#FAF8F2] border border-amber-200/60 shadow-xs text-right space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>سجل الشرف والبطولات</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A4A]">أوسمة وإنجازات الباحث 🏅</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              تحديات علمية خاصة تمنحك أوسمة شرفية دائمة ونقاط خبرة ترفع تصنيفك.
            </p>
          </div>

          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 text-center shrink-0">
            <span className="text-[11px] text-slate-400 font-medium block">الأوسمة المفتوحة</span>
            <span className="font-mono text-lg font-bold text-amber-600 tabular-nums">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            return (
              <div
                key={ach.id}
                className={`p-6 rounded-3xl border transition-all text-right flex flex-col justify-between space-y-4 ${
                  ach.isUnlocked
                    ? 'bg-white border-amber-200 shadow-xs hover:border-amber-300'
                    : 'bg-slate-50/50 border-slate-200/50 opacity-55'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-2xs border ${
                      ach.isUnlocked ? 'bg-amber-50 border-amber-200' : 'bg-slate-100 border-slate-200'
                    }`}>
                      {ach.icon}
                    </div>

                    {ach.isUnlocked ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>مفتوح</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-600 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>مقفل</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1F3A4A]">{ach.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ach.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">{ach.requiredCondition}</span>
                  <span className="font-mono font-bold text-amber-600">+{ach.xpReward} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
