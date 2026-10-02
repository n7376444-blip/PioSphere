import React from 'react';
import { Logo } from './Logo.tsx';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'مرحبًا بك في رحلتك العلمية...'
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F2] px-6 select-none">
      {/* Background ambient gentle wave */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#2EC4C6]/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#7CC6F2]/10 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Animated DNA helix ribbons behind and around the official logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-6 flex items-center justify-center pointer-events-none">
            <svg className="w-56 h-56 animate-spin" style={{ animationDuration: '18s' }} viewBox="0 0 200 200">
              <defs>
                <linearGradient id="dnaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2EC4C6" />
                  <stop offset="50%" stopColor="#7CC6F2" />
                  <stop offset="100%" stopColor="#1FA97A" />
                </linearGradient>
              </defs>
              <ellipse cx="100" cy="100" rx="90" ry="38" fill="none" stroke="url(#dnaGrad)" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.65" transform="rotate(-30 100 100)" />
              <ellipse cx="100" cy="100" rx="90" ry="38" fill="none" stroke="#2EC4C6" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.45" transform="rotate(30 100 100)" />
              <circle cx="100" cy="10" r="3.5" fill="#2EC4C6" />
              <circle cx="190" cy="100" r="3" fill="#1FA97A" />
              <circle cx="100" cy="190" r="3.5" fill="#7CC6F2" />
              <circle cx="10" cy="100" r="3" fill="#6FE3E8" />
            </svg>
          </div>

          <Logo size="xl" showText={false} withAnimation={true} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#1F3A4A] mb-2 font-display">
          BioSphere
        </h1>
        <p className="text-sm font-medium text-[#1F3A4A]/80 tracking-wide animate-pulse">
          {message}
        </p>

        {/* Minimalist progress bar */}
        <div className="w-48 h-1 bg-[#2EC4C6]/15 rounded-full overflow-hidden mt-6">
          <div className="h-full bg-gradient-to-r from-[#2EC4C6] to-[#7CC6F2] rounded-full animate-indeterminate" style={{
            width: '60%',
            animation: 'dnaSlide 1.6s ease-in-out infinite'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes dnaSlide {
          0% { transform: translateX(120%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(-120%); }
        }
      `}</style>
    </div>
  );
};
