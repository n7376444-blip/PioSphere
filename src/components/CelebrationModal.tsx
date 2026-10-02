import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ArrowUpCircle, Check } from 'lucide-react';

interface CelebrationModalProps {
  data: {
    type: 'rank_up' | 'badge';
    title: string;
    subtitle: string;
    badge?: string;
  } | null;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ data, onClose }) => {
  useEffect(() => {
    if (data) {
      // Trigger short, delightful biology confetti (turquoise, emerald, gold, sky blue)
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2EC4C6', '#6FE3E8', '#1FA97A', '#E7B94A', '#7CC6F2'],
        disableForReducedMotion: true
      });

      // Automatically auto-close after 2.5 seconds per prompt rule:
      // "عند الترقية: احتفال بصري قصير (لا يتجاوز 2.5 ثانية)"
      const timer = setTimeout(() => {
        onClose();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [data, onClose]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-[#2EC4C6]/30 text-center flex flex-col items-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow behind */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-tr from-[#2EC4C6]/20 via-[#E7B94A]/20 to-[#6CC04A]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#2EC4C6]/10 to-[#E7B94A]/10 border border-[#E7B94A]/40 flex items-center justify-center text-4xl mb-4 relative z-10 shadow-xs">
          {data.badge || (data.type === 'rank_up' ? '🧬' : '🏅')}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#E7B94A] bg-[#E7B94A]/10 px-2.5 py-0.5 rounded-full mb-2">
          {data.type === 'rank_up' ? <ArrowUpCircle className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
          <span>{data.type === 'rank_up' ? 'ترقية رتبة علمية جديدة!' : 'إنجاز علمي مفتوح!'}</span>
        </div>

        <h3 className="text-xl font-bold text-[#1F3A4A] mb-1">
          {data.title}
        </h3>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-xs">
          {data.subtitle}
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-[#2EC4C6] hover:bg-[#2EC4C6]/90 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>متابعة الرحلة</span>
        </button>
      </div>
    </div>
  );
};
