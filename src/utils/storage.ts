import type {
  Achievement,
  DailyLog,
  HabitItem,
  InAppNotification,
  MealItem,
  UserProfile,
} from '../types';
import { DEFAULT_ACHIEVEMENTS } from '../data/defaultAchievements';
import { DEFAULT_HABITS } from '../data/defaultHabits';
import { DEFAULT_MEAL_PLANS } from '../data/defaultMealPlans';
import { getDaysAgoDateString, getTodayDateString } from './dateUtils';

const STORAGE_KEYS = {
  PROFILE: 'focusfit_profile_v1',
  HABITS: 'focusfit_habits_v1',
  LOGS: 'focusfit_logs_v1',
  MEALS: 'focusfit_meals_v1',
  ACHIEVEMENTS: 'focusfit_achievements_v1',
  NOTIFICATIONS: 'focusfit_notifications_v1',
  BEST_STREAK: 'focusfit_best_streak_v1',
  USER_XP: 'focusfit_user_xp_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Lucas',
  nickname: 'Atleta do Foco',
  avatar: '🥑',
  theme: 'dark',
  dailyWaterTargetMl: 2500,
  minHabitsToComplete: 4,
  browserNotificationsEnabled: false,
  soundEnabled: true,
  reminderTimes: {
    breakfast: '07:30',
    lunch: '12:30',
    snack: '16:30',
    dinner: '20:00',
    dailyReview: '21:30',
    waterReminderEnabled: true,
    waterIntervalMinutes: 120,
  },
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadHabits(): HabitItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) return DEFAULT_HABITS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_HABITS;
  }
}

export function saveHabits(habits: HabitItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits', e);
  }
}

export function loadLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      // Default initial log for today if none exists
      const today = getTodayDateString();
      const initialLogs: Record<string, DailyLog> = {
        [today]: {
          date: today,
          status: 'pending',
          completedHabitIds: ['habit_plan', 'habit_water'],
          waterIntakeMl: 1000,
          waterTargetMl: 2500,
          notes: '',
        },
      };
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveLogs(logs: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs', e);
  }
}

export function loadMeals(): MealItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (!raw) return DEFAULT_MEAL_PLANS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MEAL_PLANS;
  }
}

export function saveMeals(meals: MealItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  } catch (e) {
    console.error('Failed to save meals', e);
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!raw) return DEFAULT_ACHIEVEMENTS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {
    console.error('Failed to save achievements', e);
  }
}

export function loadNotifications(): InAppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      return [
        {
          id: 'welcome_notif',
          title: 'Bem-vindo ao FOCUSFIT!',
          message: 'Seu personal trainer alimentar está pronto para ajudar você a construir disciplina diária.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'motivation',
        },
        {
          id: 'tip_notif',
          title: 'Como funciona a Ofensiva (Streak)?',
          message: 'Cumpra seus objetivos diários e finalize o dia para avançar! 1 falha gera aviso; 2 falhas consecutivas reiniciam sua sequência.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'reminder',
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: InAppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function loadBestStreak(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BEST_STREAK);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveBestStreak(streak: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BEST_STREAK, String(streak));
  } catch (e) {
    console.error('Failed to save best streak', e);
  }
}

export function loadUserXP(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_XP);
    return raw ? parseInt(raw, 10) || 250 : 250;
  } catch {
    return 250;
  }
}

export function saveUserXP(xp: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_XP, String(xp));
  } catch (e) {
    console.error('Failed to save XP', e);
  }
}

/**
 * Exports complete app data as a JSON file for user backup.
 */
