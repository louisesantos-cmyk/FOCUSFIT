import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Trash2,
  Droplets,
  Sparkles,
  Utensils,
  Apple,
  Clock,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDatePtBr } from '../../utils/dateUtils';
import { DayFinishModal } from '../common/DayFinishModal';

export const DailyMission: React.FC = () => {
  const {
    habits,
    addHabit,
    deleteHabit,
    todayLog,
    toggleHabitToday,
    updateWaterIntake,
    profile,
  } = useApp();

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitLabel, setNewHabitLabel] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'nutrition' | 'hydration' | 'mindset' | 'routine'>('nutrition');

  const completedCount = todayLog.completedHabitIds.length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isTargetMet = completedCount >= profile.minHabitsToComplete;

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitLabel.trim()) return;

    addHabit({
      label: newHabitLabel.trim(),
      description: newHabitDesc.trim() || 'Hábito personalizado para sua disciplina diária',
      category: newHabitCategory,
      icon: 'Sparkles',
      isCustom: true,
    });

    setNewHabitLabel('');
    setNewHabitDesc('');
    setShowAddHabit(false);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils size={18} className="text-pink-400" />;
      case 'Apple':
        return <Apple size={18} className="text-rose-400" />;
      case 'Droplets':
        return <Droplets size={18} className="text-pink-400" />;
      case 'Clock':
        return <Clock size={18} className="text-fuchsia-400" />;
      case 'ShieldCheck':
        return <ShieldCheck size={18} className="text-pink-300" />;
      default:
        return <Sparkles size={18} className="text-pink-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-950/80 via-[#180612] to-[#0f040a] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-2">
              <CheckCircle2 size={13} className="text-pink-300" />
              <span>{formatDatePtBr(todayLog.date)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Minha Missão de Hoje
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Marque as pequenas vitórias ao longo do dia. O objetivo não é ser 100% perfeito, mas consistente e consciente.
            </p>
          </div>

          {/* Prominent Finish Day Button */}
          <button
            onClick={() => setIsFinishModalOpen(true)}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-sm shadow-xl shadow-pink-500/25 transition transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
          >
            <CheckCircle2 size={20} />
            <span>FINALIZAR MEU DIA</span>
          </button>
        </div>

        {/* Progress bar inside banner */}
        <div className="mt-6 pt-5 border-t border-pink-950/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-semibold">
              Progresso da Missão: <strong>{completedCount} de {totalCount} hábitos concluídos</strong>
            </span>
            <span className="text-pink-400 font-black">{progressPercent}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-black/50 overflow-hidden border border-pink-950">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500 shadow-[0_0_12px_#ec4899]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Meta mínima para validar o dia: <strong>{profile.minHabitsToComplete} hábitos</strong>
            </span>
            {isTargetMet ? (
              <span className="text-pink-400 font-bold flex items-center gap-1">
                ✓ Critério diário atingido!
              </span>
            ) : (
              <span className="text-amber-400">
                Faltam {profile.minHabitsToComplete - completedCount} hábitos para o critério mínimo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hydration Tracker Section */}
      <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-950/50 text-pink-400 border border-pink-500/30">
              <Droplets size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Controle de Hidratação Diária</h3>
              <p className="text-xs text-slate-400">
                Meta do seu perfil: {todayLog.waterTargetMl} ml por dia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateWaterIntake(250)}
              className="px-3.5 py-2 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/30 text-pink-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>+250 ml (Copo)</span>
            </button>
            <button
              onClick={() => updateWaterIntake(500)}
              className="px-3.5 py-2 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/30 text-pink-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>+500 ml (Garrafa)</span>
            </button>
          </div>
        </div>

        {/* Visual Cups Indicator */}
        <div className="flex flex-wrap items-center gap-2 my-3">
          {Array.from({ length: 10 }).map((_, idx) => {
            const filled = todayLog.waterIntakeMl >= (idx + 1) * 250;
            return (
              <div
                key={idx}
                onClick={() => {
                  const targetMl = (idx + 1) * 250;
                  const delta = targetMl - todayLog.waterIntakeMl;
                  updateWaterIntake(delta);
                }}
                className={`flex-1 min-w-[50px] p-2 rounded-xl border text-center transition cursor-pointer ${
                  filled
                    ? 'bg-pink-950/80 border-pink-400/50 text-pink-300'
                    : 'bg-black/30 border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
                title={`Copo ${idx + 1}: ${(idx + 1) * 250} ml`}
              >
                <Droplets size={16} className="mx-auto mb-1" />
                <span className="text-[10px] font-bold block">{(idx + 1) * 250}ml</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <span>Total ingerido: <strong className="text-white">{todayLog.waterIntakeMl} ml</strong></span>
          {todayLog.waterIntakeMl >= todayLog.waterTargetMl && (
            <span className="text-pink-400 font-bold flex items-center gap-1">
              🎉 Meta de água batida hoje! (+100 XP)
            </span>
          )}
        </div>
      </div>

      {/* Habits Checklist List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Hábitos & Disciplina</span>
            <span className="text-xs text-slate-400 font-normal">
              (Clique para marcar ou desmarcar)
            </span>
          </h2>

          <button
            onClick={() => setShowAddHabit(!showAddHabit)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-500/30 bg-pink-950/40 text-xs font-semibold text-pink-300 hover:bg-pink-900/40 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Adicionar Hábito</span>
          </button>
        </div>

        {/* Add Habit Inline Form */}
        {showAddHabit && (
          <form
            onSubmit={handleAddHabit}
            className="rounded-3xl border border-pink-500/40 bg-gradient-to-b from-pink-950/40 to-black/60 p-5 space-y-4 animate-fadeIn"
          >
            <h4 className="text-sm font-bold text-white">Novo Hábito Personalizado</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Nome do hábito:
                </label>
                <input
                  type="text"
                  value={newHabitLabel}
                  onChange={(e) => setNewHabitLabel(e.target.value)}
                  placeholder="Ex: Não consumir refrigerante ou fritura"
                  required
                  className="w-full rounded-xl border border-pink-950 bg-black/60 p-2.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Descrição ou dica:
                </label>
                <input
                  type="text"
                  value={newHabitDesc}
                  onChange={(e) => setNewHabitDesc(e.target.value)}
                  placeholder="Ex: Focar em opções integrais ou água com limão"
                  className="w-full rounded-xl border border-pink-950 bg-black/60 p-2.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Categoria:</label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value as any)}
                  className="rounded-lg border border-pink-950 bg-black/60 p-1.5 text-xs text-slate-200"
                >
                  <option value="nutrition">Alimentação</option>
                  <option value="hydration">Hidratação</option>
                  <option value="mindset">Mentalidade / Autocontrole</option>
                  <option value="routine">Rotina</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHabit(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs transition"
                >
                  Salvar Hábito
                </button>
              </div>
            </div>
          </form>
        )}

        {/* List of Habits */}
        <div className="space-y-3">
          {habits.map((habit) => {
            const isCompleted = todayLog.completedHabitIds.includes(habit.id);
            return (
              <div
                key={habit.id}
                className={`group flex items-center justify-between p-4 rounded-3xl border transition-all ${
                  isCompleted
                    ? 'bg-pink-950/30 border-pink-500/40 shadow-sm shadow-pink-500/10'
                    : 'bg-[#160611] border-pink-950/60 hover:border-pink-500/20'
                }`}
              >
                <div
                  onClick={() => toggleHabitToday(habit.id)}
                  className="flex items-start gap-3.5 flex-1 cursor-pointer select-none"
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl border transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_8px_#ec4899]'
                        : 'border-slate-600 bg-black/40 group-hover:border-pink-500/50'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : null}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(habit.icon)}
                      <h4
                        className={`text-sm font-bold ${
                          isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {habit.label}
                      </h4>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                      {habit.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl transition ${
                      isCompleted
                        ? 'bg-pink-500/20 text-pink-300'
                        : 'bg-black/40 text-slate-400'
                    }`}
                  >
                    +30 XP
                  </span>

                  {habit.isCustom && (
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Excluir hábito personalizado"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful Mindset Note */}
      <div className="rounded-3xl border border-pink-950/80 bg-black/30 p-5 text-xs text-slate-400 flex items-start gap-3">
        <Heart size={20} className="text-pink-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200 block mb-1">Filosofia FOCUSFIT:</strong>
          Comer bem é um ato de autocuidado e energia para seus dias. Se por algum motivo você não conseguir cumprir todos os hábitos hoje, não se cobre excessivamente. Mantenha a presença e lembre-se: a consistência no longo prazo sempre vence a busca pela perfeição imediata.
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
