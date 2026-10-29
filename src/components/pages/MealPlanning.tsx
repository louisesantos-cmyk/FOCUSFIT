import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Clock,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { MealItem } from '../../types';

export const MealPlanning: React.FC = () => {
  const { meals, addMeal, editMeal, deleteMeal, toggleMealFollowed } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('12:00');
  const [plannedDescription, setPlannedDescription] = useState('');
  const [actualDescription, setActualDescription] = useState('');
  const [notes, setNotes] = useState('');

  const openAddForm = () => {
    setTitle('Lanche');
    setTime('16:00');
    setPlannedDescription('');
    setActualDescription('');
    setNotes('');
    setEditingId(null);
    setIsAdding(true);
  };

  const openEditForm = (meal: MealItem) => {
    setTitle(meal.title);
    setTime(meal.time);
    setPlannedDescription(meal.plannedDescription);
    setActualDescription(meal.actualDescription || '');
    setNotes(meal.notes || '');
    setEditingId(meal.id);
    setIsAdding(true);
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !plannedDescription.trim()) return;

    if (editingId) {
      editMeal(editingId, {
        title: title.trim(),
        time,
        plannedDescription: plannedDescription.trim(),
        actualDescription: actualDescription.trim(),
        notes: notes.trim(),
      });
    } else {
      addMeal({
        title: title.trim(),
        time,
        plannedDescription: plannedDescription.trim(),
        actualDescription: actualDescription.trim(),
        followed: false,
        notes: notes.trim(),
      });
    }

    setIsAdding(false);
    setEditingId(null);
  };

  const mealsFollowedCount = meals.filter((m) => m.followed).length;
  const adherencePercent =
    meals.length > 0 ? Math.round((mealsFollowedCount / meals.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-10 animate-fadeIn">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-r from-pink-950/80 via-[#180612] to-[#0f040a] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-2">
              <UtensilsCrossed size={13} className="text-pink-300" />
              <span>Rotina Alimentar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Planejamento de Refeições
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Organize seus horários, defina seus pratos e anote o que consumiu. Este espaço é seu guia pessoal para manter o foco ao longo do dia.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-500/20 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={18} />
            <span>Adicionar Refeição</span>
          </button>
        </div>

        {/* Adherence summary */}
        <div className="mt-6 pt-4 border-t border-pink-950/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span>Refeições seguidas hoje:</span>
            <strong className="text-pink-400 text-sm">
              {mealsFollowedCount} de {meals.length} ({adherencePercent}%)
            </strong>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles size={14} className="text-pink-400" />
            <span>Marque "Segui o planejado" para ganhar +40 XP</span>
          </div>
        </div>
      </div>

      {/* Non-medical Disclaimer */}
      <div className="rounded-2xl border border-pink-950/80 bg-black/30 p-4 text-xs text-slate-400 flex items-start gap-3">
        <AlertCircle size={18} className="text-pink-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Aviso informativo:</strong> O FOCUSFIT é uma ferramenta de apoio a hábitos e organização pessoal. Não prescrevemos dietas médicas restritivas. Utilize este espaço para acompanhar o plano acordado com seu nutricionista ou médico.
        </div>
      </div>

      {/* Add / Edit Form Modal / Card */}
      {isAdding && (
        <form
          onSubmit={handleSaveMeal}
          className="rounded-3xl border border-pink-500/40 bg-gradient-to-b from-pink-950/50 to-[#160611] p-6 shadow-xl space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-pink-950/80 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-pink-400" />
              <span>{editingId ? 'Editar Refeição' : 'Nova Refeição Planejada'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome da refeição:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Almoço Nutritivo, Lanche da Tarde..."
                required
                className="w-full rounded-xl border border-pink-950 bg-black/60 p-2.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Horário previsto:
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full rounded-xl border border-pink-950 bg-black/60 p-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Planejamento (o que você planeja comer):
            </label>
            <textarea
              value={plannedDescription}
              onChange={(e) => setPlannedDescription(e.target.value)}
              placeholder="Ex: Salada variada, 1 filé de peito de frango grelhado, 1 concha de feijão, 3 colheres de arroz integral..."
              rows={2}
              required
              className="w-full rounded-xl border border-pink-950 bg-black/60 p-2.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              O que comi na prática (anotação real):
            </label>
            <textarea
              value={actualDescription}
              onChange={(e) => setActualDescription(e.target.value)}
              placeholder="Ex: Comi exatamente o planejado e adicionei 1 rodela de abacaxi de sobremesa."
              rows={2}
              className="w-full rounded-xl border border-pink-950 bg-black/60 p-2.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dica ou observação pessoal:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Beber 1 copo de água 20 minutos antes; mastigar devagar..."
              className="w-full rounded-xl border border-pink-950 bg-black/60 p-2.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs transition"
            >
              {editingId ? 'Salvar Alterações' : 'Criar Refeição'}
            </button>
          </div>
        </form>
      )}

      {/* Meals Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className={`rounded-3xl border p-5 transition-all ${
              meal.followed
                ? 'border-pink-500/40 bg-gradient-to-b from-pink-950/40 to-[#190814]'
                : 'border-pink-950/70 bg-[#160611] hover:border-pink-500/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-pink-400 bg-pink-950/80 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                    <Clock size={12} />
                    {meal.time}
                  </span>
                  <h3 className="text-base font-bold text-white">{meal.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditForm(meal)}
                  className="p-1.5 text-slate-400 hover:text-pink-400 transition cursor-pointer"
                  title="Editar refeição"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => deleteMeal(meal.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Excluir refeição"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Planned Description */}
            <div className="rounded-2xl bg-black/30 p-3 mb-3 border border-pink-950/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Planejado:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {meal.plannedDescription}
              </p>
            </div>

            {/* Actual Intake (if any) */}
            {meal.actualDescription && (
              <div className="rounded-2xl bg-pink-950/20 p-3 mb-3 border border-pink-500/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 block mb-1">
                  O que comi:
                </span>
                <p className="text-xs text-pink-100 leading-relaxed">
                  {meal.actualDescription}
                </p>
              </div>
            )}

            {/* Notes (if any) */}
            {meal.notes && (
              <div className="text-[11px] text-slate-400 italic mb-4 px-1">
                💡 {meal.notes}
              </div>
            )}

            {/* Followed Action Button */}
            <button
              onClick={() => toggleMealFollowed(meal.id)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                meal.followed
                  ? 'bg-pink-500 text-white shadow-[0_0_12px_#ec4899]'
                  : 'bg-pink-950/50 hover:bg-pink-900/50 border border-pink-500/30 text-pink-300'
              }`}
            >
              {meal.followed ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Seguido com Sucesso! (+40 XP)</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Marcar como Seguido</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
