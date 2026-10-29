// FOCUSFIT - Motor de Cálculo de Ofensiva (Streak) e Utilitários de Data

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysAgoDateString(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDatePtBr(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const todayStr = getTodayDateString();
  if (dateStr === todayStr) return 'Hoje';

  const yesterdayStr = getDaysAgoDateString(1);
  if (dateStr === yesterdayStr) return 'Ontem';

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${day} de ${months[month - 1]}`;
}

function formatFullDatePtBr(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${weekdays[date.getDay()]}, ${day} de ${months[month - 1]} de ${year}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function calculateStreak(logs, savedBestStreak = 0) {
  const todayStr = getTodayDateString();
  const yesterdayStr = getDaysAgoDateString(1);
  const dayBeforeYesterdayStr = getDaysAgoDateString(2);

  const todayLog = logs[todayStr];
  const yesterdayLog = logs[yesterdayStr];
  const dayBeforeYesterdayLog = logs[dayBeforeYesterdayStr];

  const todayCompleted = todayLog && todayLog.status === 'completed';
  const todayFailed = todayLog && todayLog.status === 'failed';
  const yesterdayFailed = yesterdayLog && yesterdayLog.status === 'failed';
  const dayBeforeYesterdayFailed = dayBeforeYesterdayLog && dayBeforeYesterdayLog.status === 'failed';

  // Caso 1: Hoje foi concluído
  if (todayCompleted) {
    if (yesterdayFailed && dayBeforeYesterdayFailed) {
      const computedMax = computeAllTimeMaxStreak(logs);
      const best = Math.max(savedBestStreak, 1, computedMax);
      return {
        currentStreak: 1,
        bestStreak: best,
        status: 'active',
        lastCompletedDate: todayStr,
      };
    }

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
        if (consecutiveFails >= 2) break;
        cursor++;
      } else {
        break;
      }
    }

    const computedMax = computeAllTimeMaxStreak(logs);
    const best = Math.max(savedBestStreak, currentStreak, computedMax);
    return {
      currentStreak,
      bestStreak: best,
      status: 'active',
      lastCompletedDate: todayStr,
    };
  }

  // Caso 2: Duas falhas consecutivas recentes (ofensiva quebrada)
  const twoFailures =
    (todayFailed && yesterdayFailed) ||
    (yesterdayFailed && dayBeforeYesterdayFailed);

  if (twoFailures) {
    const computedMax = computeAllTimeMaxStreak(logs);
    const best = Math.max(savedBestStreak, computedMax);
    return {
      currentStreak: 0,
      bestStreak: best,
      status: 'broken',
      riskMessage: 'Você perdeu sua ofensiva, mas não perdeu seu progresso. Seu histórico continua aqui. Recomece hoje e mostre que consegue ser consistente!',
    };
  }

  // Caso 3: 1 Falha recente (Ofensiva em risco)
  const isAtRisk =
    (yesterdayFailed && (!todayLog || todayLog.status === 'pending')) ||
    (todayFailed && !yesterdayFailed);

  let currentStreak = 0;
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
      if (consecutiveFails >= 2) break;
      cursor++;
    } else {
      break;
    }
  }

  const computedMax = computeAllTimeMaxStreak(logs);
  const best = Math.max(savedBestStreak, currentStreak, computedMax);

  let status = 'active';
  let riskMessage = undefined;

  if (isAtRisk) {
    status = 'at_risk';
    riskMessage = '⚠️ Sua ofensiva está em risco! Você já se afastou da sua rotina ontem. Hoje é uma nova oportunidade de retomar o controle. Faça o seu melhor!';
  } else if (currentStreak === 0 && (yesterdayFailed || todayFailed)) {
    status = 'broken';
    riskMessage = 'Você perdeu sua ofensiva, mas não perdeu seu progresso. Seu histórico continua aqui. Recomece hoje e mostre que consegue ser consistente!';
  }

  return {
    currentStreak,
    bestStreak: best,
    status,
    riskMessage,
  };
}

function computeAllTimeMaxStreak(logs) {
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
      if (running > maxStreak) maxStreak = running;
    } else if (log.status === 'failed') {
      consecutiveFails++;
      if (consecutiveFails >= 2) running = 0;
    }
  }
  return maxStreak;
}

function isMilestoneStreak(streak) {
  return STREAK_MILESTONES.includes(streak);
}

function getMilestoneInfo(streak) {
  switch (streak) {
    case 3:
      return {
        title: '🔥 3 DIAS DE OFENSIVA!',
        subtitle: 'Você venceu os primeiros dias e construiu o impulso inicial!',
        icon: 'zap',
      };
    case 7:
      return {
        title: '🔥 7 DIAS DE OFENSIVA!',
        subtitle: 'Uma semana inteira de foco! Você está construindo uma versão melhor de si mesma. Não pare agora!',
        icon: 'award',
      };
    case 14:
      return {
        title: '🔥 14 DIAS DE OFENSIVA!',
        subtitle: 'Duas semanas firmes! A consistência virou sua maior aliada.',
        icon: 'shield-check',
      };
    case 30:
      return {
        title: '🔥 30 DIAS DE OFENSIVA!',
        subtitle: 'Um mês inteiro sem desistir! Sua rotina alimentar foi transformada.',
        icon: 'trophy',
      };
    case 60:
      return {
        title: '🔥 60 DIAS DE OFENSIVA!',
        subtitle: 'Dois meses de pura disciplina de aço! Você é um exemplo de autocuidado.',
        icon: 'crown',
      };
    case 100:
      return {
        title: '🔥 100 DIAS DE OFENSIVA!',
        subtitle: 'Centurião do Foco! Um marco histórico de equilíbrio e respeito ao seu corpo.',
        icon: 'sparkles',
      };
    default:
      return null;
  }
}
