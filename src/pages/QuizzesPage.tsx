import React from 'react';
import {
  FileQuestion,
  BookOpen,
  Zap,
  FlaskConical,
  Award,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { User } from '../types.ts';

interface QuizzesPageProps {
  user: User;
  onStartQuiz: (quizType: 'tahsili' | 'post_unit' | 'daily' | 'secret_lab', category?: 'bio1' | 'bio2' | 'ecology') => void;
  onNavigate: (tab: string) => void;
}

export const QuizzesPage: React.FC<QuizzesPageProps> = ({ user, onStartQuiz, onNavigate }) => {
  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="space-y-1 text-right">
        <h1 className="text-2xl font-bold text-[#1F3A4A] tracking-tight">
          منظومة الاختبارات الحيوية
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          اختر نوع الاختبار لقياس فهمك، جمع نقاط الخبرة، وتنمية حديقتك البيولوجية.
        </p>
      </div>

      {/* Featured: Comprehensive Tahsili Quiz */}
      <section className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-white via-white to-[#FAF8F2] border border-[#2EC4C6]/30 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-[#2EC4C6]/15 to-[#7CC6F2]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 text-right max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#2EC4C6]/10 text-[#2EC4C6] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الاختبار الأهم للمرحلة الثانوية</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#1F3A4A]">
              اختبار التحصيلي الشامل لمادة الأحياء
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              أسئلة عشوائية متوازنة مستخرجة بنسب دقيقة من فروع أحياء 1، أحياء 2، وعلم البيئة. 60 ثانية لكل سؤال، مع حفظ تلقائي لمسارك وإمكانية الاستئناف.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4 text-[#2EC4C6]" /> 15 سؤالاً موزعة نسبياً
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#7CC6F2]" /> 60 ثانية لكل سؤال
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                <Award className="w-4 h-4 text-amber-500" /> مكافأة: حتى +200 XP
              </span>
            </div>
          </div>

          <button
            onClick={() => onStartQuiz('tahsili')}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#2EC4C6] to-[#4FB3D9] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>بدء التحصيلي الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Grid: Post-Unit & Thematic Quizzes */}
      <section className="space-y-4 text-right">
        <div>
          <h2 className="text-base font-bold text-[#1F3A4A]">اختبارات ما بعد الوحدات الدراسية</h2>
          <p className="text-xs text-slate-500">تمارين تخصصية لتركيز المراجعة على منهج محدد</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Biology 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-[#2EC4C6]/40 transition-all text-right flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl">
                🧫
              </div>
              <h3 className="text-sm font-bold text-[#1F3A4A]">أحياء 1: الخلايا واللافقاريات</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                دراسة الحياة، التصنيف الحديث، البكتيريا، الفطريات، الرخويات وشوكيات الجلد.
              </p>
            </div>

            <button
              onClick={() => onStartQuiz('post_unit', 'bio1')}
              className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>اختبار الوحدة</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Biology 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-[#2EC4C6]/40 transition-all text-right flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-xl">
                🫀
              </div>
              <h3 className="text-sm font-bold text-[#1F3A4A]">أحياء 2: الفقاريات وأجهزة الجسم</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                الأسماك، البرمائيات، الثدييات، الجهاز العصبي، المناعي والدوران.
              </p>
            </div>

            <button
              onClick={() => onStartQuiz('post_unit', 'bio2')}
              className="w-full py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>اختبار الوحدة</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Ecology */}
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-[#2EC4C6]/40 transition-all text-right flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">
                🌿
              </div>
              <h3 className="text-sm font-bold text-[#1F3A4A]">علم البيئة والتنوع الحيوي</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                المجتمعات الحيوية، التعاقب، ديناميكية الجماعات، وسلوك الحيوان.
              </p>
            </div>

            <button
              onClick={() => onStartQuiz('post_unit', 'ecology')}
              className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>اختبار الوحدة</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Special Challenges */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Daily Question Card */}
        <div
          onClick={() => onNavigate('daily')}
          className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-200 p-6 shadow-2xs hover:border-amber-300 transition-all text-right cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              تحدٍ يومي
            </span>
            <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>

          <h3 className="text-base font-bold text-[#1F3A4A]">سؤال اليوم (معركة اليوم)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            سؤال واحد موحد لجميع الطلاب يوميًا. أجب عليه لرفع الـ Streak ونسبة تصنيفك بين الطلاب.
          </p>
          <div className="text-xs text-amber-700 font-bold flex items-center gap-1 pt-1">
            <span>انتقل لتحدي اليوم</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>

        {/* Secret Lab Card */}
        <div
          onClick={() => onNavigate('secret_lab')}
          className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-200 p-6 shadow-2xs hover:border-indigo-300 transition-all text-right cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
              {user.unlockedSecretLab ? 'مفتوح 🔓' : 'مقفل 🔒'}
            </span>
            <FlaskConical className="w-6 h-6 text-indigo-500" />
          </div>

          <h3 className="text-base font-bold text-[#1F3A4A]">المختبر السري للأسئلة النادرة</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            تحديات علمية للأوائل بأسئلة عميقة وتكيفات حيوية مثل التارديغريد وقناديل البحر المشعة.
          </p>
          <div className="text-xs text-indigo-700 font-bold flex items-center gap-1 pt-1">
            <span>{user.unlockedSecretLab ? 'دخول المختبر السري' : 'استعراض شروط الفتح'}</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>

      </section>

    </div>
  );
};
