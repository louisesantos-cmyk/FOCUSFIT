import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString, formatFullDatePtBr } from '../../utils/dateUtils';
import type { DailyLog, DayStatus } from '../../types';

export const CalendarHistory: React.FC = () => {
  const { logs, streak, habits, profile, updateLogForDate } = useApp();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayLog, setSelectedDayLog] = useState<DailyLog | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar generation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const todayStr = getTodayDateString();

  // Calendar statistics
  const totalLoggedDays = Object.values(logs).filter(
    (l) => l.status === 'completed' || l.status === 'failed'
  ).length;

  const completedDaysCount = Object.values(logs).filter(
    (l) => l.status === 'completed'
  ).length;

  const monthlyConsistency =
    totalLoggedDays > 0 ? Math.round((completedDaysCount / totalLoggedDays) * 100) : 0;

  // Day status helper
  const getDayInfo = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = formattedDate === todayStr;
    const isFuture = formattedDate > todayStr;
    const log = logs[formattedDate];

    let status: DayStatus = 'future';
    if (isFuture) {
      status = 'future';
    } else if (log) {
      status = log.status;
    } else if (isToday) {
      status = 'pending';
    } else {
      status = 'pending';
    }

    return {
      dateStr: formattedDate,
      isToday,
      isFuture,
      status,
      log,
    };
  };

  const handleDayClick = (day: number) => {
    const { dateStr, log, isFuture } = getDayInfo(day);
    if (isFuture) return;

    setSelectedDateStr(dateStr);
    setSelectedDayLog(
      log || {
        date: dateStr,
        status: 'pending',
        completedHabitIds: [],
        waterIntakeMl: 0,
        waterTargetMl: profile.dailyWaterTargetMl,
        notes: '',
      }
    );
  };

  const handleUpdateSelectedStatus = (status: DayStatus) => {
    if (!selectedDateStr) return;
    updateLogForDate(selectedDateStr, { status });
    setSelectedDayLog((prev) => (prev ? { ...prev, status } : null));
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 animate-fadeIn">
      
      {/* Top Banner & Quick Metrics */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-r from-pink-950/80 via-[#180612] to-[#0f040a] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-2">
              <CalendarDays size={13} className="text-pink-300" />
              <span>Visão Histórica</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Calendário de Ofensiva
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Acompanhe cada dia da sua jornada. Rosa representa vitórias diárias, amarelo pendências e vermelho dias em que você aprendeu com os deslizes.
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-pink-950">
              <Flame size={18} className="text-pink-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Ofensiva</span>
                <span className="text-sm font-black text-white">{streak.currentStreak} dias</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-pink-950">
              <Trophy size={18} className="text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Recorde</span>
                <span className="text-sm font-black text-white">{streak.bestStreak} dias</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-pink-950">
              <Sparkles size={18} className="text-pink-300" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Consistência</span>
                <span className="text-sm font-black text-pink-300">{monthlyConsistency}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap items-center gap-4 px-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 rounded-md bg-pink-500 shadow-[0_0_8px_#ec4899]" />
          <span className="text-slate-300 font-medium">Rosa: Dia Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 rounded-md bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
          <span className="text-slate-300 font-medium">Amarelo: Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 rounded-md bg-rose-600 shadow-[0_0_8px_#e11d48]" />
          <span className="text-slate-300 font-medium">Vermelho: Não cumprido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 rounded-md bg-slate-800" />
          <span className="text-slate-400 font-medium">Cinza: Futuro / Sem registro</span>
        </div>
      </div>

      {/* Interactive Monthly Calendar Card */}
      <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-xl">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>{monthNames[month]}</span>
            <span className="text-pink-400">{year}</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl border border-pink-950 bg-black/40 text-slate-300 hover:text-pink-400 transition cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-xl border border-pink-950 bg-black/40 text-xs font-semibold text-slate-300 hover:text-pink-400 transition cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl border border-pink-950 bg-black/40 text-slate-300 hover:text-pink-400 transition cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
          {weekDays.map((wd) => (
            <div key={wd} className="py-2">
              {wd}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Previous Month trailing days */}
          {Array.from({ length: firstDayIndex }).map((_, i) => {
            const prevDayNum = daysInPrevMonth - firstDayIndex + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="h-20 sm:h-24 rounded-2xl border border-slate-900/60 bg-black/20 p-2 text-slate-700 select-none opacity-40"
              >
                <span className="text-xs font-semibold">{prevDayNum}</span>
              </div>
            );
          })}

          {/* Current Month days */}
          {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
            const dayNum = i + 1;
            const { isToday, isFuture, status, log } = getDayInfo(dayNum);

            let bgStyle = 'bg-black/30 border-slate-900 text-slate-400';
            let dotStyle = 'bg-slate-700';

            if (status === 'completed') {
              bgStyle = 'bg-pink-950/40 border-pink-500/50 text-pink-200 hover:border-pink-400';
              dotStyle = 'bg-pink-400 shadow-[0_0_8px_#ec4899]';
            } else if (status === 'failed') {
              bgStyle = 'bg-rose-950/40 border-rose-500/40 text-rose-200 hover:border-rose-400';
              dotStyle = 'bg-rose-500';
            } else if (status === 'pending') {
              bgStyle = 'bg-amber-950/30 border-amber-500/40 text-amber-200 hover:border-amber-400';
              dotStyle = 'bg-amber-400';
            } else if (isFuture) {
              bgStyle = 'bg-black/10 border-slate-900/40 text-slate-600 opacity-50 cursor-not-allowed';
            }

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => handleDayClick(dayNum)}
                className={`relative h-20 sm:h-24 rounded-2xl border p-2 flex flex-col justify-between transition-all select-none ${
                  isFuture ? '' : 'cursor-pointer hover:scale-[1.02] active:scale-95'
                } ${bgStyle} ${isToday ? 'ring-2 ring-pink-400 ring-offset-2 ring-offset-black' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-pink-400' : ''}`}>
                    {dayNum}
                  </span>
                  {!isFuture && (
                    <div className={`h-2.5 w-2.5 rounded-full ${dotStyle}`} />
                  )}
                </div>

                {log && status === 'completed' && (
                  <div className="mt-auto">
                    <span className="hidden sm:inline-block text-[10px] font-bold text-pink-300 bg-pink-900/60 px-1.5 py-0.5 rounded-md">
                      {log.completedHabitIds.length} hábitos
                    </span>
                  </div>
                )}

                {status === 'pending' && !isFuture && (
                  <div className="mt-auto">
                    <span className="hidden sm:inline-block text-[10px] text-amber-400">
                      Pendente
                    </span>
                  </div>
                )}

                {status === 'failed' && (
                  <div className="mt-auto">
                    <span className="hidden sm:inline-block text-[10px] text-rose-400">
                      Falha
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Day Details Modal (when clicked on any day) */}
      {selectedDayLog && selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-pink-500/40 bg-gradient-to-b from-[#1c0816] via-[#140610] to-[#0d0308] p-6 text-white shadow-2xl">
            <button
              onClick={() => {
                setSelectedDayLog(null);
                setSelectedDateStr(null);
              }}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                  selectedDayLog.status === 'completed'
                    ? 'bg-pink-500/20 border-pink-400/50 text-pink-400'
                    : selectedDayLog.status === 'failed'
                    ? 'bg-rose-500/20 border-rose-400/50 text-rose-400'
                    : 'bg-amber-500/20 border-amber-400/50 text-amber-400'
                }`}
              >
                {selectedDayLog.status === 'completed' ? (
                  <CheckCircle2 size={26} />
                ) : selectedDayLog.status === 'failed' ? (
                  <XCircle size={26} />
                ) : (
                  <Clock size={26} />
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {formatFullDatePtBr(selectedDateStr)}
                </h3>
                <span className="text-xs uppercase font-extrabold tracking-wider text-pink-400">
                  Status:{' '}
                  {selectedDayLog.status === 'completed'
                    ? 'Concluído com Sucesso'
                    : selectedDayLog.status === 'failed'
                    ? 'Dia não cumprido'
                    : 'Pendente'}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-black/40 border border-pink-950 p-3">
                <span className="text-[11px] text-slate-400 block mb-1">Hábitos Cumpridos</span>
                <span className="text-lg font-bold text-white">
                  {selectedDayLog.completedHabitIds.length} / {habits.length}
                </span>
              </div>

              <div className="rounded-xl bg-black/40 border border-pink-950 p-3">
                <span className="text-[11px] text-slate-400 block mb-1">Água Registrada</span>
                <span className="text-lg font-bold text-pink-400">
                  {selectedDayLog.waterIntakeMl} ml
                </span>
              </div>
            </div>

            {/* Notes if any */}
            {selectedDayLog.notes && (
              <div className="rounded-xl bg-black/30 border border-pink-950 p-3 mb-4 text-xs text-slate-300">
                <strong className="text-slate-400 block mb-0.5">Reflexão anotada:</strong>
                "{selectedDayLog.notes}"
              </div>
            )}

            {/* Status switcher for past days */}
            <div className="border-t border-pink-950/80 pt-4 space-y-2">
              <span className="text-xs text-slate-400 block mb-2">
                Ajustar status deste dia:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateSelectedStatus('completed')}
                  className="py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition"
                >
                  Marcar Concluído
                </button>
                <button
                  onClick={() => handleUpdateSelectedStatus('failed')}
                  className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
                >
                  Marcar Não Cumprido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
