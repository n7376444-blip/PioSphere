import React from 'react';
import { Sprout, TreeDeciduous, Flower2, Award, Sparkles, ArrowLeft } from 'lucide-react';
import { User } from '../types.ts';
import { ASSETS } from '../assets/assets.ts';

interface GardenPageProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const GardenPage: React.FC<GardenPageProps> = ({ user, onNavigate }) => {
  const plants = user.gardenPlants;

  // Determine stage
  const stages = [
    { min: 0, title: 'بذرة بيولوجية وشتلات أولية', countText: '0 - 49 نبتة', desc: 'بداية بذر المعرفة الأحيائية في تربتك العلمية.', icon: '🌱' },
    { min: 50, title: 'نباتات نامية ومزهرة', countText: '50 - 99 نبتة', desc: 'نباتات مورقة بدأت بالازدهار مع إتقان المفاهيم الخلوية.', icon: '🌿' },
    { min: 100, title: 'حديقة نباتات متنوعة', countText: '100 - 249 نبتة', desc: 'محمية غنية بنباتات حزازية وسرخسيات وزهور بيولوجية.', icon: '🌺' },
    { min: 250, title: 'شجرة أحيائية عملاقة', countText: '250 - 499 نبتة', desc: 'شجرة باسقة تمثل ثبات معرفتك بالفقاريات وأجهزة الجسم.', icon: '🌳' },
    { min: 500, title: 'واحة حيوية وأشجار متعددة', countText: '500 - 999 نبتة', desc: 'واحة متكاملة من الأشجار والمجتمعات الحيوية المترابطة.', icon: '🌴' },
    { min: 1000, title: 'غابة بيولوجية متكاملة', countText: '1000+ نبتة', desc: 'أعلى مراحل الازدهار! نظام بيئي متوازن ذو تنوع حيوي عظيم.', icon: '🏞️' }
  ];

  let currentStageIdx = 0;
  for (let i = stages.length - 1; i >= 0; i--) {
    if (plants >= stages[i].min) {
      currentStageIdx = i;
      break;
    }
  }

  const currentStage = stages[currentStageIdx];
  const nextStage = stages[currentStageIdx + 1];
  const stageProgress = nextStage
    ? Math.min(100, Math.round(((plants - currentStage.min) / (nextStage.min - currentStage.min)) * 100))
    : 100;

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="space-y-1 text-right">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span>النمو البيئي التفاعلي</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1F3A4A] tracking-tight">
          حديقة الإنجازات الأحيائية 🌱
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          تزدهر حديقتك مع كل إجابة صحيحة تتقنها في الاختبارات، وتتفتح فيها عناصر نادرة مع كل وسام علمي تحققه.
        </p>
      </div>

      {/* Main Terrarium Showcase Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-emerald-200/60 shadow-xs relative overflow-hidden">
        
        {/* Greenhouse Illustration Artwork */}
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6 border border-emerald-100 bg-[#FAF8F2]">
          <img
            src={ASSETS.garden}
            alt="حديقة الإنجازات الحيوية"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Overlay badges on the garden */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-4 md:p-6 justify-between">
            <div className="text-right text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                المرحلة الحالية للمحمية
              </span>
              <h2 className="text-xl md:text-2xl font-bold">
                {currentStage.title}
              </h2>
            </div>

            <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/50 text-[#1F3A4A] text-xs font-bold font-mono tabular-nums shadow-xs">
              {plants} نبتة حية 🌿
            </div>
          </div>
        </div>

        {/* Growth Progress Meter */}
        <div className="space-y-2 text-right">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              {nextStage ? `المسافة نحو "${nextStage.title}":` : 'بلغت قمة الازدهار البيئي!'}
            </span>
            <span className="font-mono text-emerald-700 font-bold">{stageProgress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2EC4C6] via-[#1FA97A] to-[#6CC04A] rounded-full transition-all duration-500"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{currentStage.min} نبتة</span>
            {nextStage && <span>{nextStage.min} نبتة</span>}
          </div>
        </div>

        {/* Stage milestones strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-100 mt-6">
          {stages.map((stg, idx) => {
            const isReached = plants >= stg.min;
            const isCurrent = idx === currentStageIdx;

            return (
              <div
                key={stg.min}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-2xs'
                    : isReached
                    ? 'border-slate-200 bg-slate-50/60'
                    : 'border-slate-100 bg-slate-50/20 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{stg.icon}</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#1F3A4A] truncate">{stg.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{stg.countText}</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Garden Care Tips & Call to Action */}
      <div className="p-6 rounded-3xl bg-gradient-to-l from-white to-[#FAF8F2] border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#1F3A4A]">كيف تروي وتنمّي حديقتك الحيوية؟</h3>
          <p className="text-xs text-slate-500">
            كل إجابة صحيحة في اختبار التحصيلي أو سؤال اليوم تسقي الحديقة بنبتة جديدة. اختبر معلوماتك الآن لترى غابتك تنمو!
          </p>
        </div>

        <button
          onClick={() => onNavigate('quizzes')}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#1FA97A] to-[#2EC4C6] text-white text-xs font-semibold hover:opacity-95 shadow-2xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>حل اختبار وإضافة نباتات</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
