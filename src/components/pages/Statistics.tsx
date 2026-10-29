import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Flame,
  Droplets,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { getDaysAgoDateString } from '../../utils/dateUtils';

export const Statistics: React.FC = () => {
  const { logs, streak, habits, profile } = useApp();
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(14);

  // Consistency & Habits History data
  const historyData = [];
  let totalHabitsCompletedInRange = 0;
  let totalDaysCompletedInRange = 0;

  for (let i = rangeDays - 1; i >= 0; i--) {
    const dateStr = getDaysAgoDateString(i);
    const log = logs[dateStr];
    const isCompleted = log?.status === 'completed';
    const habitsCount = log?.completedHabitIds?.length || 0;
    const water = log?.waterIntakeMl || 0;

    if (isCompleted) totalDaysCompletedInRange++;
    totalHabitsCompletedInRange += habitsCount;

    const [, m, d] = dateStr.split('-');
    historyData.push({
      date: `${d}/${m}`,
      habitos: habitsCount,
      agua: water,
      status: log?.status || 'sem_registro',
      score: isCompleted ? 100 : log?.status === 'failed' ? 25 : 0,
    });
  }

  // Habit breakdown counts
  const habitStats = habits.map((h) => {
    let completedTimes = 0;
    for (let i = rangeDays - 1; i >= 0; i--) {
      const dateStr = getDaysAgoDateString(i);
      if (logs[dateStr]?.completedHabitIds?.includes(h.id)) {
        completedTimes++;
      }
    }
    const percent = Math.round((completedTimes / rangeDays) * 100);
    return {
      name: h.label.length > 20 ? h.label.substring(0, 18) + '...' : h.label,
      fullName: h.label,
      percent,
      completedTimes,
    };
  });

  const consistencyRate = Math.round((totalDaysCompletedInRange / rangeDays) * 100);
  const totalLogsCount = Object.keys(logs).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-10 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-r from-pink-950/80 via-[#180612] to-[#0f040a] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-2">
              <BarChart3 size={13} className="text-pink-300" />
              <span>Análise de Desempenho</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Estatísticas & Evolução
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Visualize seus dados reais de consistência, hábitos concluídos e hidratação ao longo do tempo.
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-pink-950">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                onClick={() => setRangeDays(days)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  rangeDays === days
                    ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days} dias
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-pink-950/70 bg-[#160611] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Flame size={16} className="text-pink-400" />
            <span>Ofensiva Atual</span>
          </div>
          <div className="text-2xl font-black text-white">
            {streak.currentStreak} <span className="text-xs text-slate-400 font-normal">dias</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Recorde: {streak.bestStreak}d</span>
        </div>

        <div className="rounded-2xl border border-pink-950/70 bg-[#160611] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <ShieldCheck size={16} className="text-pink-400" />
            <span>Consistência ({rangeDays}d)</span>
          </div>
          <div className="text-2xl font-black text-pink-300">
            {consistencyRate}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalDaysCompletedInRange} de {rangeDays} dias cumpridos
          </span>
        </div>

        <div className="rounded-2xl border border-pink-950/70 bg-[#160611] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <CheckCircle2 size={16} className="text-pink-400" />
            <span>Hábitos Feitos</span>
          </div>
          <div className="text-2xl font-black text-white">
            {totalHabitsCompletedInRange}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">No período selecionado</span>
        </div>

        <div className="rounded-2xl border border-pink-950/70 bg-[#160611] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Calendar size={16} className="text-pink-300" />
            <span>Total Registrado</span>
          </div>
          <div className="text-2xl font-black text-white">
            {totalLogsCount} <span className="text-xs text-slate-400 font-normal">dias</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Histórico persistido</span>
        </div>
      </div>

      {/* Chart 1: Habits Completed Over Time */}
      <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-pink-400" />
              <span>Evolução de Hábitos Concluídos por Dia</span>
            </h3>
            <p className="text-xs text-slate-400">
              Quantidade de hábitos cumpridos diariamente nos últimos {rangeDays} dias
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="habitsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e0f25" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, habits.length || 6]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#160611',
                  borderColor: '#ec4899',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="habitos"
                stroke="#ec4899"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#habitsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Habit Adherence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md">
          <h3 className="text-base font-bold text-white mb-1">
            Aderência por Hábito (%)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Quais hábitos você mais manteve com consistência
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitStats} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e0f25" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={75} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#160611',
                    borderColor: '#ec4899',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => [`${Number(val)}% de consistência`, 'Taxa']}
                />
                <Bar dataKey="percent" fill="#f472b6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Hydration Intake Over Time */}
        <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <Droplets size={18} className="text-pink-400" />
            <span>Ingestão de Água Diária (ml)</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Meta configurada: {profile.dailyWaterTargetMl} ml
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e0f25" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#160611',
                    borderColor: '#f43f5e',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => [`${Number(val)} ml`, 'Consumo']}
                />
                <Bar dataKey="agua" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};