export function exportAppData(): void {
  const data = {
    profile: loadProfile(),
    habits: loadHabits(),
    logs: loadLogs(),
    meals: loadMeals(),
    achievements: loadAchievements(),
    notifications: loadNotifications(),
    bestStreak: loadBestStreak(),
    userXp: loadUserXP(),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focusfit-backup-${getTodayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Imports app data from a validated JSON string.
 */
export function importAppData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') return false;

    if (parsed.profile) saveProfile(parsed.profile);
    if (parsed.habits) saveHabits(parsed.habits);
    if (parsed.logs) saveLogs(parsed.logs);
    if (parsed.meals) saveMeals(parsed.meals);
    if (parsed.achievements) saveAchievements(parsed.achievements);
    if (parsed.notifications) saveNotifications(parsed.notifications);
    if (parsed.bestStreak !== undefined) saveBestStreak(parsed.bestStreak);
    if (parsed.userXp !== undefined) saveUserXP(parsed.userXp);

    return true;
  } catch (e) {
    console.error('Failed to import app data', e);
    return false;
  }
}

/**
 * Creates demonstration scenarios for quick testing of all requested rules.
 */
export function createScenarioLogs(scenario: '7_days_streak' | 'at_risk_1_fail' | 'broken_2_fails' | 'reset'): {
  logs: Record<string, DailyLog>;
  bestStreak: number;
} {
  const logs: Record<string, DailyLog> = {};
  const today = getTodayDateString();

  if (scenario === 'reset') {
    logs[today] = {
      date: today,
      status: 'pending',
      completedHabitIds: ['habit_plan', 'habit_water'],
      waterIntakeMl: 1000,
      waterTargetMl: 2500,
      notes: '',
    };
    return { logs, bestStreak: 0 };
  }

  if (scenario === '7_days_streak') {
    // 6 consecutive completed days in the past + today completed = 7 days
    for (let i = 6; i >= 1; i--) {
      const date = getDaysAgoDateString(i);
      logs[date] = {
        date,
        status: 'completed',
        completedHabitIds: ['habit_plan', 'habit_greens', 'habit_water', 'habit_meals_done', 'habit_logged'],
        waterIntakeMl: 2600,
        waterTargetMl: 2500,
        notes: `Dia ${7 - i} concluído com sucesso e foco total!`,
        energyRating: 5,
        hungerControlRating: 4,
        finalizedAt: new Date().toISOString(),
      };
    }
    // Today completed
    logs[today] = {
      date: today,
      status: 'completed',
      completedHabitIds: ['habit_plan', 'habit_greens', 'habit_water', 'habit_meals_done', 'habit_impulse', 'habit_logged'],
      waterIntakeMl: 2800,
      waterTargetMl: 2500,
      notes: '7º dia consecutivo alcançado! Me sinto energizado e no controle!',
      energyRating: 5,
      hungerControlRating: 5,
      finalizedAt: new Date().toISOString(),
    };
    return { logs, bestStreak: 7 };
  }

  if (scenario === 'at_risk_1_fail') {
    // 5 consecutive completed days in the past
    for (let i = 6; i >= 2; i--) {
      const date = getDaysAgoDateString(i);
      logs[date] = {
        date,
        status: 'completed',
        completedHabitIds: ['habit_plan', 'habit_water', 'habit_meals_done', 'habit_logged'],
        waterIntakeMl: 2400,
        waterTargetMl: 2500,
        notes: 'Dia bem equilibrado.',
        energyRating: 4,
        hungerControlRating: 4,
      };
    }
    // Yesterday was failed (1 single failure)
    const yesterday = getDaysAgoDateString(1);
    logs[yesterday] = {
      date: yesterday,
      status: 'failed',
      completedHabitIds: ['habit_water'],
      waterIntakeMl: 800,
      waterTargetMl: 2500,
      notes: 'Tive reuniões o dia todo e comi fora do planejado.',
      energyRating: 2,
      hungerControlRating: 2,
      finalizedAt: new Date().toISOString(),
    };
    // Today is still pending (opportunity to save streak!)
    logs[today] = {
      date: today,
      status: 'pending',
      completedHabitIds: ['habit_water', 'habit_greens'],
      waterIntakeMl: 1200,
      waterTargetMl: 2500,
      notes: '',
    };
    return { logs, bestStreak: 5 };
  }

  if (scenario === 'broken_2_fails') {
    // Past days completed
    for (let i = 6; i >= 3; i--) {
      const date = getDaysAgoDateString(i);
      logs[date] = {
        date,
        status: 'completed',
        completedHabitIds: ['habit_plan', 'habit_greens', 'habit_water', 'habit_meals_done'],
        waterIntakeMl: 2500,
        waterTargetMl: 2500,
        notes: 'Tudo certo.',
      };
    }
    // Day before yesterday failed
    const dayBeforeYesterday = getDaysAgoDateString(2);
    logs[dayBeforeYesterday] = {
      date: dayBeforeYesterday,
      status: 'failed',
      completedHabitIds: [],
      waterIntakeMl: 600,
      waterTargetMl: 2500,
      notes: 'Dia muito corrido, não segui o plano.',
      finalizedAt: new Date().toISOString(),
    };
    // Yesterday also failed (2 consecutive failures!)
    const yesterday = getDaysAgoDateString(1);
    logs[yesterday] = {
      date: yesterday,
      status: 'failed',
      completedHabitIds: ['habit_water'],
      waterIntakeMl: 800,
      waterTargetMl: 2500,
      notes: 'Segundo dia com dificuldades.',
      finalizedAt: new Date().toISOString(),
    };
    // Today is pending
    logs[today] = {
      date: today,
      status: 'pending',
      completedHabitIds: [],
      waterIntakeMl: 500,
      waterTargetMl: 2500,
      notes: '',
    };
    return { logs, bestStreak: 8 }; // Record of 8 remains preserved!
  }

  return { logs, bestStreak: 0 };
}
