import type { MealItem } from '../types';

export const DEFAULT_MEAL_PLANS: MealItem[] = [
  {
    id: 'meal_1',
    title: 'Café da Manhã',
    time: '07:30',
    plannedDescription: '2 ovos mexidos, 1 fatia de pão integral com queijo branco e 1 fruta (maçã ou mamão) + café sem açúcar.',
    actualDescription: 'Ovos mexidos com pão integral e café com canela.',
    followed: true,
    notes: 'Muita saciedade e energia para o início do dia.',
  },
  {
    id: 'meal_2',
    title: 'Almoço',
    time: '12:30',
    plannedDescription: 'Prato metade salada colorida (alface, tomate, cenoura), 1 concha de feijão, 3 colheres de arroz e filé de frango grelhado.',
    actualDescription: '',
    followed: false,
    notes: 'Caprichar no azeite de oliva e limão na salada.',
  },
  {
    id: 'meal_3',
    title: 'Lanche da Tarde',
    time: '16:30',
    plannedDescription: 'Iogurte natural com 1 colher de chia/aveia e 1 punhado pequeno de castanhas ou fruta.',
    actualDescription: '',
    followed: false,
    notes: 'Evitar beliscar bolachas e doces do escritório.',
  },
  {
    id: 'meal_4',
    title: 'Jantar',
    time: '20:00',
    plannedDescription: 'Omelete com legumes picados ou salmão/peito de frango com legumes cozidos no vapor.',
    actualDescription: '',
    followed: false,
    notes: 'Refeição leve para não prejudicar o sono.',
  },
];
