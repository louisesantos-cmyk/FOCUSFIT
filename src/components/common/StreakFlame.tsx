import React from 'react';
import { Flame, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { StreakState } from '../../types';

interface StreakFlameProps {
  streak: StreakState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({
  streak,
  size = 'md',
  showLabel = true,
}) => {
  const isAtRisk = streak.status === 'at_risk';
  const isBroken = streak.status === 'broken' || streak.currentStreak === 0;

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
    hero: 'w-24 h-24 text-4xl',
  };

  const iconSizes = {
    sm: 16,
    md: 22,
    lg: 36,
    hero: 52,
  };

  // Colors & glow based on state
  let flameColor = 'text-pink-500 group-hover:text-pink-400 drop-shadow-[0_0_14px_rgba(236,72,153,0.7)]';
  let badgeBg = 'bg-pink-950/70 border-pink-500/40 text-pink-300';
  let glowEffect = streak.currentStreak >= 3 ? 'glow-streak' : '';

  if (isAtRisk) {
    flameColor = 'text-amber-400 animate-pulse drop-shadow-[0_0_15px_rgba(251,191,36,0.7)]';
    badgeBg = 'bg-amber-950/80 border-amber-500/40 text-amber-300';
    glowEffect = '';
  } else if (isBroken) {
    flameColor = 'text-slate-400 drop-shadow-none';
    badgeBg = 'bg-slate-900/80 border-slate-700/40 text-slate-400';
    glowEffect = '';
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`relative flex items-center justify-center rounded-2xl p-2.5 transition-all duration-300 ${badgeBg} border ${glowEffect}`}
      >
        <Flame
          size={iconSizes[size]}
          className={`${flameColor} transition-transform duration-300 hover:scale-110 fill-current`}
        />
        {isAtRisk && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black animate-ping" />
        )}
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
            <span className={sizeClasses[size].split(' ')[2]}>{streak.currentStreak}</span>
            <span className="text-xs uppercase tracking-wider text-pink-400 font-semibold">
              {streak.currentStreak === 1 ? 'Dia de Ofensiva' : 'Dias de Ofensiva'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            {isAtRisk ? (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <AlertTriangle size={12} />
                Em risco de quebra
              </span>
            ) : isBroken ? (
              <span>Recomece hoje</span>
            ) : (
              <span className="flex items-center gap-1 text-pink-400 font-medium">
                <ShieldCheck size={12} />
                Sequência ativa
              </span>
            )}
            <span className="mx-1">•</span>
            <span>Recorde: {streak.bestStreak}d</span>
          </div>
        </div>
      )}
    </div>
  );
};
