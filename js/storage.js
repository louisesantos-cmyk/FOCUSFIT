// FOCUSFIT - Armazenamento Local, Backup e Simulações

const STORAGE_KEYS = {
  PROFILE: 'focusfit_vanilla_profile_v1',
  HABITS: 'focusfit_vanilla_habits_v1',
  LOGS: 'focusfit_vanilla_logs_v1',
  MEALS: 'focusfit_vanilla_meals_v1',
  ACHIEVEMENTS: 'focusfit_vanilla_achievements_v1',
  NOTIFICATIONS: 'focusfit_vanilla_notifications_v1',
  BEST_STREAK: 'focusfit_vanilla_best_streak_v1',
  USER_XP: 'focusfit_vanilla_user_xp_v1',
};

const DEFAULT_PROFILE = {
  name: 'Camila',
  nickname: 'Foco & Disciplina',
  avatar: '🌸',
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
  },
};

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_PROFILE };
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {}
}

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) return [...DEFAULT_HABITS];
    return JSON.parse(raw);
  } catch (e) {
    return [...DEFAULT_HABITS];
  }
}

function saveHabits(habits) {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {}
}

function loadLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      const today = getTodayDateString();
      const initialLogs = {
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
  } catch (e) {
    return {};
  }
}

function saveLogs(logs) {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {}
}

function loadMeals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (!raw) return [...DEFAULT_MEAL_PLANS];
    return JSON.parse(raw);
  } catch (e) {
    return [...DEFAULT_MEAL_PLANS];
  }
}

function saveMeals(meals) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  } catch (e) {}
}

function loadAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!raw) return [...DEFAULT_ACHIEVEMENTS];
    return JSON.parse(raw);
  } catch (e) {
    return [...DEFAULT_ACHIEVEMENTS];
  }
}

function saveAchievements(achievements) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {}
}

function loadNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      return [
        {
          id: 'notif_welcome',
          title: 'Bem-vinda ao FOCUSFIT! 🌸',
          message: 'Seu personal trainer alimentar está pronto para te apoiar em cada escolha diária com carinho e consistência.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'motivation',
        },
        {
          id: 'notif_streak_info',
          title: 'Sistema de Ofensiva Ativo 🔥',
          message: 'Cumpra seus hábitos diários e finalize o dia para somar pontos! 1 falha ativa aviso; 2 falhas quebram a ofensiva mantendo seu histórico salvo.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'reminder',
        },
      ];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveNotifications(notifications) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {}
}

function loadBestStreak() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BEST_STREAK);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch (e) {
    return 0;
  }
}

function saveBestStreak(streak) {
  try {
    localStorage.setItem(STORAGE_KEYS.BEST_STREAK, String(streak));
  } catch (e) {}
}

function loadUserXP() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_XP);
    return raw ? parseInt(raw, 10) || 280 : 280;
  } catch (e) {
    return 280;
  }
}

function saveUserXP(xp) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_XP, String(xp));
  } catch (e) {}
}

function exportAppData() {
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
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focusfit-backup-${getTodayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importAppData(jsonString) {
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
    return false;
  }
}

function createScenarioLogs(scenario) {
  const logs = {};
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
        hungerControlRating: 5,
      };
    }
    logs[today] = {
      date: today,
      status: 'completed',
      completedHabitIds: ['habit_plan', 'habit_greens', 'habit_water', 'habit_meals_done', 'habit_impulse', 'habit_logged'],
      waterIntakeMl: 2800,
      waterTargetMl: 2500,
      notes: '7º dia consecutivo alcançado! Me sinto incrível e no controle!',
      energyRating: 5,
      hungerControlRating: 5,
    };
    return { logs, bestStreak: 7 };
  }

  if (scenario === 'at_risk_1_fail') {
    for (let i = 6; i >= 2; i--) {
      const date = getDaysAgoDateString(i);
      logs[date] = {
        date,
        status: 'completed',
        completedHabitIds: ['habit_plan', 'habit_water', 'habit_meals_done'],
        waterIntakeMl: 2500,
        waterTargetMl: 2500,
      };
    }
    const yesterday = getDaysAgoDateString(1);
    logs[yesterday] = {
      date: yesterday,
      status: 'failed',
      completedHabitIds: ['habit_water'],
      waterIntakeMl: 750,
      waterTargetMl: 2500,
      notes: 'Tive imprevistos fora de casa.',
    };
    logs[today] = {
      date: today,
      status: 'pending',
      completedHabitIds: ['habit_water'],
      waterIntakeMl: 1000,
      waterTargetMl: 2500,
    };
    return { logs, bestStreak: 5 };
  }

  if (scenario === 'broken_2_fails') {
    for (let i = 6; i >= 3; i--) {
      const date = getDaysAgoDateString(i);
      logs[date] = {
        date,
        status: 'completed',
        completedHabitIds: ['habit_plan', 'habit_greens', 'habit_water'],
        waterIntakeMl: 2500,
        waterTargetMl: 2500,
      };
    }
    const dayBeforeYesterday = getDaysAgoDateString(2);
    logs[dayBeforeYesterday] = {
      date: dayBeforeYesterday,
      status: 'failed',
      completedHabitIds: [],
      waterIntakeMl: 500,
      waterTargetMl: 2500,
    };
    const yesterday = getDaysAgoDateString(1);
    logs[yesterday] = {
      date: yesterday,
      status: 'failed',
      completedHabitIds: ['habit_water'],
      waterIntakeMl: 700,
      waterTargetMl: 2500,
    };
    logs[today] = {
      date: today,
      status: 'pending',
      completedHabitIds: [],
      waterIntakeMl: 500,
      waterTargetMl: 2500,
    };
    return { logs, bestStreak: 8 };
  }

  return { logs, bestStreak: 0 };
}
