import React, { useState, useEffect } from 'react';
import { Dna, Target, Sprout, Award, TrendingUp, AlertCircle, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { User } from '../types.ts';

interface JourneyPageProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const JourneyPage: React.FC<JourneyPageProps> = ({ user, onNavigate }) => {
  const [journeyData, setJourneyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('biosphere_token');

  useEffect(() => {
    async function loadJourney() {
      try {
        const res = await fetch('/api/journey', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setJourneyData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadJourney();
  }, [token]);

  const organismStages = [
    { stage: 1, name: 'كائن دقيق مجهري', icon: '🦠', desc: 'طور التكوين الأولي، يتغذى على المفاهيم الخلوية البسيطة.' },
    { stage: 2, name: 'خلية أولية نشطة', icon: '🧫', desc: 'تمتلك غشاءً بلازمياً وحركة مجهرية واعدة.' },
    { stage: 3, name: 'خلية متطورة حقيقية النواة', icon: '🔬', desc: 'تنتظم فيها العضيات الغشائية والميتوكندريا الحيوية.' },
    { stage: 4, name: 'جزيء DNA حلزوني حيوي', icon: '🧬', desc: 'شفرة وراثية كاملة تنبض بالحياة والتكامل الجزيئي.' },
    { stage: 5, name: 'كائن متكامل التكيف (التارديغريد والبيوسفير)', icon: '🐻‍❄️', desc: 'أعلى درجات التطور والصلابة العلمية، قادر على البقاء في أصعب الظروف!' }
  ];

  const currentOrganism = organismStages[(user.organismStage || 1) - 1] || organismStages[0];

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="space-y-1 text-right">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#2EC4C6]/10 text-[#2EC4C6] text-xs font-semibold">
          <Dna className="w-3.5 h-3.5" />
          <span>التاريخ الأكاديمي والتحليلي</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1F3A4A] tracking-tight">
          رحلتي العلمية ومسار التطور 🧬
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          تتبع ارتقاء رتبتك، وتطور كائنك الحيوي، وتعرف على نقاط قوتك ومواطن التحسين.
        </p>
      </div>

      {/* Organism Evolution Showcase Card */}
      <section className="p-6 md:p-8 rounded-3xl bg-white border border-[#2EC4C6]/20 shadow-xs text-right space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2EC4C6]">
              الكائن الحيوي المرافق لمسيرتك
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1F3A4A]">
              {currentOrganism.name}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentOrganism.desc}
            </p>
          </div>

          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#FAF8F2] via-white to-[#2EC4C6]/10 border-2 border-[#2EC4C6]/30 flex items-center justify-center text-5xl shadow-xs self-center md:self-auto shrink-0 glow-breathing">
            {currentOrganism.icon}
          </div>
        </div>

        {/* 5 Evolution Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
          {organismStages.map((stg) => {
            const isUnlocked = (user.organismStage || 1) >= stg.stage;
            const isCurrent = (user.organismStage || 1) === stg.stage;

            return (
              <div
                key={stg.stage}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#2EC4C6] bg-[#2EC4C6]/10 font-bold'
                    : isUnlocked
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-slate-100 bg-slate-50/20 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stg.icon}</span>
                  <span className="text-[10px] font-mono text-slate-400">طور {stg.stage}</span>
                </div>
                <div className="text-[11px] text-[#1F3A4A] truncate">{stg.name}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weak Points & AI Mentor Recommendations */}
      {journeyData && journeyData.weakTopics && journeyData.weakTopics.length > 0 && (
        <section className="p-6 rounded-3xl bg-amber-50/40 border border-amber-200/70 shadow-2xs text-right space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-[#1F3A4A]">تحليل مواطن التحسين والتوصيات الذكية</h3>
            </div>
            <button
              onClick={() => onNavigate('biobot')}
              className="text-xs text-[#2EC4C6] font-bold hover:underline"
            >
              استشارة المرشد الحيوي
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {journeyData.weakTopics.map((item: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-amber-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.unit}</span>
                  <span className="font-mono text-rose-600 font-bold">خطأ {item.errorRate}%</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comprehensive Academic Summary Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400">الاختبارات المنجزة</span>
          <div className="text-xl font-bold font-mono text-[#1F3A4A] tabular-nums">
            {journeyData ? journeyData.totalQuizzesTaken : 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400">الإجابات المتقنة</span>
          <div className="text-xl font-bold font-mono text-[#1FA97A] tabular-nums">
            {user.totalCorrectAnswers}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400">نباتات الحديقة</span>
          <div className="text-xl font-bold font-mono text-emerald-600 tabular-nums">
            {user.gardenPlants}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400">السلسلة الحالية</span>
          <div className="text-xl font-bold font-mono text-amber-600 tabular-nums">
            {user.streak} أيام
          </div>
        </div>
      </section>

    </div>
  );
};
