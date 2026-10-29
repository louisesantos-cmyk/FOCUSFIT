import type { HabitItem } from '../types';

export const DEFAULT_HABITS: HabitItem[] = [
  {
    id: 'habit_plan',
    label: 'Segui meu plano alimentar',
    description: 'Comi alimentos equilibrados de acordo com meu objetivo do dia',
    category: 'nutrition',
    icon: 'Utensils',
    isCustom: false,
  },
  {
    id: 'habit_greens',
    label: 'Incluí frutas ou vegetais nas minhas refeições',
    description: 'Garantindo fibras essenciais, saciedade e micronutrientes',
    category: 'nutrition',
    icon: 'Apple',
    isCustom: false,
  },
  {
    id: 'habit_water',
    label: 'Bebi água ao longo do dia',
    description: 'Mantive meu corpo hidratado e a mente alerta',
    category: 'hydration',
    icon: 'Droplets',
    isCustom: false,
  },
  {
    id: 'habit_meals_done',
    label: 'Fiz minhas refeições planejadas',
    description: 'Sem pular refeições ou ficar em jejum excessivo e descontrolado',
    category: 'routine',
    icon: 'Clock',
    isCustom: false,
  },
  {
    id: 'habit_impulse',
    label: 'Evitei comer por impulso',
    description: 'Diferenciei fome fisiológica de ansiedade e fiz escolhas conscientes',
    category: 'mindset',
    icon: 'ShieldCheck',
    isCustom: false,
  },
  {
    id: 'habit_logged',
    label: 'Registrei minha alimentação do dia',
    description: 'Acompanhei o que consumi com honestidade e transparência',
    category: 'mindset',
    icon: 'CheckCircle2',
    isCustom: false,
  },
];
