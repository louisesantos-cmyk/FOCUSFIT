import React from 'react';
import {
  Trophy,
  Flame,
  Zap,
  Award,
  Crown,
  Sparkles,
  ShieldAlert,
  RefreshCw,
  Droplets,
  CheckCheck,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Achievements: React.FC = () => {
  const { achievements, userXp, userLevel, nextLevelXp, currentLevelBaseXp } = useApp();

  const xpInCurrentLevel = userXp - currentLevelBaseXp;
  const xpNeededForLevel = nextLevelXp - currentLevelBaseXp;
  const levelProgress = Math.min(
    100,
    Math.round((xpInCurrentLevel / (xpNeededForLevel || 1)) * 100)
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
    const size = 26;
    const color = unlocked ? 'text-pink-400' : 'text-slate-600';
    switch (iconName) {
      case 'Flame':
        return <Flame size={size} className={color} />;
      case 'Zap':
        return <Zap size={size} className={color} />;
      case 'Award':
        return <Award size={size} className={color} />;
      case 'ShieldAlert':
        return <ShieldAlert size={size} className={color} />;
      case 'Trophy':
        return <Trophy size={size} className={color} />;
      case 'Crown':
        return <Crown size={size} className={color} />;
      case 'Sparkles':
        return <Sparkles size={size} className={color} />;
      case 'RefreshCw':
        return <RefreshCw size={size} className={color} />;
      case 'Droplets':
        return <Droplets size={size} className={color} />;
      case 'CheckCheck':
        return <CheckCheck size={size} className={color} />;
      default:
        return <Trophy size={size} className={color} />;
    }
  };

  const getLevelTitle = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 'Iniciante do Foco';
      case 2:
        return 'Aprendiz Disciplinado';
      case 3:
        return 'Guardião dos Hábitos';
      case 4:
        return 'Mestre da Consistência';
      case 5:
        return 'Atleta Nutricional';
      case 6:
        return 'Guerreira de Aço';
      case 7:
        return 'Lenda do Equilíbrio';
      default:
        return 'Centurião FOCUSFIT';
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 animate-fadeIn">
      
      {/* Banner & Level Progress */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-r from-pink-950/80 via-[#180612] to-[#0f040a] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-2">
              <Trophy size={13} className="text-pink-300" />
              <span>Gamificação & Recompensas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Suas Conquistas
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Cada refeição consciente e dia de consistência rende pontos de experiência (XP) e desbloqueia medalhas especiais.
            </p>
          </div>

          <div className="rounded-2xl border border-pink-500/30 bg-black/40 p-4 shrink-0 min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider">
                Nível {userLevel}
              </span>
              <span className="text-pink-400 font-black">{getLevelTitle(userLevel)}</span>
            </div>
            <div className="text-2xl font-black text-white mb-2">
              {userXp} <span className="text-xs text-slate-400 font-normal">XP Total</span>
            </div>
            
            {/* Level Bar */}
            <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden mb-1">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>{xpInCurrentLevel} XP</span>
              <span>{xpNeededForLevel} XP p/ Nível {userLevel + 1}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-pink-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Medalhas Desbloqueadas: <strong className="text-pink-400">{unlockedCount} de {achievements.length}</strong></span>
          <span className="text-pink-300 font-semibold">Consistência gera evolução permanente!</span>
        </div>
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {achievements.map((ach) => {
          const isUnlocked = ach.unlocked;
          const progressPercent = Math.min(100, Math.round((ach.progressCurrent / ach.progressMax) * 100));

          return (
            <div
              key={ach.id}
              className={`relative overflow-hidden rounded-3xl border p-5 transition-all ${
                isUnlocked
                  ? 'border-pink-500/40 bg-gradient-to-b from-[#240c1c] via-[#170612] to-[#0f040a] shadow-lg shadow-pink-500/10'
                  : 'border-pink-950/60 bg-[#12050f] opacity-80'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-wider">
                  Desbloqueado
                </div>
              )}

              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border shrink-0 ${
                    isUnlocked
                      ? 'bg-pink-950/60 border-pink-400/40 shadow-inner shadow-pink-500/20'
                      : 'bg-black/40 border-slate-800 text-slate-600'
                  }`}
                >
                  {isUnlocked ? renderBadgeIcon(ach.badgeIcon, true) : <Lock size={22} className="text-slate-600" />}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <h3 className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                    {ach.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar for Locked */}
              {!isUnlocked && (
                <div className="mt-4 pt-3 border-t border-pink-950/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Progresso:</span>
                    <span className="font-semibold">{ach.progressCurrent} / {ach.progressMax}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-pink-500/60 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Reward info */}
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-bold text-pink-300 bg-pink-950/40 px-2 py-0.5 rounded-lg border border-pink-500/20">
                  <Sparkles size={12} />
                  +{ach.xpReward} XP
                </span>

                {isUnlocked && ach.unlockedAt && (
                  <span className="text-[10px] text-slate-500">
                    Conquistado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
