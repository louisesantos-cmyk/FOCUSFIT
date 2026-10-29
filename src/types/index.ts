export type DayStatus = 'completed' | 'failed' | 'pending' | 'future';

export interface HabitItem {
  id: string;
  label: string;
  description: string;
  category: 'nutrition' | 'hydration' | 'mindset' | 'routine';
  icon: string;
  isCustom?: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  status: DayStatus;
  completedHabitIds: string[];
  waterIntakeMl: number;
  waterTargetMl: number;
  notes?: string;
  energyRating?: number; // 1-5
  hungerControlRating?: number; // 1-5
  finalizedAt?: string; // ISO
  streakCountAtTime?: number;
}

export interface MealItem {
  id: string;
  title: string; // "Café da Manhã", "Almoço", "Lanche", "Jantar", "Ceia"
  time: string; // "08:00"
  plannedDescription: string;
  actualDescription?: string;
  followed?: boolean;
  notes?: string;
}

export type QuoteCategory =
  | 'start_day'
  | 'lunch'
  | 'dinner'
  | 'discouraged'
  | 'streak_risk'
  | 'achievement'
  | 'consistency';

export interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
  category: QuoteCategory;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: 'streak' | 'habits' | 'hydration' | 'resilience';
  requiredStreak?: number;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progressCurrent: number;
  progressMax: number;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'reminder' | 'streak_risk' | 'achievement' | 'motivation' | 'system';
}

export interface UserProfile {
  name: string;
  nickname: string;
  avatar: string;
  theme: 'dark' | 'light';
  dailyWaterTargetMl: number;
  minHabitsToComplete: number; // default: 4
  browserNotificationsEnabled: boolean;
  soundEnabled: boolean;
  reminderTimes: {
    breakfast: string;
    lunch: string;
    snack: string;
    dinner: string;
    dailyReview: string;
    waterReminderEnabled: boolean;
    waterIntervalMinutes: number;
  };
}

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  status: 'active' | 'at_risk' | 'broken';
  lastCompletedDate: string | null;
  lastFailedDate: string | null;
  riskMessage?: string;
}

export type NavTab =
  | 'dashboard'
  | 'mission'
  | 'planning'
  | 'calendar'
  | 'achievements'
  | 'stats'
  | 'settings';
