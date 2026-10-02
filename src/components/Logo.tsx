import React from 'react';
import { ASSETS } from '../assets/assets.ts';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  withAnimation?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  withAnimation = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { img: 'w-10 h-10', box: 'w-12 h-12', text: 'text-base', sub: 'text-[10px]' },
    md: { img: 'w-14 h-14', box: 'w-16 h-16', text: 'text-lg', sub: 'text-xs' },
    lg: { img: 'w-24 h-24', box: 'w-28 h-28', text: 'text-2xl', sub: 'text-sm' },
    xl: { img: 'w-36 h-36', box: 'w-44 h-44', text: 'text-3xl', sub: 'text-base' }
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Logo container with safe margin >= 12% and light background */}
      <div className={`relative flex items-center justify-center p-2 rounded-2xl bg-white shadow-xs border border-[#2EC4C6]/20 ${current.box}`}>
        
        {/* Subtle breathing ambient glow */}
        {withAnimation && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#2EC4C6]/15 via-[#6FE3E8]/10 to-[#7CC6F2]/15 blur-md pointer-events-none glow-breathing" />
        )}

        {/* Orbiting DNA particles around the stationary official logo */}
        {withAnimation && (
          <svg className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none animate-spin" style={{ animationDuration: '24s' }} viewBox="0 0 100 100">
            <circle cx="50" cy="4" r="2.5" fill="#2EC4C6" opacity="0.8" />
            <circle cx="96" cy="50" r="2" fill="#7CC6F2" opacity="0.7" />
            <circle cx="50" cy="96" r="2.5" fill="#1FA97A" opacity="0.75" />
            <circle cx="4" cy="50" r="2" fill="#6FE3E8" opacity="0.8" />
            <path d="M 50 15 A 35 35 0 0 1 85 50" fill="none" stroke="#2EC4C6" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
            <path d="M 50 85 A 35 35 0 0 1 15 50" fill="none" stroke="#7CC6F2" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
          </svg>
        )}

        {/* The Official Stationary Logo Image: unmodified, strictly on light background */}
        <img
          src={ASSETS.logo}
          alt="شعار BioSphere الرسمي"
          className={`${current.img} object-contain rounded-xl relative z-10 transition-transform`}
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-[#1F3A4A] ${current.text}`}>
              BioSphere
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-[#2EC4C6] bg-[#2EC4C6]/10 px-1.5 py-0.5 rounded-sm">
              الأحياء
            </span>
          </div>
          <span className={`text-[#1F3A4A]/70 font-medium ${current.sub}`}>
            عالم الأحياء الرقمي
          </span>
        </div>
      )}
    </div>
  );
};
