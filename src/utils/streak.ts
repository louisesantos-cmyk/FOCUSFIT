import type { DailyLog, StreakState } from '../types';
import { getDaysAgoDateString, getTodayDateString } from './dateUtils';

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

/**
 * Calculates current streak, best streak, and streak health status.
 * 
 * Rules:
 * - Each completed day increments streak.
 * - Single failure triggers 'at_risk' status with encouraging warning.
 * - Two consecutive failed days break the streak.
 * - When resuming after a break, completing today starts the streak at 1.
 * - Pending days (today or unlogged past days) are not treated as failures unless confirmed failed.
 * - Historical record (bestStreak) is never lost.
 */
export function calculateStreak(
  logs: Record<string, DailyLog>,
  savedBestStreak: number = 0
): StreakState {
  const todayStr = getTodayDateString();
  const yesterdayStr = getDaysAgoDateString(1);
  const dayBeforeYesterdayStr = getDaysAgoDateString(2);

  const todayLog = logs[todayStr];
  const yesterdayLog = logs[yesterdayStr];
  const dayBeforeYesterdayLog = logs[dayBeforeYesterdayStr];

  const todayCompleted = todayLog?.status === 'completed';
  const todayFailed = todayLog?.status === 'failed';
  const yesterdayFailed = yesterdayLog?.status === 'failed';
  const dayBeforeYesterdayFailed = dayBeforeYesterdayLog?.status === 'failed';

  // Case 1: Today is completed
  if (todayCompleted) {
    if (yesterdayFailed && dayBeforeYesterdayFailed) {
      // User broke streak earlier, but today resumed! It starts at 1.
      const computedMaxStreak = computeAllTimeMaxStreak(logs);
      const bestStreak = Math.max(savedBestStreak, 1, computedMaxStreak);
      return {
        currentStreak: 1,
        bestStreak,
        status: 'active',
        lastCompletedDate: todayStr,
        lastFailedDate: yesterdayStr,
      };
    }

    // Today is completed and either yesterday was completed, or yesterday was 1 isolated failure
    let currentStreak = 1;
    let cursor = 1;
    let consecutiveFails = 0;

    while (cursor < 3650) {
      const dateStr = getDaysAgoDateString(cursor);
      const log = logs[dateStr];
      if (!log) break;

      if (log.status === 'completed') {
        currentStreak++;
        consecutiveFails = 0;
        cursor++;
      } else if (log.status === 'failed') {
        consecutiveFails++;
        if (consecutiveFails >= 2) {
          // Streak broke back then
          break;
        }
        cursor++;
      } else {
        // Pending
        break;
      }
    }

    const computedMaxStreak = computeAllTimeMaxStreak(logs);
    const bestStreak = Math.max(savedBestStreak, currentStreak, computedMaxStreak);

    return {
      currentStreak,
      bestStreak,
      status: 'active',
      lastCompletedDate: todayStr,
      lastFailedDate: findLastFailedDate(logs),
    };
  }

  // Case 2: Today is NOT completed (either pending or failed)
  const twoConsecutiveFailures =
    (todayFailed && yesterdayFailed) ||
    (yesterdayFailed && dayBeforeYesterdayFailed);

  if (twoConsecutiveFailures) {
    const computedMaxStreak = computeAllTimeMaxStreak(logs);
    const bestStreak = Math.max(savedBestStreak, computedMaxStreak);
    return {
      currentStreak: 0,
      bestStreak,
      status: 'broken',
      lastCompletedDate: findLastCompletedDate(logs),
      lastFailedDate: todayFailed ? todayStr : yesterdayStr,
      riskMessage:
        'Você perdeu sua ofensiva, mas não perdeu seu progresso. Seu histórico continua aqui. Recomece hoje e mostre que consegue ser consistente!',
    };
  }

  // Case 3: Exactly 1 failure recently -> At risk!
  const isAtRisk =
    (yesterdayFailed && (!todayLog || todayLog.status === 'pending')) ||
    (todayFailed && !yesterdayFailed);

  let currentStreak = 0;
  // If today is not completed, we check consecutive completed days ending yesterday
  let cursor = 1;
  let consecutiveFails = 0;

  while (cursor < 3650) {
    const dateStr = getDaysAgoDateString(cursor);
    const log = logs[dateStr];
    if (!log) break;

    if (log.status === 'completed') {
      currentStreak++;
      consecutiveFails = 0;
      cursor++;
    } else if (log.status === 'failed') {
      consecutiveFails++;
      if (consecutiveFails >= 2) {
        break;
      }
      cursor++;
    } else {
      break;
    }
  }

  const computedMaxStreak = computeAllTimeMaxStreak(logs);
  const bestStreak = Math.max(savedBestStreak, currentStreak, computedMaxStreak);

  let status: 'active' | 'at_risk' | 'broken' = 'active';
  let riskMessage: string | undefined = undefined;

  if (isAtRisk) {
    status = 'at_risk';
    riskMessage =
      '⚠️ Sua ofensiva está em risco! Você já se afastou da sua rotina. Hoje é uma nova oportunidade de retomar o controle. Faça o seu melhor!';
  } else if (currentStreak === 0 && (yesterdayFailed || todayFailed)) {
    status = 'broken';
    riskMessage =
      'Você perdeu sua ofensiva, mas não perdeu seu progresso. Seu histórico continua aqui. Recomece hoje e mostre que consegue ser consistente!';
  }

  return {
    currentStreak,
    bestStreak,
    status,
    lastCompletedDate: findLastCompletedDate(logs),
    lastFailedDate: findLastFailedDate(logs),
    riskMessage,
  };
}

