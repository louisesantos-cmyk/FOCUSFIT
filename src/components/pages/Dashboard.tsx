import React, { useState } from 'react';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Sparkles,
  Droplets,
  Plus,
  Minus,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Heart,
  Utensils,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getGreeting, formatDatePtBr } from '../../utils/dateUtils';
import { DayFinishModal } from '../common/DayFinishModal';

export const Dashboard: React.FC = () => {
  const {
    profile,
    streak,
    todayLog,
    habits,
    toggleHabitToday,
    updateWaterIntake,
    quote,
    drawNewQuote,
    setActiveTab,
    logs,
  } = useApp();

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  // Greeting
  const greeting = getGreeting();

  // Habits progress
  const completedHabitsCount = todayLog.completedHabitIds.length;
  const totalHabitsCount = habits.length;
  const progressPercent =
    totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;

  // Weekly consistency percentage: count completed days in the last 7 days
  const calculateWeeklyConsistency = () => {
    let completedDays = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (logs[dateStr]?.status === 'completed') {
        completedDays++;
      }
    }
    return Math.round((completedDays / 7) * 100);
  };

  const weeklyConsistency = calculateWeeklyConsistency();

  // Water calculations
  const waterPercent = Math.min(
    100,
    Math.round((todayLog.waterIntakeMl / todayLog.waterTargetMl) * 100)
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-10 animate-fadeIn">
      
      {/* Top Greeting & Personal Coach Header */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-r from-pink-950/70 via-[#180612] to-[#0f040a] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-3">
              <Sparkles size={13} className="text-pink-300" />
              <span>{formatDatePtBr(todayLog.date)} • Seu Treinador Diário</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {greeting}, {profile.name}!
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-xl">
              Hoje é mais uma oportunidade de ouro para nutrir seu corpo, fortalecer sua mente e manter sua constância.
            </p>
          </div>

          {/* Quick CTA to Finish Day */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsFinishModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-sm shadow-lg shadow-pink-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={18} />
              <span>FINALIZAR MEU DIA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Streak Warning Banner (Only when status is 'at_risk' or 'broken') */}
      {streak.status === 'at_risk' && (
        <div className="rounded-3xl border border-amber-500/50 bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-[#1c1308] p-5 shadow-lg shadow-amber-500/10 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle size={26} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-amber-200">
                ⚠️ Sua ofensiva está em risco!
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                Você já se afastou da sua rotina ontem. Hoje é uma nova oportunidade de retomar o controle. Não deixe dois dias difíceis quebrarem sua sequência. Faça o seu melhor hoje!
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('mission')}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer"
                >
                  Cumprir hábitos agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {streak.status === 'broken' && (
        <div className="rounded-3xl border border-pink-500/30 bg-[#1a0815] p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-400 shrink-0">
              <Heart size={26} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">
                Hora de um Novo Começo!
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Você perdeu sua ofensiva, mas não perdeu seu progresso. Seu histórico e recorde anterior de <strong>{streak.bestStreak} dias</strong> continuam guardados aqui. Recomece hoje e mostre que consegue ser consistente!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Streak Highlight Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-950/80 via-[#1e0817] to-[#0f040a] p-6 sm:p-7 shadow-xl glow-streak">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-pink-900/50 border border-pink-400/40 text-pink-400 shadow-inner shadow-pink-500/30">
              <Flame size={54} className="fill-pink-500 text-pink-500 animate-pulse" />
              <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-pink-500 text-[10px] font-black text-white uppercase tracking-wider">
                Ativo
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {streak.currentStreak}
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-pink-400 uppercase tracking-wide">
                  {streak.currentStreak === 1 ? 'Dia de Ofensiva' : 'Dias de Ofensiva'}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-pink-100/80 max-w-md font-medium">
                {streak.currentStreak >= 7
                  ? 'Você está construindo uma versão melhor de si mesmo. Não pare agora!'
                  : streak.currentStreak > 0
                  ? 'Cada escolha de hoje fortalece sua disciplina para amanhã!'
                  : 'Dê o primeiro passo completando sua missão de hoje!'}
              </p>
            </div>
          </div>

          {/* Quick streak stats */}
          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-pink-500/20 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Recorde Pessoal
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Trophy size={18} className="text-amber-400" />
                <span className="text-xl font-black text-white">{streak.bestStreak} dias</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Consistência Semana
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck size={18} className="text-pink-400" />
                <span className="text-xl font-black text-pink-300">{weeklyConsistency}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote of the Day Card */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-950/80 bg-[#160611]/90 p-5 sm:p-6 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
                Pílula de Motivação
              </span>
              <blockquote className="mt-1 text-sm sm:text-base font-semibold text-white italic leading-relaxed">
                "{quote.text}"
              </blockquote>
              <span className="mt-1.5 block text-xs text-slate-400">
                — {quote.author}
              </span>
            </div>
          </div>

          <button
            onClick={() => drawNewQuote()}
            className="rounded-xl p-2 text-slate-400 hover:bg-pink-950/60 hover:text-pink-400 transition cursor-pointer"
            title="Sortear outra frase motivacional"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: Mission Checklist & Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Mission Quick Checklist */}
        <div className="lg:col-span-2 rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-pink-400" />
                  Minha Missão de Hoje
                </h3>
                <p className="text-xs text-slate-400">
                  {completedHabitsCount} de {totalHabitsCount} hábitos realizados ({progressPercent}%)
                </p>
              </div>

              <button
                onClick={() => setActiveTab('mission')}
                className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Ver completo</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-3 w-full rounded-full bg-black/40 overflow-hidden mb-5 border border-pink-950/60">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#ec4899]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Habit Quick List */}
            <div className="space-y-2.5">
              {habits.slice(0, 4).map((habit) => {
                const isChecked = todayLog.completedHabitIds.includes(habit.id);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabitToday(habit.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-pink-950/40 border-pink-500/40 text-pink-200'
                        : 'bg-black/20 border-pink-950/60 text-slate-300 hover:border-pink-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                          isChecked
                            ? 'bg-pink-500 border-pink-400 text-white font-black'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isChecked && <CheckCircle2 size={16} />}
                      </div>
                      <span className={`text-xs sm:text-sm font-semibold ${isChecked ? 'line-through text-slate-400' : ''}`}>
                        {habit.label}
                      </span>
                    </div>

                    <span className="text-[10px] text-pink-400 font-bold px-2 py-0.5 rounded-full bg-pink-950/80">
                      +30 XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-pink-950/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Critério mínimo: <strong>{profile.minHabitsToComplete} hábitos</strong>
            </span>
            <button
              onClick={() => setIsFinishModalOpen(true)}
              className="text-xs font-bold text-pink-400 hover:text-pink-300 transition cursor-pointer"
            >
              Revisar e Finalizar Dia →
            </button>
          </div>
        </div>

        {/* Right Col: Hydration & Next Meal Quick Glance */}
        <div className="space-y-6">
          
          {/* Hydration Widget */}
          <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-950/50 text-pink-400 border border-pink-500/30">
                  <Droplets size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Hidratação</h4>
                  <span className="text-[11px] text-slate-400">
                    Meta: {todayLog.waterTargetMl} ml
                  </span>
                </div>
              </div>
              <span className="text-sm font-black text-pink-400">{waterPercent}%</span>
            </div>

            {/* Water Progress */}
            <div className="h-2.5 w-full rounded-full bg-black/40 overflow-hidden mb-4 border border-pink-950/60">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-300"
                style={{ width: `${waterPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-white">
                {todayLog.waterIntakeMl}{' '}
                <span className="text-xs font-normal text-slate-400">ml consumidos</span>
              </span>
            </div>

            {/* Quick +/- buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateWaterIntake(250)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/30 text-pink-300 text-xs font-bold transition cursor-pointer"
              >
                <Plus size={14} />
                <span>+250 ml (Copo)</span>
              </button>

              <button
                onClick={() => updateWaterIntake(-250)}
                disabled={todayLog.waterIntakeMl <= 0}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black/30 hover:bg-black/50 border border-slate-800 text-slate-400 text-xs font-semibold disabled:opacity-40 transition cursor-pointer"
              >
                <Minus size={14} />
                <span>-250 ml</span>
              </button>
            </div>
          </div>

          {/* Quick Meal Reminder Card */}
          <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider">
                <Utensils size={14} />
                <span>Planejamento Alimentar</span>
              </div>
              <button
                onClick={() => setActiveTab('planning')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Ver tudo
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consulte e registre o que comeu hoje para manter a disciplina e tranquilidade com sua rotina.
            </p>
            <button
              onClick={() => setActiveTab('planning')}
              className="mt-3 w-full py-2 rounded-xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-500/30 text-xs text-pink-300 font-bold transition cursor-pointer"
            >
              Organizar Refeições do Dia
            </button>
          </div>

        </div>

      </div>

      {/* Finish Day Modal */}
      <DayFinishModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
      />
    </div>
  );
};
