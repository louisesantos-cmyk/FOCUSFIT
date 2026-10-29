import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Sparkles,
  Droplets,
  HeartHandshake,
  Star,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { DayStatus } from '../../types';

interface DayFinishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DayFinishModal: React.FC<DayFinishModalProps> = ({ isOpen, onClose }) => {
  const { todayLog, habits, profile, finalizeDay } = useApp();

  const [notes, setNotes] = useState(todayLog.notes || '');
  const [energyRating, setEnergyRating] = useState(todayLog.energyRating || 4);
  const [hungerRating, setHungerRating] = useState(todayLog.hungerControlRating || 4);
  const [confirmFailModal, setConfirmFailModal] = useState(false);

  if (!isOpen) return null;

  const completedCount = todayLog.completedHabitIds.length;
  const totalCount = habits.length;
  const minRequired = profile.minHabitsToComplete;
  const isCriteriaMet = completedCount >= minRequired;
  const waterMet = todayLog.waterIntakeMl >= todayLog.waterTargetMl;

  const handleConfirmCompleted = () => {
    finalizeDay('completed' as DayStatus, notes, energyRating, hungerRating);
    onClose();
  };

  const handleConfirmFailed = () => {
    finalizeDay('failed' as DayStatus, notes, energyRating, hungerRating);
    setConfirmFailModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#1c0816] via-[#140610] to-[#0d0308] p-6 sm:p-8 text-white shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {!confirmFailModal ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/20 border border-pink-400/40 text-pink-400">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">Finalizar Meu Dia</h3>
                <p className="text-xs text-slate-300">
                  Revise seu progresso e confirme seu registro de hoje
                </p>
              </div>
            </div>

            {/* Criteria Evaluation Banner */}
            <div
              className={`rounded-2xl p-4 mb-5 border ${
                isCriteriaMet
                  ? 'bg-pink-950/60 border-pink-500/40 text-pink-100'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCriteriaMet ? (
                  <Sparkles size={20} className="text-pink-300 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs leading-relaxed">
                  <span className="font-bold block text-sm mb-0.5">
                    {isCriteriaMet
                      ? '🎯 Critérios de consistência alcançados!'
                      : '⚠️ Atenção aos seus critérios diários'}
                  </span>
                  {isCriteriaMet ? (
                    <span>
                      Você cumpriu <strong>{completedCount} de {totalCount}</strong> hábitos (seu critério mínimo é de {minRequired}). Excelente consistência!
                    </span>
                  ) : (
                    <span>
                      Você marcou <strong>{completedCount} de {totalCount}</strong> hábitos (meta mínima: {minRequired}). Você pode marcar mais itens ou confirmar mesmo assim, pois o que importa é a honestidade com seu processo.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl border border-pink-950/80 bg-black/30 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <CheckCircle2 size={14} className="text-pink-400" />
                  <span>Hábitos Feitos</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {completedCount} <span className="text-xs text-slate-400 font-normal">/ {totalCount}</span>
                </div>
              </div>

              <div className="rounded-xl border border-pink-950/80 bg-black/30 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Droplets size={14} className="text-pink-400" />
                  <span>Água Total</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {todayLog.waterIntakeMl} <span className="text-xs text-slate-400 font-normal">ml</span>
                  {waterMet && <span className="text-xs text-pink-400 ml-1 font-bold">✓ Meta</span>}
                </div>
              </div>
            </div>

            {/* Rating Stars: Energy & Appetite */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Como estava seu nível de energia hoje?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEnergyRating(star)}
                      className="p-1 text-slate-400 hover:text-pink-400 transition cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={
                          star <= energyRating
                            ? 'text-pink-400 fill-pink-400'
                            : 'text-slate-600'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2">
                    {energyRating === 5 ? 'Excelente' : energyRating >= 3 ? 'Bom' : 'Baixo'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Como foi seu controle da fome e escolhas conscientes?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setHungerRating(star)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={
                          star <= hungerRating
                            ? 'text-rose-400 fill-rose-400'
                            : 'text-slate-600'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2">
                    {hungerRating === 5 ? 'Total controle' : hungerRating >= 3 ? 'Equilibrado' : 'Desafios'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reflection Notes */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reflexão do dia (opcional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Segui meu almoço perfeitamente, bebi bastante água e resisti aos doces no trabalho..."
                rows={2}
                className="w-full rounded-2xl border border-pink-950/80 bg-black/40 p-3 text-xs text-white placeholder-slate-500 focus:border-pink-500/60 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={handleConfirmCompleted}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-extrabold text-sm shadow-lg shadow-pink-500/25 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                <span>Confirmar Dia Concluído (+200 XP)</span>
              </button>

              <button
                onClick={() => setConfirmFailModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-500/30 hover:border-rose-500/60 bg-rose-950/20 text-xs font-semibold text-rose-300 hover:text-rose-200 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <XCircle size={15} />
                <span>Registrar que não cumpri hoje</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Continuar o dia e finalizar mais tarde
              </button>
            </div>
          </div>
        ) : (
          /* Sub-modal: Confirm Day as not met with positive coaching */
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-400">
              <HeartHandshake size={32} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Sem culpa, com consciência</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto mb-6">
              Dias difíceis acontecem com qualquer pessoa. Registrar com honestidade é um sinal de maturidade e disciplina. Seu histórico e conquistas anteriores <strong>nunca são apagados</strong>.
            </p>

            <div className="rounded-2xl bg-black/30 border border-pink-950/80 p-3.5 text-xs text-slate-400 text-left mb-6">
              <span className="font-bold text-pink-300 block mb-1">Regra de proteção FOCUSFIT:</span>
              Uma única falha não quebra sua ofensiva imediatamente — ela apenas fica em atenção. Se você retomar amanhã, sua sequência continua firme!
            </div>

            <div className="space-y-2">
              <button
                onClick={handleConfirmFailed}
                className="w-full py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition cursor-pointer"
              >
                Salvar registro e focar em amanhã
              </button>
              <button
                onClick={() => setConfirmFailModal(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition"
              >
                Voltar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
