import React from 'react';
import { Logo } from '../components/Logo.tsx';
import { ShieldCheck, Sparkles, BookOpen, Heart, Cpu, Globe, GraduationCap, School, Star } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 select-none text-right">
      
      {/* Hero Showcase with Official Stationary Logo */}
      <div className="p-8 rounded-3xl bg-white border border-[#2EC4C6]/20 shadow-xs text-center flex flex-col items-center space-y-4 relative overflow-hidden">
        <div className="relative mb-2">
          <Logo size="xl" showText={false} withAnimation={true} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3A4A] tracking-tight">
          منصة BioSphere التفاعلية
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
          عالم أحيائي رقمي تفاعلي يهدف إلى إعادة صياغة تجربة تعلّم مادة الأحياء واختبارات التحصيلي لطلاب المرحلة الثانوية، من خلال الجمع بين الدقة العلمية، التلعيب (Gamification)، والتطور البصري الممتع.
        </p>
      </div>

      {/* ================= TEAM & LEADERSHIP CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Box 1: Creative Builders & Coordinators */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-white to-teal-50/50 border-2 border-[#2EC4C6]/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-teal-800">
            <div className="w-10 h-10 rounded-2xl bg-teal-100/90 flex items-center justify-center text-teal-700 shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#2EC4C6]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2EC4C6] block">
                فريق الإبداع والتطوير
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#1F3A4A] leading-snug">
                تم بناء وتنسيق هذه المنصة من قبل المبدعات:
              </h3>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAF8F2] border border-teal-200/70 text-xs sm:text-sm font-bold text-[#1F3A4A] shadow-2xs">
              <span className="w-7 h-7 rounded-xl bg-teal-500/10 text-[#2EC4C6] flex items-center justify-center text-xs">
                ✨
              </span>
              <span>جوانا العلياني</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAF8F2] border border-teal-200/70 text-xs sm:text-sm font-bold text-[#1F3A4A] shadow-2xs">
              <span className="w-7 h-7 rounded-xl bg-teal-500/10 text-[#2EC4C6] flex items-center justify-center text-xs">
                ✨
              </span>
              <span>رؤية سكتاوي</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAF8F2] border border-teal-200/70 text-xs sm:text-sm font-bold text-[#1F3A4A] shadow-2xs">
              <span className="w-7 h-7 rounded-xl bg-teal-500/10 text-[#2EC4C6] flex items-center justify-center text-xs">
                ✨
              </span>
              <span>يارا المالكي</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAF8F2] border border-teal-200/70 text-xs sm:text-sm font-bold text-[#1F3A4A] shadow-2xs">
              <span className="w-7 h-7 rounded-xl bg-teal-500/10 text-[#2EC4C6] flex items-center justify-center text-xs">
                ✨
              </span>
              <span>ألين الحارثي</span>
            </div>
          </div>
        </div>

        {/* Box 2: Educational Leadership & Supervision */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-white to-sky-50/50 border-2 border-sky-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-sky-900 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 shadow-2xs">
                <GraduationCap className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 block">
                  القيادة والإشراف التربوي
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#1F3A4A]">
                  الإشراف المدرسي
                </h3>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-sky-200/70 space-y-1 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500 block">المعلمة المسؤولة:</span>
                <div className="text-sm sm:text-base font-bold text-[#1F3A4A] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1FA97A]" />
                  <span>أ / مها العفيفي</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-sky-200/70 space-y-1 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500 block">مديرة المدرسة:</span>
                <div className="text-sm sm:text-base font-bold text-[#1F3A4A] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2EC4C6]" />
                  <span>أ / عواطف السواط</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 font-medium">
            فخر المدارس الثانوية في خدمة التعليم الرقمي وتطوير مهارات علماء المستقبل
          </div>
        </div>

      </div>

      {/* Official Emblem Symbolism Guide */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#1F3A4A]">فلسفة الشعار الرسمي (رمزية العناصر الحيوية)</h2>
          <p className="text-xs text-slate-500 mt-1">
            صُمم الشعار المعتمد بعناية فائقة ليعبّر عن ركائز علم الأحياء الحديث والتقنيات الرقمية المتقدمة:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧬</span>
              <h3 className="text-sm font-bold text-[#1F3A4A]">حلزون DNA المركزي</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              يمثل جوهر الحياة والمخطط الجيني، بتدرجات متناسقة من الفيروزي والأزرق السماوي والبنفسجي الناعم.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪼</span>
              <h3 className="text-sm font-bold text-[#1F3A4A]">قنديل البحر المضيء</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              رمز التنوع الحيوي البحري، ومصدر البروتين المشع (GFP) الذي أحدث ثورة في تصوير الخلايا وحاز جائزة نوبل.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦠</span>
              <h3 className="text-sm font-bold text-[#1F3A4A]">المحفظة الفيروسية والكائنات الدقيقة</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              تجسيد لعالم الأحياء الدقيقة والهندسة الوراثية وتراكيب النانو البيولوجية متناهية الصغر.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐻‍❄️</span>
              <h3 className="text-sm font-bold text-[#1F3A4A]">دب الماء (التارديغريد)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              أقوى المخلوقات تحملاً وتكيفاً على كوكب الأرض، يرمز إلى صلابة الطالب الأكاديمية وقدرته على مواجهة أصعب أسئلة التحصيلي.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-slate-200/80 space-y-2 sm:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h3 className="text-sm font-bold text-[#1F3A4A]">الدوائر الإلكترونية وشبكات الجزيئات</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ترمز لدمج التقنية الرقمية والذكاء الاصطناعي مع علوم الحياة، لربط المعرفة النظرية بأحدث أدوات العصر.
            </p>
          </div>
        </div>
      </div>

      {/* Commitment to Curriculum & Privacy */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#1F3A4A]">المواءمة التعليمية والخصوصية</h2>
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            • <strong>المنهج السعودي:</strong> جميع الأسئلة والمفاهيم مصممة وفق أحدث معايير المنهج السعودي لمقررات أحياء 1، أحياء 2، وعلم البيئة للمرحلة الثانوية واختبارات التحصيلي المعتمدة.
          </p>
          <p>
            • <strong>الخصوصية التامة (PDPL):</strong> تلتزم المنصة بنظام حماية البيانات الشخصية، حيث لا يتم إظهار بريد أي طالب إطلاقًا، وتقتصر هويته في لوحات المنافسة على اسم الطالب فقط دون بيانات حساسة.
          </p>
        </div>
      </div>

    </div>
  );
};
