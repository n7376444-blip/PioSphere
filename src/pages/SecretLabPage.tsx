import React from 'react';
import { FlaskConical, Lock, Unlock, Sparkles, ChevronLeft, ShieldAlert } from 'lucide-react';
import { User } from '../types.ts';
import { ASSETS } from '../assets/assets.ts';

interface SecretLabPageProps {
  user: User;
  onStartQuiz: (quizType: 'secret_lab') => void;
}

export const SecretLabPage: React.FC<SecretLabPageProps> = ({ user, onStartQuiz }) => {
  const isUnlocked = user.unlockedSecretLab || user.role === 'admin';

  // Criteria progress
  const criteria = [
    { label: 'سلسلة 7 أيام متتالية', current: user.streak, target: 7, done: user.streak >= 7 },
    { label: 'حل 200 سؤال بيولوجي', current: user.totalQuestionsAnswered, target: 200, done: user.totalQuestionsAnswered >= 200 },
    { label: 'إتقان التحصيلي بنسبة ≥ 80%', current: user.unlockedAchievements.includes('tahsili_master') ? 'مكتمل' : 'غير مكتمل', target: 'مكتمل', done: user.unlockedAchievements.includes('tahsili_master') }
  ];

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="space-y-1 text-right">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-xs font-semibold">
          <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
          <span>الأبحاث الاستثنائية والظواهر النادرة</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1F3A4A] tracking-tight">
          المختبر السري للظواهر الأحيائية 🧪
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          مقر الأبحاث المتقدمة لتحديات دب الماء (التارديغريد)، البروتينات المشعة، والجينومات الخارقة.
        </p>
      </div>

      {/* Main Secret Lab Display Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-indigo-200/60 shadow-xs relative overflow-hidden">
        
        {/* Lab Artwork Banner */}
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6 border border-indigo-100 bg-[#FAF8F2]">
          <img
            src={ASSETS.secretLab}
            alt="المختبر السري"
            className={`w-full h-full object-cover transition-all ${isUnlocked ? 'filter-none' : 'filter blur-xs grayscale-30'}`}
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6 justify-between">
            <div className="text-right text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                حالة المختبر الحالية
              </span>
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                {isUnlocked ? <Unlock className="w-6 h-6 text-emerald-400" /> : <Lock className="w-6 h-6 text-amber-400" />}
                <span>{isUnlocked ? 'مفتوح للباحثين المعتمدين' : 'بوابات الأبحاث مغلقة'}</span>
              </h2>
            </div>

            {isUnlocked && (
              <button
                onClick={() => onStartQuiz('secret_lab')}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-[#2EC4C6] hover:opacity-95 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>خوض تحدي المختبر (+Bonus XP)</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Locked Criteria & Instructions */}
        {!isUnlocked ? (
          <div className="space-y-4 text-right">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block mb-1">🔒 شروط فتح بوابات المختبر السري:</span>
              لفتح المختبر، يكفي تحقيق <strong>أحد الشروط التالية</strong> لإثبات جدارتك العلمية:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {criteria.map((c, i) => (
                <div key={i} className={`p-4 rounded-2xl border text-right space-y-1 ${c.done ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-xs font-bold text-[#1F3A4A]">{c.label}</div>
                  <div className="text-[11px] font-mono text-slate-500">
                    التقدم: {c.current} / {c.target}
                  </div>
                  <span className={`text-[10px] font-bold ${c.done ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {c.done ? '✓ تم التحقيق' : 'قيد التقدم'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-right text-xs text-indigo-950 space-y-1">
            <span className="font-bold text-indigo-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" /> ميزات المختبر السري:
            </span>
            <p className="leading-relaxed">
              أسئلة تحدٍّ استثنائية ونادرة (مثل تكيّف دب الماء التارديغريد في الفضاء، وآليات البروتين الفلوري الأخضر GFP في قناديل البحر). تمنحك إجابات المختبر مكافأة مضاعفة من XP وأوسمة الشرف!
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
