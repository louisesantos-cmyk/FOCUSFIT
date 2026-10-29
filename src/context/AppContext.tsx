import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Achievement,
  DailyLog,
  DayStatus,
  HabitItem,
  InAppNotification,
  MealItem,
  MotivationalQuote,
  NavTab,
  StreakState,
  UserProfile,
} from '../types';
import {
  loadProfile,
  saveProfile,
  loadHabits,
  saveHabits,
  loadLogs,
  saveLogs,
  loadMeals,
  saveMeals,
  loadAchievements,
  saveAchievements,
  loadNotifications,
  saveNotifications,
  loadBestStreak,
  saveBestStreak,
  loadUserXP,
  saveUserXP,
  createScenarioLogs,
} from '../utils/storage';
import { calculateStreak, getMilestoneInfo, isMilestoneStreak } from '../utils/streak';
import { getTodayDateString } from '../utils/dateUtils';
import { MOTIVATIONAL_QUOTES } from '../data/quotes';
import { sounds } from '../utils/sound';
import {
  createInAppNotification,
  sendBrowserNotification,
} from '../utils/notifications';
import confetti from 'canvas-confetti';

interface AppContextValue {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;

  habits: HabitItem[];
  addHabit: (habit: Omit<HabitItem, 'id'>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitToday: (habitId: string) => void;

  logs: Record<string, DailyLog>;
  todayLog: DailyLog;
  finalizeDay: (status: DayStatus, notes?: string, energy?: number, hunger?: number) => void;
  updateWaterIntake: (deltaMl: number) => void;
  updateLogForDate: (date: string, partial: Partial<DailyLog>) => void;

  streak: StreakState;

  meals: MealItem[];
  addMeal: (meal: Omit<MealItem, 'id'>) => void;
  editMeal: (id: string, meal: Partial<MealItem>) => void;
  deleteMeal: (id: string) => void;
  toggleMealFollowed: (id: string) => void;

  achievements: Achievement[];
  userXp: number;
  userLevel: number;
  nextLevelXp: number;
  currentLevelBaseXp: number;

  notifications: InAppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  sendManualTestNotification: () => void;

  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  quote: MotivationalQuote;
  drawNewQuote: (category?: string) => void;

  milestoneCelebration: { streak: number; title: string; subtitle: string; icon: string } | null;
  dismissMilestoneCelebration: () => void;

  selectedCalendarDate: string | null;
  setSelectedCalendarDate: (date: string | null) => void;

  applyScenario: (scenario: '7_days_streak' | 'at_risk_1_fail' | 'broken_2_fails' | 'reset') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(loadProfile);
  const [habits, setHabitsState] = useState<HabitItem[]>(loadHabits);
  const [logs, setLogsState] = useState<Record<string, DailyLog>>(loadLogs);
  const [meals, setMealsState] = useState<MealItem[]>(loadMeals);
  const [achievements, setAchievementsState] = useState<Achievement[]>(loadAchievements);
  const [notifications, setNotificationsState] = useState<InAppNotification[]>(loadNotifications);
  const [bestStreak, setBestStreakState] = useState<number>(loadBestStreak);
  const [userXp, setUserXpState] = useState<number>(loadUserXP);

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [milestoneCelebration, setMilestoneCelebration] = useState<{
    streak: number;
    title: string;
    subtitle: string;
    icon: string;
  } | null>(null);

  // Today string
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Today log getter
  const todayLog: DailyLog = useMemo(() => {
    return (
      logs[todayStr] || {
        date: todayStr,
        status: 'pending',
        completedHabitIds: [],
        waterIntakeMl: 0,
        waterTargetMl: profile.dailyWaterTargetMl,
        notes: '',
      }
    );
  }, [logs, todayStr, profile.dailyWaterTargetMl]);

  // Streak State computed
  const streak = useMemo(() => {
    return calculateStreak(logs, bestStreak);
  }, [logs, bestStreak]);

  // Keep bestStreak in sync
  useEffect(() => {
    if (streak.bestStreak > bestStreak) {
      setBestStreakState(streak.bestStreak);
      saveBestStreak(streak.bestStreak);
    }
  }, [streak.bestStreak, bestStreak]);

  // Sync theme to document body / html class
  useEffect(() => {
    const root = document.documentElement;
    if (profile.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [profile.theme]);

  // XP & Level calculations: Level 1 = 0-500, Level 2 = 501-1200, Level 3 = 1201-2200, etc.
  const { userLevel, nextLevelXp, currentLevelBaseXp } = useMemo(() => {
    const thresholds = [0, 500, 1200, 2200, 3600, 5500, 8000, 12000, 18000, 25000];
    let level = 1;
    for (let i = 0; i < thresholds.length; i++) {
      if (userXp >= thresholds[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    const currentBase = thresholds[level - 1] || 0;
    const nextBase = thresholds[level] || currentBase + 5000;
    return {
      userLevel: level,
      nextLevelXp: nextBase,
      currentLevelBaseXp: currentBase,
    };
  }, [userXp]);

  // Quotes selection based on context
  const getInitialQuote = useCallback((): MotivationalQuote => {
    if (streak.status === 'at_risk') {
      const riskQuotes = MOTIVATIONAL_QUOTES.filter((q) => q.category === 'streak_risk');
      return riskQuotes[Math.floor(Math.random() * riskQuotes.length)] || MOTIVATIONAL_QUOTES[0];
    }
    const hour = new Date().getHours();
    let preferredCategory: MotivationalQuote['category'] = 'start_day';
    if (hour >= 11 && hour < 15) preferredCategory = 'lunch';
    else if (hour >= 18) preferredCategory = 'dinner';
    else preferredCategory = 'start_day';

    const matches = MOTIVATIONAL_QUOTES.filter((q) => q.category === preferredCategory);
    return matches[Math.floor(Math.random() * matches.length)] || MOTIVATIONAL_QUOTES[0];
  }, [streak.status]);

  const [quote, setQuote] = useState<MotivationalQuote>(getInitialQuote);

  const drawNewQuote = useCallback((category?: string) => {
    let pool = MOTIVATIONAL_QUOTES;
    if (category) {
      pool = MOTIVATIONAL_QUOTES.filter((q) => q.category === category);
    }
    const random = pool[Math.floor(Math.random() * pool.length)] || MOTIVATIONAL_QUOTES[0];
    setQuote(random);
  }, []);

  // Update profile
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      saveProfile(next);
      return next;
    });
  }, []);

  // Habits management
  const addHabit = useCallback((newHabit: Omit<HabitItem, 'id'>) => {
    const habit: HabitItem = {
      ...newHabit,
      id: 'habit_' + Date.now(),
      isCustom: true,
    };
    setHabitsState((prev) => {
      const next = [...prev, habit];
      saveHabits(next);
      return next;
    });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabitsState((prev) => {
      const next = prev.filter((h) => h.id !== id);
      saveHabits(next);
      return next;
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setUserXpState((prev) => {
      const next = prev + amount;
      saveUserXP(next);
      return next;
    });
  }, []);

  // Toggle habit for today
  const toggleHabitToday = useCallback((habitId: string) => {
    setLogsState((prev) => {
      const current = prev[todayStr] || {
        date: todayStr,
        status: 'pending',
        completedHabitIds: [],
        waterIntakeMl: 0,
        waterTargetMl: profile.dailyWaterTargetMl,
        notes: '',
      };

      const isMarked = current.completedHabitIds.includes(habitId);
      const updatedIds = isMarked
        ? current.completedHabitIds.filter((id) => id !== habitId)
        : [...current.completedHabitIds, habitId];

      if (!isMarked) {
        if (profile.soundEnabled) sounds.playHabitClick();
        addXp(30); // 30 XP per habit checked
      }

      const updatedLog: DailyLog = {
        ...current,
        completedHabitIds: updatedIds,
      };

      const nextLogs = {
        ...prev,
        [todayStr]: updatedLog,
      };
      saveLogs(nextLogs);
      return nextLogs;
    });
  }, [todayStr, profile.dailyWaterTargetMl, profile.soundEnabled, addXp]);

  // Water intake
  const updateWaterIntake = useCallback((deltaMl: number) => {
    setLogsState((prev) => {
      const current = prev[todayStr] || {
        date: todayStr,
        status: 'pending',
        completedHabitIds: [],
        waterIntakeMl: 0,
        waterTargetMl: profile.dailyWaterTargetMl,
        notes: '',
      };

      const newWater = Math.max(0, current.waterIntakeMl + deltaMl);
      const prevReached = current.waterIntakeMl >= current.waterTargetMl;
      const nowReached = newWater >= current.waterTargetMl;

      if (!prevReached && nowReached) {
        if (profile.soundEnabled) sounds.playHabitClick();
        addXp(100);
      }

      const updatedLog: DailyLog = {
        ...current,
        waterIntakeMl: newWater,
      };

      const nextLogs = {
        ...prev,
        [todayStr]: updatedLog,
      };
      saveLogs(nextLogs);
      return nextLogs;
    });
  }, [todayStr, profile.dailyWaterTargetMl, profile.soundEnabled, addXp]);

  // Check achievements after state updates
  const checkAchievements = useCallback((currentStreakCount: number, currentLogs: Record<string, DailyLog>) => {
    setAchievementsState((prev) => {
      let changed = false;
      const updated = prev.map((ach) => {
        if (ach.unlocked) return ach;

        let shouldUnlock = false;
        let progress = ach.progressCurrent;

        if (ach.requiredStreak) {
          progress = Math.min(ach.progressMax, currentStreakCount);
          if (currentStreakCount >= ach.requiredStreak) {
            shouldUnlock = true;
          }
        } else if (ach.id === 'ach_resilient') {
          // Check if user had a failure followed by a completion
          const yesterdayStr = todayStr;
          const log = currentLogs[yesterdayStr];
          if (log && log.status === 'completed' && currentStreakCount >= 1) {
            shouldUnlock = true;
            progress = 1;
          }
        } else if (ach.id === 'ach_water_master') {
          const today = currentLogs[todayStr];
          if (today && today.waterIntakeMl >= today.waterTargetMl) {
            shouldUnlock = true;
            progress = 1;
          }
        } else if (ach.id === 'ach_all_habits') {
          const today = currentLogs[todayStr];
          if (today && today.completedHabitIds.length >= habits.length && habits.length > 0) {
            shouldUnlock = true;
            progress = 1;
          }
        }

        if (shouldUnlock) {
          changed = true;
          addXp(ach.xpReward);
          // Play celebration sound & notification
          if (profile.soundEnabled) sounds.playStreakMilestone();
          // Add notification
          const notif = createInAppNotification(
            '🏆 Conquista Desbloqueada!',
            `Você conquistou "${ach.title}" (+${ach.xpReward} XP)!`,
            'achievement'
          );
          setNotificationsState((prevNotifs) => {
            const nextN = [notif, ...prevNotifs];
            saveNotifications(nextN);
            return nextN;
          });

          return {
            ...ach,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            progressCurrent: ach.progressMax,
          };
        }

        if (progress !== ach.progressCurrent) {
          changed = true;
          return { ...ach, progressCurrent: progress };
        }

        return ach;
      });

      if (changed) {
        saveAchievements(updated);
        return updated;
      }
      return prev;
    });
  }, [todayStr, habits.length, profile.soundEnabled, addXp]);

  // Finalize Day
  const finalizeDay = useCallback((
    status: DayStatus,
    notes?: string,
    energy?: number,
    hunger?: number
  ) => {
    setLogsState((prev) => {
      const current = prev[todayStr] || {
        date: todayStr,
        status: 'pending',
        completedHabitIds: [],
        waterIntakeMl: 0,
        waterTargetMl: profile.dailyWaterTargetMl,
        notes: '',
      };

      const updatedLog: DailyLog = {
        ...current,
        status,
        notes: notes !== undefined ? notes : current.notes,
        energyRating: energy || current.energyRating,
        hungerControlRating: hunger || current.hungerControlRating,
        finalizedAt: new Date().toISOString(),
      };

      const nextLogs = {
        ...prev,
        [todayStr]: updatedLog,
      };
      saveLogs(nextLogs);

      // Re-calculate streak
      const newStreak = calculateStreak(nextLogs, bestStreak);
      if (newStreak.bestStreak > bestStreak) {
        setBestStreakState(newStreak.bestStreak);
        saveBestStreak(newStreak.bestStreak);
      }

      if (status === 'completed') {
        addXp(200); // 200 XP for completing day
        if (profile.soundEnabled) sounds.playDayCompleted();

        // Confetti effect!
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ec4899', '#f43f5e', '#f472b6', '#fb7185', '#ffffff'],
          });
        } catch {
          // ignore
        }

        // Check if hit a special milestone
        if (isMilestoneStreak(newStreak.currentStreak)) {
          const info = getMilestoneInfo(newStreak.currentStreak);
          if (info) {
            setMilestoneCelebration({
              streak: newStreak.currentStreak,
              title: info.title,
              subtitle: info.subtitle,
              icon: info.icon,
            });
            if (profile.soundEnabled) sounds.playStreakMilestone();
          }
        }

        // Send positive notification
        const notif = createInAppNotification(
          '🔥 Dia Concluído com Sucesso!',
          `Parabéns! Sua ofensiva avançou para ${newStreak.currentStreak} ${newStreak.currentStreak === 1 ? 'dia' : 'dias'} consecutivos!`,
          'motivation'
        );
        setNotificationsState((prevN) => {
          const nextN = [notif, ...prevN];
          saveNotifications(nextN);
          return nextN;
        });

        if (profile.browserNotificationsEnabled) {
          sendBrowserNotification(notif.title, notif.message);
        }
      } else if (status === 'failed') {
        if (profile.soundEnabled) sounds.playWarningSound();

        const notif = createInAppNotification(
          newStreak.status === 'broken' ? 'Ofensiva reiniciada' : 'Atenção à sua rotina',
          newStreak.riskMessage || 'Não desista! Amanhã é mais uma chance de recomeçar com foco.',
          'streak_risk'
        );
        setNotificationsState((prevN) => {
          const nextN = [notif, ...prevN];
          saveNotifications(nextN);
          return nextN;
        });
      }

      // Check achievements
      checkAchievements(newStreak.currentStreak, nextLogs);

      return nextLogs;
    });
  }, [
    todayStr,
    profile.dailyWaterTargetMl,
    profile.soundEnabled,
    profile.browserNotificationsEnabled,
    bestStreak,
    addXp,
    checkAchievements,
  ]);

  // Update specific date log
  const updateLogForDate = useCallback((date: string, partial: Partial<DailyLog>) => {
    setLogsState((prev) => {
      const existing = prev[date] || {
        date,
        status: 'pending',
        completedHabitIds: [],
        waterIntakeMl: 0,
        waterTargetMl: profile.dailyWaterTargetMl,
      };

      const updated: DailyLog = { ...existing, ...partial };
      const nextLogs = { ...prev, [date]: updated };
      saveLogs(nextLogs);

      const newStreak = calculateStreak(nextLogs, bestStreak);
      if (newStreak.bestStreak > bestStreak) {
        setBestStreakState(newStreak.bestStreak);
        saveBestStreak(newStreak.bestStreak);
      }
      return nextLogs;
    });
  }, [profile.dailyWaterTargetMl, bestStreak]);

  // Meals operations
  const addMeal = useCallback((newMeal: Omit<MealItem, 'id'>) => {
    const meal: MealItem = {
      ...newMeal,
      id: 'meal_' + Date.now(),
    };
    setMealsState((prev) => {
      const next = [...prev, meal];
      saveMeals(next);
      return next;
    });
    addXp(40);
  }, [addXp]);

  const editMeal = useCallback((id: string, updates: Partial<MealItem>) => {
    setMealsState((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
      saveMeals(next);
      return next;
    });
  }, []);

  const deleteMeal = useCallback((id: string) => {
    setMealsState((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMeals(next);
      return next;
    });
  }, []);

  const toggleMealFollowed = useCallback((id: string) => {
    setMealsState((prev) => {
      const next = prev.map((m) => {
        if (m.id === id) {
          const nextFollowed = !m.followed;
          if (nextFollowed) {
            if (profile.soundEnabled) sounds.playHabitClick();
            addXp(30);
          }
          return { ...m, followed: nextFollowed };
        }
        return m;
      });
      saveMeals(next);
      return next;
    });
  }, [profile.soundEnabled, addXp]);

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotificationsState((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(next);
      return next;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotificationsState((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(next);
      return next;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotificationsState([]);
    saveNotifications([]);
  }, []);

  const sendManualTestNotification = useCallback(() => {
    const sample = createInAppNotification(
      '🔔 Teste de Notificação FOCUSFIT',
      'Seu sistema de lembretes está funcionando perfeitamente! Lembre-se de beber água e conferir seus objetivos.',
      'reminder'
    );
    setNotificationsState((prev) => {
      const next = [sample, ...prev];
      saveNotifications(next);
      return next;
    });

    if (profile.soundEnabled) sounds.playNotificationSound();

    if (profile.browserNotificationsEnabled) {
      sendBrowserNotification(sample.title, sample.message);
    }
  }, [profile.soundEnabled, profile.browserNotificationsEnabled]);

  // Apply Demonstration Scenario
  const applyScenario = useCallback((scenario: '7_days_streak' | 'at_risk_1_fail' | 'broken_2_fails' | 'reset') => {
    const { logs: newLogs, bestStreak: newBest } = createScenarioLogs(scenario);
    setLogsState(newLogs);
    saveLogs(newLogs);
    setBestStreakState(newBest);
    saveBestStreak(newBest);

    if (scenario === '7_days_streak') {
      const info = getMilestoneInfo(7);
      if (info) {
        setMilestoneCelebration({
          streak: 7,
          title: info.title,
          subtitle: info.subtitle,
          icon: info.icon,
        });
        if (profile.soundEnabled) sounds.playStreakMilestone();
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#ec4899', '#f43f5e', '#f472b6', '#ffffff'],
          });
        } catch {
          // ignore
        }
      }
    }
  }, [profile.soundEnabled]);

  const dismissMilestoneCelebration = useCallback(() => {
    setMilestoneCelebration(null);
  }, []);

  const value: AppContextValue = {
    profile,
    updateProfile,
    habits,
    addHabit,
    deleteHabit,
    toggleHabitToday,
    logs,
    todayLog,
    finalizeDay,
    updateWaterIntake,
    updateLogForDate,
    streak,
    meals,
    addMeal,
    editMeal,
    deleteMeal,
    toggleMealFollowed,
    achievements,
    userXp,
    userLevel,
    nextLevelXp,
    currentLevelBaseXp,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    sendManualTestNotification,
    activeTab,
    setActiveTab,
    quote,
    drawNewQuote,
    milestoneCelebration,
    dismissMilestoneCelebration,
    selectedCalendarDate,
    setSelectedCalendarDate,
    applyScenario,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
