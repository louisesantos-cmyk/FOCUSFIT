import React from 'react';
import { Trophy, Award, Crown, Sparkles, Zap, ShieldCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MilestoneCelebrationModalProps {
  milestone: {
    streak: number;
    title: string;
    subtitle: string;
    icon: string;
  } | null;
  onClose: () => void;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  milestone,
  onClose,
}) => {
  if (!milestone) return null;

  const triggerMoreConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#f43f5e', '#f472b6', '#fb7185', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  const renderIcon = () => {
    switch (milestone.icon) {
      case 'Zap':
        return <Zap size={56} className="text-amber-400 fill-amber-400" />;
      case 'Award':
        return <Award size={56} className="text-pink-400 fill-pink-400" />;
      case 'ShieldCheck':
        return <ShieldCheck size={56} className="text-pink-300" />;
      case 'Trophy':
        return <Trophy size={56} className="text-yellow-400 fill-yellow-400" />;
      case 'Crown':
        return <Crown size={56} className="text-pink-300 fill-pink-300" />;
      case 'Sparkles':
      default:
        return <Sparkles size={56} className="text-pink-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-pink-500/40 bg-gradient-to-b from-pink-950/90 via-[#180612] to-[#0f040a] p-8 text-center shadow-2xl shadow-pink-500/20">
        {/* Glow ambient background circle */}
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-pink-500/20 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-3xl bg-pink-900/40 border border-pink-400/40 shadow-inner shadow-pink-500/30 glow-streak">
          {renderIcon()}
        </div>

        <div className="inline-block px-3 py-1 mb-3 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold uppercase tracking-widest">
          Marco Histórico
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          {milestone.title}
        </h2>

        <p className="text-sm sm:text-base text-pink-100/90 leading-relaxed mb-8 px-2 font-medium">
          {milestone.subtitle}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              triggerMoreConfetti();
              setTimeout(onClose, 400);
            }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-base shadow-lg shadow-pink-500/25 transition-all transform active:scale-95 cursor-pointer"
          >
            Continuar Focado! 🚀
          </button>

          <button
            onClick={triggerMoreConfetti}
            className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:border-pink-500/40 text-xs text-slate-300 hover:text-pink-300 transition"
          >
            Soltar mais confetes 🎉
          </button>
        </div>
      </div>
    </div>
  );
};