function findLastCompletedDate(logs: Record<string, DailyLog>): string | null {
  const sortedDates = Object.keys(logs)
    .filter((d) => logs[d].status === 'completed')
    .sort()
    .reverse();
  return sortedDates[0] || null;
}

function findLastFailedDate(logs: Record<string, DailyLog>): string | null {
  const sortedDates = Object.keys(logs)
    .filter((d) => logs[d].status === 'failed')
    .sort()
    .reverse();
  return sortedDates[0] || null;
}

export function computeAllTimeMaxStreak(logs: Record<string, DailyLog>): number {
  const sortedDates = Object.keys(logs).sort();
  if (sortedDates.length === 0) return 0;

  let maxStreak = 0;
  let running = 0;
  let consecutiveFails = 0;

  for (const date of sortedDates) {
    const log = logs[date];
    if (log.status === 'completed') {
      running++;
      consecutiveFails = 0;
      if (running > maxStreak) {
        maxStreak = running;
      }
    } else if (log.status === 'failed') {
      consecutiveFails++;
      if (consecutiveFails >= 2) {
        running = 0;
      }
    }
  }

  return maxStreak;
}

export function isMilestoneStreak(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak);
}

export function getMilestoneInfo(streak: number): { title: string; subtitle: string; icon: string } | null {
  switch (streak) {
    case 3:
      return {
        title: '🔥 3 DIAS DE OFENSIVA!',
        subtitle: 'Você venceu os primeiros dias e construiu o impulso inicial!',
        icon: 'Zap',
      };
    case 7:
      return {
        title: '🔥 7 DIAS DE OFENSIVA!',
        subtitle: 'Uma semana inteira de foco! Você está construindo uma versão melhor de si mesmo. Não pare agora!',
        icon: 'Award',
      };
    case 14:
      return {
        title: '🔥 14 DIAS DE OFENSIVA!',
        subtitle: 'Duas semanas firmes! A consistência virou sua maior aliada.',
        icon: 'ShieldCheck',
      };
    case 30:
      return {
        title: '🔥 30 DIAS DE OFENSIVA!',
        subtitle: 'Um mês inteiro sem desistir! Sua rotina alimentar foi transformada.',
        icon: 'Trophy',
      };
    case 60:
      return {
        title: '🔥 60 DIAS DE OFENSIVA!',
        subtitle: 'Dois meses de pura disciplina de aço! Você é um exemplo de autocuidado.',
        icon: 'Crown',
      };
    case 100:
      return {
        title: '🔥 100 DIAS DE OFENSIVA!',
        subtitle: 'Centurião do Foco! Um marco histórico de equilíbrio e respeito ao seu corpo.',
        icon: 'Sparkles',
      };
    default:
      return null;
  }
}
