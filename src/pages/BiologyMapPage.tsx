import React, { useState, useEffect } from 'react';
import { Compass, Lock, CheckCircle2, ChevronLeft, Target, BookOpen, AlertCircle } from 'lucide-react';
import { Realm, User } from '../types.ts';

interface BiologyMapPageProps {
  user: User;
  onStartQuiz: (quizType: 'post_unit', category?: 'bio1' | 'bio2' | 'ecology') => void;
}

export const BiologyMapPage: React.FC<BiologyMapPageProps> = ({ user, onStartQuiz }) => {
  const [realms, setRealms] = useState<Realm[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('biosphere_token');

  useEffect(() => {
    async function loadRealms() {
      try {
        const res = await fetch('/api/map/realms', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setRealms(data.realms || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRealms();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-10 h-10 border-3 border-[#2EC4C6]/30 border-t-[#2EC4C6] rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500">جارٍ قراءة خريطة الأقاليم الحيوية ومستويات الإتقان...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="space-y-1 text-right">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#2EC4C6]/10 text-[#2EC4C6] text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>خريطة الاستكشاف العلمي</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1F3A4A] tracking-tight">
          خريطة الأحياء التفاعلية 🗺️
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          استكشف أقاليم المنهج الستة، وتتبع نسبة إتقانك لكل إقليم بيولوجي لفتح بوابات الأقاليم المتقدمة.
        </p>
      </div>

      {/* Realms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {realms.map((realm, idx) => {
          return (
            <div
              key={realm.id}
              className={`p-6 rounded-3xl border transition-all text-right flex flex-col justify-between space-y-4 ${
                realm.unlocked
                  ? 'bg-white border-slate-100 shadow-xs hover:border-[#2EC4C6]/40 hover:shadow-sm'
                  : 'bg-slate-50/40 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FAF8F2] to-white border border-[#2EC4C6]/20 flex items-center justify-center text-2xl shadow-2xs">
                    {realm.icon}
                  </div>

                  {realm.unlocked ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>إقليم مفتوح</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>مقفل</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#1F3A4A]">{realm.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{realm.description}</p>
                </div>

                {/* Mastery bar */}
                {realm.unlocked && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">نسبة إتقان الإقليم</span>
                      <span className="font-mono font-bold text-[#1FA97A]">{realm.mastery}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2EC4C6] to-[#1FA97A] rounded-full transition-all duration-500"
                        style={{ width: `${realm.mastery}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      تم حل {realm.questionsSolved} سؤالاً في هذا الباب
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {realm.unlocked ? (
                  <button
                    onClick={() => onStartQuiz('post_unit', realm.category as any)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>تمرين واختبار الإقليم</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-400 text-center py-2 bg-slate-100/50 rounded-xl">
                    ارتقِ إلى رتبة ومستوى أعلى لفك قفل هذا الإقليم
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
