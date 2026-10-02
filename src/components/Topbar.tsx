import React from 'react';
import { Menu, Flame, Sparkles, Sprout, Bot } from 'lucide-react';
import { User } from '../types.ts';

interface TopbarProps {
  user: User;
  onOpenMobile: () => void;
  onNavigate: (tab: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onOpenMobile, onNavigate }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-3 flex items-center justify-between">
      
      {/* Zone 1: Mobile drawer toggle & Page identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
          aria-label="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base font-bold text-[#1F3A4A] tracking-tight">
            BioSphere
          </span>
          <span className="hidden sm:inline-block text-slate-300">/</span>
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
            المرحلة الثانوية
          </span>
        </div>
      </div>

      {/* Zone 2: Gamified quick indicators */}
      <div className="flex items-center gap-3 sm:gap-5 text-xs">
        {/* Streak counter */}
        <div
          onClick={() => onNavigate('journey')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200/50 text-amber-800 font-semibold cursor-pointer hover:bg-amber-100/70 transition-colors"
          title="سلسلة النشاط اليومية"
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDuration: '2s' }} />
          <span className="font-mono tabular-nums">{user.streak}</span>
          <span className="hidden sm:inline text-[11px] font-normal text-amber-700">أيام</span>
        </div>

        {/* Garden plants indicator */}
        <div
          onClick={() => onNavigate('garden')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/50 text-emerald-800 font-semibold cursor-pointer hover:bg-emerald-100/70 transition-colors"
          title="نباتات الحديقة النامية"
        >
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span className="font-mono tabular-nums">{user.gardenPlants}</span>
          <span className="hidden sm:inline text-[11px] font-normal text-emerald-700">نبتة</span>
        </div>

        {/* Total XP */}
        <div
          onClick={() => onNavigate('journey')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2EC4C6]/10 border border-[#2EC4C6]/20 text-[#1F3A4A] font-semibold cursor-pointer hover:bg-[#2EC4C6]/20 transition-colors"
          title="إجمالي نقاط الخبرة"
        >
          <Sparkles className="w-4 h-4 text-[#2EC4C6]" />
          <span className="font-mono tabular-nums">{user.xp}</span>
          <span className="text-[11px] font-normal text-slate-500">XP</span>
        </div>
      </div>

      {/* Zone 3: Primary quick action (BioBot or Start Test) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('biobot')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2EC4C6] to-[#4FB3D9] text-white text-xs font-semibold hover:opacity-95 shadow-2xs transition-all cursor-pointer"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">اسأل المرشد</span>
        </button>
      </div>

    </header>
  );
};
