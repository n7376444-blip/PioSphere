import React from 'react';
import { User } from '../types.ts';
import {
  Flame,
  Zap,
  Target,
  Trophy,
  ArrowLeft,
  Sprout,
  Compass,
  FileQuestion,
  Sparkles,
  Bot
} from 'lucide-react';
import { ASSETS } from '../assets/assets.ts';

interface HomePageProps {
  user: User;
  onNavigate: (tab: string, meta?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ user, onNavigate }) => {
  // Biological journey stages: خلية -> DNA -> نسيج -> جهاز حيوي -> نظام بيئي
  const journeyStages = [
    { id: 1, title: 'الخلية', desc: 'الوحدة البنائية', icon: '🧫', minLevel: 1 },
    { id: 2, title: 'حلزون DNA', desc: 'الشفرة الوراثية', icon: '🧬', minLevel: 3 },
    { id: 3, title: 'النسيج الحيوي', desc: 'التنظيم الخلوي', icon: '🔬', minLevel: 5 },
    { id: 4, title: 'الجهاز الحيوي', desc: 'تكامل الأعضاء', icon: '🫀', minLevel: 6 },
    { id: 5, title: 'النظام البيئي', desc: 'التوازن الكوني', icon: '🌎', minLevel: 8 }
  ];

  // Calculate progression to next rank
  const rankThresholds = [0, 150, 400, 900, 1700, 3000, 5000, 8000];
  const nextTarget = rankThresholds[user.level] || 10000;
  const prevTarget = rankThresholds[user.level - 1] || 0;
  const progressRatio = Math.min(100, Math.max(0, Math.round(((user.xp - prevTarget) / Math.max(1, nextTarget - prevTarget)) * 100)));

  const accuracy = user.totalQuestionsAnswered > 0
    ? Math.round((user.totalCorrectAnswers / user.totalQuestionsAnswered) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Welcome & Primary Journey Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-white via-white to-[#FAF8F2] border border-[#2EC4C6]/25 p-6 md:p-8 shadow-xs">
        
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[#2EC4C6]/10 to-[#7CC6F2]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2EC4C6]/10 border border-[#2EC4C6]/20 text-[#1F3A4A] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#1FA97A] animate-pulse" />
              <span>مرحلة الاستكشاف الثانوي</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F3A4A]">
              أهلاً بك يا عالمنا،{' '}
              <span className="text-[#2EC4C6] underline decoration-[#6FE3E8] decoration-wavy decoration-2 underline-offset-6">
                {user.nickname}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#1F3A4A]/80 leading-relaxed">
              مسيرتك الحيوية في تقدم مستمر. كل إجابة دقيقة تسهم في نمو حديقتك البيولوجية وترقية رتبتك العلمية.
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('quizzes')}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#2EC4C6] to-[#4FB3D9] text-white text-xs font-semibold hover:opacity-95 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileQuestion className="w-4 h-4" />
                <span>خوض اختبار التحصيلي</span>
              </button>

              <button
                onClick={() => onNavigate('daily')}
                className="py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>سؤال اليوم</span>
              </button>

              <button
                onClick={() => onNavigate('biobot')}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#2EC4C6]" />
                <span>استشارة المرشد</span>
              </button>
            </div>
          </div>

          {/* Current Rank & Level Card */}
          <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-slate-200/80 w-full lg:w-80 shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#2EC4C6]/20 flex items-center justify-center text-2xl shadow-2xs">
                  {user.level === 8 ? '🌎' : user.level >= 6 ? '🧠' : user.level >= 4 ? '🧬' : user.level >= 2 ? '🔬' : '🌱'}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">الرتبة الحالية</div>
                  <div className="text-sm font-bold text-[#1F3A4A]">{user.rankTitle}</div>
                </div>
              </div>

              <div className="text-left font-mono tabular-nums">
                <span className="text-xs font-semibold text-slate-400">المستوى</span>
                <div className="text-lg font-bold text-[#2EC4C6]">{user.level}</div>
              </div>
            </div>

            {/* XP Progress to next rank */}
            <div className="space-y-1.5 text-right">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>التقدم نحو الرتبة التالية</span>
                <span className="font-mono font-medium">{progressRatio}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2EC4C6] via-[#4FB3D9] to-[#1FA97A] rounded-full transition-all duration-500"
                  style={{ width: `${progressRatio}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{user.xp} XP</span>
                <span>{nextTarget} XP</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-700">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-bold">{user.streak} أيام متتالية</span>
              </div>
              <button
                onClick={() => onNavigate('journey')}
                className="text-xs text-[#2EC4C6] font-semibold hover:underline flex items-center gap-1"
              >
                <span>تفاصيل الرحلة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Four Quick Statistics Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Solved */}
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs text-right space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">الأسئلة المحلولة</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1F3A4A] tabular-nums">
            {user.totalQuestionsAnswered}
          </div>
          <p className="text-[11px] text-slate-400">سؤالاً تم حله بالكامل</p>
        </div>

        {/* Global Accuracy */}
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs text-right space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">معدل الدقة</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1F3A4A] tabular-nums">
            {accuracy}%
          </div>
          <p className="text-[11px] text-slate-400">{user.totalCorrectAnswers} إجابة صحيحة</p>
        </div>

        {/* Garden Plants */}
        <div
          onClick={() => onNavigate('garden')}
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs text-right space-y-1 cursor-pointer hover:border-emerald-200 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">حديقة الإنجازات</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1FA97A] tabular-nums">
            {user.gardenPlants}
          </div>
          <p className="text-[11px] text-emerald-700/80">نبتة نامية في المحمية</p>
        </div>

        {/* Unlocked Badges */}
        <div
          onClick={() => onNavigate('achievements')}
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs text-right space-y-1 cursor-pointer hover:border-amber-200 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">الأوسمة المفتوحة</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {user.unlockedAchievements.length}
          </div>
          <p className="text-[11px] text-slate-400">من أصل 9 أوسمة رئيسية</p>
        </div>

      </section>

      {/* 3. Visual Journey Progression: خلية -> DNA -> نسيج -> جهاز حيوي -> نظام بيئي */}
      <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between text-right">
          <div>
            <h2 className="text-base font-bold text-[#1F3A4A]">المسار الحيوي للتطور المعرفي</h2>
            <p className="text-xs text-slate-500">يتسع أفقك العلمي كلما تعمقت في استكشاف أسرار الحياة</p>
          </div>
          <button
            onClick={() => onNavigate('map')}
            className="text-xs text-[#2EC4C6] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>استعراض خريطة الأحياء</span>
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Evolutionary Track */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {journeyStages.map((stg, i) => {
            const isUnlocked = user.level >= stg.minLevel;
            const isCurrent = user.level === stg.minLevel || (user.level > stg.minLevel && (journeyStages[i + 1] ? user.level < journeyStages[i + 1].minLevel : true));

            return (
              <div
                key={stg.id}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#2EC4C6] bg-[#2EC4C6]/5 shadow-xs'
                    : isUnlocked
                    ? 'border-slate-100 bg-slate-50/50'
                    : 'border-slate-100 bg-slate-50/20 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stg.icon}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                    isCurrent
                      ? 'bg-[#2EC4C6] text-white'
                      : isUnlocked
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCurrent ? 'الحالي' : isUnlocked ? 'مكتمل' : `مستوى ${stg.minLevel}`}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1F3A4A]">{stg.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{stg.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Today's Mission & Featured Challenges */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Daily Mission Card */}
        <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-white to-[#FAF8F2] border border-amber-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>معركة اليوم العلمية</span>
            </div>
            <h3 className="text-lg font-bold text-[#1F3A4A]">
              تحدي سؤال اليوم الموحد لجميع طلاب المملكة
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              سؤال يومي واحد يتغير عند منتصف الليل بتوقيت السعودية. تنافس مع زملائك على سرعة ودقة الإجابة واكسب +35 XP وسلسلة تفوق مستمرة!
            </p>
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-amber-100 mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>مكافأة: +35 XP ونبتة في الحديقة</span>
            </div>
            <button
              onClick={() => onNavigate('daily')}
              className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>ابدأ التحدي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secret Lab Teaser Card */}
        <div className="rounded-3xl bg-gradient-to-br from-white to-sky-50/50 border border-sky-100 p-6 shadow-2xs flex flex-col justify-between text-right">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl">
              🧪
            </div>
            <h3 className="text-sm font-bold text-[#1F3A4A]">المختبر السري والأحياء النادرة</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {user.unlockedSecretLab
                ? 'أحسنت! أبواب المختبر السري مفتوحة أمامك لخوض أسئلة التحدي وحصاد الـ Bonus XP.'
                : 'حافظ على 7 أيام متتالية أو حقق ≥ 80% في التحصيلي لفتح بوابات الأبحاث السرية.'}
            </p>
          </div>

          <div className="pt-4 border-t border-sky-100/60">
            <button
              onClick={() => onNavigate('secret_lab')}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{user.unlockedSecretLab ? 'دخول المختبر السري' : 'شروط الفتح'}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </section>

    </div>
  );
};
