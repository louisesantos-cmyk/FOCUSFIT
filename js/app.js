// FOCUSFIT - Controlador Principal (Vanilla JavaScript)

// Estado Global da Aplicação
let state = {
  profile: null,
  habits: [],
  logs: {},
  meals: [],
  achievements: [],
  notifications: [],
  streak: null,
  userXp: 0,
  activeTab: 'dashboard',
  currentQuote: null,
  calendarDate: new Date(),
  selectedDetailDate: null,
  energyRating: 4,
  hungerRating: 4,
  statsRange: 7,
  charts: {
    evolution: null,
    habitsBar: null,
    waterBar: null,
  },
};

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  initState();
  setupEventListeners();
  renderAll();

  // Inicializa os ícones do Lucide
  if (window.lucide) {
    lucide.createIcons();
  }
});

function initState() {
  state.profile = loadProfile();
  state.habits = loadHabits();
  state.logs = loadLogs();
  state.meals = loadMeals();
  state.achievements = loadAchievements();
  state.notifications = loadNotifications();
  state.userXp = loadUserXP();

  // Garante que o dia de hoje existe nos logs
  const today = getTodayDateString();
  if (!state.logs[today]) {
    state.logs[today] = {
      date: today,
      status: 'pending',
      completedHabitIds: [],
      waterIntakeMl: 0,
      waterTargetMl: state.profile.dailyWaterTargetMl,
      notes: '',
    };
    saveLogs(state.logs);
  }

  updateStreakState();
  pickInitialQuote();
}

function updateStreakState() {
  const best = loadBestStreak();
  state.streak = calculateStreak(state.logs, best);
  if (state.streak.bestStreak > best) {
    saveBestStreak(state.streak.bestStreak);
  }
}

function pickInitialQuote() {
  if (state.streak && state.streak.status === 'at_risk') {
    const risk = MOTIVATIONAL_QUOTES.filter(q => q.category === 'streak_risk');
    state.currentQuote = risk[Math.floor(Math.random() * risk.length)] || MOTIVATIONAL_QUOTES[0];
    return;
  }

  const hour = new Date().getHours();
  let cat = 'start_day';
  if (hour >= 11 && hour < 15) cat = 'lunch';
  else if (hour >= 18) cat = 'dinner';

  const matches = MOTIVATIONAL_QUOTES.filter(q => q.category === cat);
  state.currentQuote = matches[Math.floor(Math.random() * matches.length)] || MOTIVATIONAL_QUOTES[0];
}

function drawNewMotivationalQuote() {
  const rand = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  state.currentQuote = rand;
  const elText = document.getElementById('quote-text');
  const elAuthor = document.getElementById('quote-author');
  if (elText) elText.textContent = `"${rand.text}"`;
  if (elAuthor) elAuthor.textContent = `— ${rand.author}`;
}

// Alternância de Abas (Navegação)
function switchTab(tabId) {
  state.activeTab = tabId;

  // Esconde todas as seções e exibe a selecionada
  const views = ['dashboard', 'mission', 'planning', 'calendar', 'achievements', 'stats', 'settings'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      el.style.display = (v === tabId) ? 'block' : 'none';
    }
  });

  // Atualiza classes ativas na Sidebar
  document.querySelectorAll('.app-sidebar .nav-link').forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Atualiza classes ativas na Bottom Nav
  document.querySelectorAll('.mobile-nav .mobile-nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Re-renderiza a view ativa
  if (tabId === 'dashboard') renderDashboard();
  if (tabId === 'mission') renderMission();
  if (tabId === 'planning') renderPlanning();
  if (tabId === 'calendar') renderCalendar();
  if (tabId === 'achievements') renderAchievements();
  if (tabId === 'stats') renderStats();
  if (tabId === 'settings') renderSettings();

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Renderização Geral
function renderAll() {
  renderHeader();
  renderSidebar();
  renderDashboard();
  renderMission();
  renderPlanning();
  renderCalendar();
  renderAchievements();
  renderStats();
  renderSettings();
  renderNotificationsList();

  if (window.lucide) {
    lucide.createIcons();
  }
}

// 1. Header
function renderHeader() {
  const streakCount = document.getElementById('header-streak-count');
  if (streakCount) streakCount.textContent = state.streak.currentStreak;

  const { level, nextXp } = calculateLevel(state.userXp);
  const lvlBadge = document.getElementById('header-level-badge');
  const xpBadge = document.getElementById('header-xp-badge');
  if (lvlBadge) lvlBadge.textContent = `Nível ${level}`;
  if (xpBadge) xpBadge.textContent = `${state.userXp} / ${nextXp} XP`;

  // Som icon
  const btnSound = document.getElementById('btn-toggle-sound');
  if (btnSound) {
    btnSound.innerHTML = state.profile.soundEnabled
      ? '<i data-lucide="volume-2" style="width: 18px; height: 18px;"></i>'
      : '<i data-lucide="volume-x" style="width: 18px; height: 18px;"></i>';
  }

  // Notificações badge
  const unreadCount = state.notifications.filter(n => !n.read).length;
  const notifBadge = document.getElementById('notif-badge');
  if (notifBadge) {
    if (unreadCount > 0) {
      notifBadge.style.display = 'block';
      notifBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    } else {
      notifBadge.style.display = 'none';
    }
  }
}

// 2. Sidebar
function renderSidebar() {
  const today = getTodayDateString();
  const todayLog = state.logs[today] || { completedHabitIds: [] };
  const doneCount = todayLog.completedHabitIds.length;
  const totalCount = state.habits.length;

  const badge = document.getElementById('sidebar-mission-badge');
  if (badge) badge.textContent = `${doneCount}/${totalCount}`;

  const av = document.getElementById('sidebar-avatar');
  if (av) av.textContent = state.profile.avatar;

  const name = document.getElementById('sidebar-name');
  if (name) name.textContent = state.profile.name;

  const { level } = calculateLevel(state.userXp);
  const lvl = document.getElementById('sidebar-level');
  if (lvl) lvl.textContent = `Nível ${level}`;

  const streakTxt = document.getElementById('sidebar-streak-text');
  if (streakTxt) streakTxt.textContent = `${state.streak.currentStreak}d 🔥`;
}

// 3. Dashboard
function renderDashboard() {
  const today = getTodayDateString();
  const todayLog = state.logs[today] || { completedHabitIds: [], waterIntakeMl: 0, waterTargetMl: 2500 };

  const elGreeting = document.getElementById('dash-greeting');
  if (elGreeting) elGreeting.textContent = `${getGreeting()}, ${state.profile.name}!`;

  const elDate = document.getElementById('dash-date-text');
  if (elDate) elDate.textContent = `${formatDatePtBr(today)} • Seu Treinador Diário`;

  // Streak
  const elStreakNum = document.getElementById('dash-streak-number');
  if (elStreakNum) elStreakNum.textContent = state.streak.currentStreak;

  const elBest = document.getElementById('dash-best-streak');
  if (elBest) elBest.textContent = `${state.streak.bestStreak} dias`;

  // Consistência Semanal
  let weekCompleted = 0;
  for (let i = 0; i < 7; i++) {
    const d = getDaysAgoDateString(i);
    if (state.logs[d] && state.logs[d].status === 'completed') weekCompleted++;
  }
  const weeklyRate = Math.round((weekCompleted / 7) * 100);
  const elWeekly = document.getElementById('dash-weekly-consistency');
  if (elWeekly) elWeekly.textContent = `${weeklyRate}%`;

  // Banner de Risco
  const riskBanner = document.getElementById('dash-risk-banner');
  if (riskBanner) {
    riskBanner.style.display = (state.streak.status === 'at_risk') ? 'block' : 'none';
  }

  // Frase
  const elQuote = document.getElementById('quote-text');
  const elAuthor = document.getElementById('quote-author');
  if (elQuote && state.currentQuote) elQuote.textContent = `"${state.currentQuote.text}"`;
  if (elAuthor && state.currentQuote) elAuthor.textContent = `— ${state.currentQuote.author}`;

  // Missão rápida
  const doneHabits = todayLog.completedHabitIds.length;
  const totalHabits = state.habits.length;
  const progressPercent = totalHabits > 0 ? Math.round((doneHabits / totalHabits) * 100) : 0;

  const elSumm = document.getElementById('dash-mission-summary');
  if (elSumm) elSumm.textContent = `${doneHabits} de ${totalHabits} hábitos realizados (${progressPercent}%)`;

  const elProg = document.getElementById('dash-mission-progress');
  if (elProg) elProg.style.width = `${progressPercent}%`;

  const quickContainer = document.getElementById('dash-quick-habits');
  if (quickContainer) {
    quickContainer.innerHTML = '';
    state.habits.slice(0, 4).forEach(h => {
      const isDone = todayLog.completedHabitIds.includes(h.id);
      const div = document.createElement('div');
      div.className = `habit-item ${isDone ? 'completed' : ''}`;
      div.onclick = () => toggleHabit(h.id);
      div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="habit-checkbox">
            ${isDone ? '<i data-lucide="check" style="width: 16px; height: 16px;"></i>' : ''}
          </div>
          <div>
            <div class="habit-label">${h.label}</div>
          </div>
        </div>
        <span class="nav-badge">+30 XP</span>
      `;
      quickContainer.appendChild(div);
    });
  }

  // Hidratação
  const waterTarget = todayLog.waterTargetMl || state.profile.dailyWaterTargetMl;
  const waterAmount = todayLog.waterIntakeMl || 0;
  const waterPercent = Math.min(100, Math.round((waterAmount / waterTarget) * 100));

  const elWaterAmount = document.getElementById('dash-water-amount');
  if (elWaterAmount) elWaterAmount.textContent = waterAmount;

  const elWaterTarget = document.getElementById('dash-water-target-label');
  if (elWaterTarget) elWaterTarget.textContent = `Meta: ${waterTarget} ml`;

  const elWaterPercent = document.getElementById('dash-water-percent');
  if (elWaterPercent) elWaterPercent.textContent = `${waterPercent}%`;

  const elWaterProg = document.getElementById('dash-water-progress');
  if (elWaterProg) elWaterProg.style.width = `${waterPercent}%`;
}

// 4. Minha Missão
function renderMission() {
  const today = getTodayDateString();
  const todayLog = state.logs[today] || { completedHabitIds: [], waterIntakeMl: 0, waterTargetMl: 2500 };

  const elDateLabel = document.getElementById('mission-date-label');
  if (elDateLabel) elDateLabel.textContent = formatDatePtBr(today);

  const doneCount = todayLog.completedHabitIds.length;
  const totalCount = state.habits.length;
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const elProgLabel = document.getElementById('mission-progress-label');
  if (elProgLabel) elProgLabel.textContent = `${doneCount} de ${totalCount} hábitos concluídos`;

  const elProgPercent = document.getElementById('mission-progress-percent');
  if (elProgPercent) elProgPercent.textContent = `${percent}%`;

  const elFullProg = document.getElementById('mission-full-progress');
  if (elFullProg) elFullProg.style.width = `${percent}%`;

  const elCrit = document.getElementById('mission-criteria-note');
  if (elCrit) elCrit.textContent = `Meta mínima para validar o dia: ${state.profile.minHabitsToComplete} hábitos`;

  const elStatusPill = document.getElementById('mission-status-pill');
  if (elStatusPill) {
    if (doneCount >= state.profile.minHabitsToComplete) {
      elStatusPill.textContent = '✓ Critério diário atingido!';
      elStatusPill.style.color = 'var(--pink-400)';
    } else {
      elStatusPill.textContent = `Faltam ${state.profile.minHabitsToComplete - doneCount} hábitos`;
      elStatusPill.style.color = 'var(--amber-400)';
    }
  }

  // Hidratação
  const waterTarget = todayLog.waterTargetMl || state.profile.dailyWaterTargetMl;
  const waterAmount = todayLog.waterIntakeMl || 0;
  const fullWaterText = document.getElementById('full-water-text');
  if (fullWaterText) fullWaterText.textContent = `${waterAmount} ml`;

  const fullWaterMeta = document.getElementById('full-water-meta-label');
  if (fullWaterMeta) fullWaterMeta.textContent = `Meta diária: ${waterTarget} ml`;

  const goalBadge = document.getElementById('water-goal-reached-badge');
  if (goalBadge) {
    goalBadge.style.display = (waterAmount >= waterTarget) ? 'inline-block' : 'none';
  }

  // 10 Copos
  const cupsContainer = document.getElementById('water-cups-container');
  if (cupsContainer) {
    cupsContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
      const cupMl = i * 250;
      const filled = waterAmount >= cupMl;
      const cup = document.createElement('div');
      cup.className = `water-cup-box ${filled ? 'filled' : ''}`;
      cup.title = `Copo ${i}: ${cupMl} ml`;
      cup.onclick = () => {
        const delta = cupMl - waterAmount;
        addWater(delta);
      };
      cup.innerHTML = `
        <i data-lucide="droplets" style="width: 16px; height: 16px; margin-bottom: 4px;"></i>
        <span style="font-size: 10px; font-weight: 800;">${cupMl}ml</span>
      `;
      cupsContainer.appendChild(cup);
    }
  }

  // Lista Completa de Hábitos
  const habitsList = document.getElementById('mission-habits-list');
  if (habitsList) {
    habitsList.innerHTML = '';
    state.habits.forEach(h => {
      const isDone = todayLog.completedHabitIds.includes(h.id);
      const div = document.createElement('div');
      div.className = `habit-item ${isDone ? 'completed' : ''}`;
      div.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 14px; flex: 1;" onclick="toggleHabit('${h.id}')">
          <div class="habit-checkbox" style="margin-top: 2px;">
            ${isDone ? '<i data-lucide="check" style="width: 18px; height: 18px;"></i>' : ''}
          </div>
          <div>
            <div class="habit-label" style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="${h.icon}" style="width: 16px; height: 16px; color: var(--pink-400);"></i>
              <span>${h.label}</span>
            </div>
            <div class="habit-desc">${h.description}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="nav-badge">+30 XP</span>
          ${h.isCustom ? `<button class="icon-btn" onclick="deleteCustomHabit('${h.id}')" title="Excluir hábito" style="width: 32px; height: 32px;"><i data-lucide="trash-2" style="width: 15px; height: 15px; color: var(--rose-400);"></i></button>` : ''}
        </div>
      `;
      habitsList.appendChild(div);
    });
  }
}

// 5. Planejamento
function renderPlanning() {
  const container = document.getElementById('meals-container');
  if (!container) return;

  const followedCount = state.meals.filter(m => m.followed).length;
  const adherence = state.meals.length > 0 ? Math.round((followedCount / state.meals.length) * 100) : 0;

  const summary = document.getElementById('planning-followed-summary');
  if (summary) summary.textContent = `${followedCount} de ${state.meals.length} (${adherence}%)`;

  container.innerHTML = '';
  state.meals.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'card';
    if (meal.followed) {
      card.style.borderColor = 'rgba(236,72,153,0.4)';
      card.style.background = 'linear-gradient(180deg, rgba(80,16,52,0.25), rgba(23,6,18,0.95))';
    }

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="nav-badge" style="display: flex; align-items: center; gap: 4px;">
            <i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${meal.time}
          </span>
          <h3 style="font-size: 16px; font-weight: 800;">${meal.title}</h3>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="icon-btn" onclick="openEditMealModal('${meal.id}')" title="Editar"><i data-lucide="edit-2" style="width: 14px; height: 14px;"></i></button>
          <button class="icon-btn" onclick="deleteMealItem('${meal.id}')" title="Excluir"><i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--rose-400);"></i></button>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">Planejado:</span>
        <p style="font-size: 13px; color: #ffffff; line-height: 1.5;">${meal.plannedDescription}</p>
      </div>

      ${meal.actualDescription ? `
        <div style="background: rgba(236,72,153,0.1); border: 1px solid rgba(236,72,153,0.25); border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--pink-400); display: block; margin-bottom: 4px;">O que comi:</span>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">${meal.actualDescription}</p>
        </div>
      ` : ''}

      ${meal.notes ? `
        <div style="font-size: 11px; color: var(--text-muted); font-style: italic; margin-bottom: 14px;">
          💡 ${meal.notes}
        </div>
      ` : ''}

      <button class="btn ${meal.followed ? 'btn-primary' : 'btn-secondary'}" onclick="toggleMealFollowed('${meal.id}')" style="width: 100%; font-size: 12px; padding: 10px;">
        ${meal.followed ? '<i data-lucide="check-circle-2" style="width: 16px; height: 16px;"></i> Seguido com Sucesso! (+40 XP)' : '<i data-lucide="check" style="width: 16px; height: 16px;"></i> Marcar como Seguido'}
      </button>
    `;
    container.appendChild(card);
  });
}

// 6. Calendário
function renderCalendar() {
  const year = state.calendarDate.getFullYear();
  const month = state.calendarDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const titleEl = document.getElementById('calendar-month-title');
  if (titleEl) titleEl.textContent = `${monthNames[month]} ${year}`;

  const calStreak = document.getElementById('cal-stat-streak');
  if (calStreak) calStreak.textContent = `${state.streak.currentStreak} dias`;

  const calBest = document.getElementById('cal-stat-best');
  if (calBest) calBest.textContent = `${state.streak.bestStreak} dias`;

  // Consistência Mensal
  const loggedDays = Object.values(state.logs).filter(l => l.status === 'completed' || l.status === 'failed');
  const compDays = Object.values(state.logs).filter(l => l.status === 'completed');
  const consisRate = loggedDays.length > 0 ? Math.round((compDays.length / loggedDays.length) * 100) : 0;
  const calConsis = document.getElementById('cal-stat-consistency');
  if (calConsis) calConsis.textContent = `${consisRate}%`;

  const container = document.getElementById('calendar-days-container');
  if (!container) return;
  container.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const todayStr = getTodayDateString();

  // Dias do mês anterior
  for (let i = 0; i < firstDay; i++) {
    const prevNum = daysInPrev - firstDay + i + 1;
    const cell = document.createElement('div');
    cell.className = 'calendar-cell future';
    cell.innerHTML = `<span style="font-size: 12px; font-weight: 700; color: #4b5563;">${prevNum}</span>`;
    container.appendChild(cell);
  }

  // Dias do mês atual
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = (dateStr === todayStr);
    const isFuture = (dateStr > todayStr);
    const log = state.logs[dateStr];

    let status = 'future';
    if (isFuture) status = 'future';
    else if (log) status = log.status;
    else status = 'pending';

    const cell = document.createElement('div');
    cell.className = `calendar-cell ${status} ${isToday ? 'today' : ''}`;
    if (!isFuture) {
      cell.onclick = () => openDayDetailsModal(dateStr);
    }

    cell.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; font-weight: 800; ${isToday ? 'color: var(--pink-400);' : ''}">${d}</span>
        ${!isFuture ? `<div class="calendar-dot ${status}"></div>` : ''}
      </div>
      ${log && status === 'completed' ? `<span class="nav-badge" style="font-size: 9px; padding: 1px 4px;">${log.completedHabitIds.length} hab</span>` : ''}
      ${status === 'pending' && !isFuture ? `<span style="font-size: 10px; color: var(--amber-400);">Pendente</span>` : ''}
      ${status === 'failed' ? `<span style="font-size: 10px; color: var(--rose-400);">Falha</span>` : ''}
    `;
    container.appendChild(cell);
  }
}

function prevMonth() {
  state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
  renderCalendar();
  if (window.lucide) lucide.createIcons();
}

function nextMonth() {
  state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
  renderCalendar();
  if (window.lucide) lucide.createIcons();
}

function goToToday() {
  state.calendarDate = new Date();
  renderCalendar();
  if (window.lucide) lucide.createIcons();
}

// 7. Conquistas
function renderAchievements() {
  const { level, nextXp, currentBase } = calculateLevel(state.userXp);
  const inLevel = state.userXp - currentBase;
  const needed = nextXp - currentBase;
  const percent = Math.min(100, Math.round((inLevel / (needed || 1)) * 100));

  const elLvl = document.getElementById('ach-level-label');
  if (elLvl) elLvl.textContent = `Nível ${level}`;

  const elTitle = document.getElementById('ach-level-title');
  if (elTitle) elTitle.textContent = getLevelTitle(level);

  const elTotalXp = document.getElementById('ach-total-xp');
  if (elTotalXp) elTotalXp.textContent = state.userXp;

  const elProg = document.getElementById('ach-level-progress');
  if (elProg) elProg.style.width = `${percent}%`;

  const elCur = document.getElementById('ach-xp-current');
  if (elCur) elCur.textContent = `${inLevel} XP`;

  const elNext = document.getElementById('ach-xp-next');
  if (elNext) elNext.textContent = `${needed} XP p/ Nível ${level + 1}`;

  const unlockedCount = state.achievements.filter(a => a.unlocked).length;
  const elCount = document.getElementById('ach-unlocked-count');
  if (elCount) elCount.textContent = `${unlockedCount} de ${state.achievements.length}`;

  const container = document.getElementById('achievements-container');
  if (!container) return;
  container.innerHTML = '';

  state.achievements.forEach(ach => {
    const isUnl = ach.unlocked;
    const card = document.createElement('div');
    card.className = 'card';
    if (isUnl) {
      card.style.borderColor = 'rgba(236,72,153,0.4)';
      card.style.background = 'linear-gradient(180deg, rgba(80,16,52,0.3), rgba(23,6,18,0.95))';
    } else {
      card.style.opacity = '0.8';
    }

    card.innerHTML = `
      <div style="display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px;">
        <div style="width: 52px; height: 52px; border-radius: var(--radius-md); background: ${isUnl ? 'rgba(236,72,153,0.2)' : 'rgba(0,0,0,0.4)'}; border: 1px solid ${isUnl ? 'rgba(236,72,153,0.5)' : 'var(--border-color)'}; display: flex; align-items: center; justify-content: center; color: ${isUnl ? 'var(--pink-400)' : 'var(--text-muted)'}; flex-shrink: 0;">
          <i data-lucide="${ach.badgeIcon}" style="width: 26px; height: 26px;"></i>
        </div>
        <div style="flex: 1;">
          <h4 style="font-size: 15px; font-weight: 800; color: ${isUnl ? '#ffffff' : 'var(--text-muted)'};">${ach.title}</h4>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4;">${ach.description}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 10px;">
        <span class="nav-badge">+${ach.xpReward} XP</span>
        <span style="font-size: 11px; font-weight: 800; color: ${isUnl ? 'var(--pink-400)' : 'var(--text-muted)'};">
          ${isUnl ? '✓ Desbloqueado' : `${ach.progressCurrent}/${ach.progressMax}`}
        </span>
      </div>
    `;
    container.appendChild(card);
  });
}

// 8. Estatísticas & Gráficos com Chart.js
function setStatsRange(days) {
  state.statsRange = days;
  [7, 14, 30].forEach(d => {
    const btn = document.getElementById(`btn-range-${d}`);
    if (btn) {
      if (d === days) {
        btn.className = 'btn btn-secondary active';
        btn.style.backgroundColor = 'var(--pink-500)';
        btn.style.color = '#ffffff';
      } else {
        btn.className = 'btn btn-ghost';
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--text-muted)';
      }
    }
  });
  renderStats();
}

function renderStats() {
  const days = state.statsRange;
  const historyData = [];
  let totalHabitsDone = 0;
  let totalDaysDone = 0;

  for (let i = days - 1; i >= 0; i--) {
    const dateStr = getDaysAgoDateString(i);
    const log = state.logs[dateStr];
    const isComp = log && log.status === 'completed';
    const habitsCount = log && log.completedHabitIds ? log.completedHabitIds.length : 0;
    const water = log ? (log.waterIntakeMl || 0) : 0;

    if (isComp) totalDaysDone++;
    totalHabitsDone += habitsCount;

    const parts = dateStr.split('-');
    historyData.push({
      dateLabel: `${parts[2]}/${parts[1]}`,
      habits: habitsCount,
      water: water,
    });
  }

  const consistencyRate = Math.round((totalDaysDone / days) * 100);

  // KPIs
  const elKpiStreak = document.getElementById('kpi-streak');
  if (elKpiStreak) elKpiStreak.textContent = `${state.streak.currentStreak}d`;

  const elKpiBest = document.getElementById('kpi-best');
  if (elKpiBest) elKpiBest.textContent = `Recorde: ${state.streak.bestStreak}d`;

  const elKpiConsis = document.getElementById('kpi-consistency');
  if (elKpiConsis) elKpiConsis.textContent = `${consistencyRate}%`;

  const elKpiDays = document.getElementById('kpi-days-count');
  if (elKpiDays) elKpiDays.textContent = `${totalDaysDone} de ${days} dias`;

  const elKpiHabits = document.getElementById('kpi-habits-done');
  if (elKpiHabits) elKpiHabits.textContent = totalHabitsDone;

  const elKpiTotal = document.getElementById('kpi-total-logged');
  if (elKpiTotal) elKpiTotal.textContent = `${Object.keys(state.logs).length}d`;

  // Inicializa ou atualiza os gráficos do Chart.js
  renderEvolutionChart(historyData);
  renderHabitsBarChart(days);
  renderWaterChart(historyData);
}

function renderEvolutionChart(data) {
  const ctx = document.getElementById('chart-habits-evolution');
  if (!ctx || !window.Chart) return;

  if (state.charts.evolution) {
    state.charts.evolution.destroy();
  }

  state.charts.evolution = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.dateLabel),
      datasets: [{
        label: 'Hábitos Concluídos',
        data: data.map(d => d.habits),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#f43f5e',
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(236, 72, 153, 0.08)' }, ticks: { color: '#9d7890' } },
        y: { beginAtZero: true, max: 6, grid: { color: 'rgba(236, 72, 153, 0.08)' }, ticks: { color: '#9d7890', stepSize: 1 } },
      },
    },
  });
}

function renderHabitsBarChart(days) {
  const ctx = document.getElementById('chart-habits-bar');
  if (!ctx || !window.Chart) return;

  if (state.charts.habitsBar) {
    state.charts.habitsBar.destroy();
  }

  const labels = [];
  const percentages = [];

  state.habits.forEach(h => {
    let completedCount = 0;
    for (let i = days - 1; i >= 0; i--) {
      const d = getDaysAgoDateString(i);
      if (state.logs[d] && state.logs[d].completedHabitIds && state.logs[d].completedHabitIds.includes(h.id)) {
        completedCount++;
      }
    }
    const shortLabel = h.label.length > 18 ? h.label.substring(0, 16) + '...' : h.label;
    labels.push(shortLabel);
    percentages.push(Math.round((completedCount / days) * 100));
  });

  state.charts.habitsBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Aderência (%)',
        data: percentages,
        backgroundColor: '#f472b6',
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, max: 100, grid: { color: 'rgba(236, 72, 153, 0.08)' }, ticks: { color: '#9d7890' } },
        y: { grid: { display: false }, ticks: { color: '#ffffff', font: { size: 10 } } },
      },
    },
  });
}

function renderWaterChart(data) {
  const ctx = document.getElementById('chart-water-bar');
  if (!ctx || !window.Chart) return;

  if (state.charts.waterBar) {
    state.charts.waterBar.destroy();
  }

  state.charts.waterBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.dateLabel),
      datasets: [{
        label: 'Água (ml)',
        data: data.map(d => d.water),
        backgroundColor: '#ec4899',
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9d7890' } },
        y: { beginAtZero: true, grid: { color: 'rgba(236, 72, 153, 0.08)' }, ticks: { color: '#9d7890' } },
      },
    },
  });
}

// 9. Configurações
function renderSettings() {
  const p = state.profile;
  const elName = document.getElementById('setting-name');
  if (elName) elName.value = p.name;

  const elNick = document.getElementById('setting-nickname');
  if (elNick) elNick.value = p.nickname;

  const elMin = document.getElementById('setting-min-habits');
  if (elMin) {
    elMin.value = p.minHabitsToComplete;
    elMin.max = state.habits.length || 6;
  }
  updateMinHabitsDisplay(p.minHabitsToComplete);

  const elWater = document.getElementById('setting-water-target');
  if (elWater) elWater.value = p.dailyWaterTargetMl;

  // Reminders
  if (p.reminderTimes) {
    const b = document.getElementById('remind-breakfast');
    if (b) b.value = p.reminderTimes.breakfast || '07:30';
    const l = document.getElementById('remind-lunch');
    if (l) l.value = p.reminderTimes.lunch || '12:30';
    const s = document.getElementById('remind-snack');
    if (s) s.value = p.reminderTimes.snack || '16:30';
    const d = document.getElementById('remind-dinner');
    if (d) d.value = p.reminderTimes.dinner || '20:00';
    const r = document.getElementById('remind-review');
    if (r) r.value = p.reminderTimes.dailyReview || '21:30';
  }

  // Avatar picker
  const picker = document.getElementById('avatar-picker-container');
  if (picker) {
    picker.innerHTML = '';
    const avatars = ['🌸', '🥑', '🍓', '🥗', '💪', '🏃‍♀️', '⚡', '🌟', '🔥', '👑'];
    avatars.forEach(av => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn btn-secondary ${p.avatar === av ? 'active' : ''}`;
      if (p.avatar === av) {
        btn.style.borderColor = 'var(--pink-400)';
        btn.style.boxShadow = '0 0 10px var(--pink-500)';
      }
      btn.style.fontSize = '20px';
      btn.style.padding = '8px 14px';
      btn.textContent = av;
      btn.onclick = () => {
        state.profile.avatar = av;
        saveProfile(state.profile);
        renderSettings();
        renderHeader();
        renderSidebar();
      };
      picker.appendChild(btn);
    });
  }

  // Notificação status
  const notifStat = document.getElementById('browser-notif-status');
  if (notifStat && 'Notification' in window) {
    notifStat.textContent = `Status: ${Notification.permission === 'granted' ? 'Autorizado ✓' : Notification.permission === 'denied' ? 'Bloqueado' : 'Pendente de autorização'}`;
  }
}

function updateMinHabitsDisplay(val) {
  const el = document.getElementById('setting-min-habits-val');
  if (el) el.textContent = `${val} de ${state.habits.length || 6}`;
}

function handleSaveSettings(e) {
  e.preventDefault();
  const name = document.getElementById('setting-name').value;
  const nick = document.getElementById('setting-nickname').value;
  const minHabits = parseInt(document.getElementById('setting-min-habits').value, 10);
  const waterTarget = parseInt(document.getElementById('setting-water-target').value, 10);

  state.profile.name = name.trim() || 'Atleta';
  state.profile.nickname = nick.trim();
  state.profile.minHabitsToComplete = minHabits;
  state.profile.dailyWaterTargetMl = waterTarget;

  state.profile.reminderTimes = {
    breakfast: document.getElementById('remind-breakfast').value,
    lunch: document.getElementById('remind-lunch').value,
    snack: document.getElementById('remind-snack').value,
    dinner: document.getElementById('remind-dinner').value,
    dailyReview: document.getElementById('remind-review').value,
  };

  saveProfile(state.profile);

  const alertBox = document.getElementById('settings-save-alert');
  if (alertBox) {
    alertBox.style.display = 'block';
    setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
  }

  renderAll();
}

// 10. Ações de Hábitos
function toggleHabit(habitId) {
  const today = getTodayDateString();
  const log = state.logs[today];
  if (!log) return;

  const isDone = log.completedHabitIds.includes(habitId);
  if (isDone) {
    log.completedHabitIds = log.completedHabitIds.filter(id => id !== habitId);
  } else {
    log.completedHabitIds.push(habitId);
    state.userXp += 30;
    saveUserXP(state.userXp);
    if (state.profile.soundEnabled) sounds.playHabitClick();
  }

  saveLogs(state.logs);
  renderAll();
}

function toggleAddHabitForm() {
  const form = document.getElementById('add-habit-form-container');
  if (form) {
    form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
  }
}

function saveNewHabit() {
  const label = document.getElementById('new-habit-label').value.trim();
  const desc = document.getElementById('new-habit-desc').value.trim();
  if (!label) return;

  const newHabit = {
    id: 'habit_' + Date.now(),
    label,
    description: desc || 'Hábito personalizado para sua rotina',
    category: 'nutrition',
    icon: 'sparkles',
    isCustom: true,
  };

  state.habits.push(newHabit);
  saveHabits(state.habits);

  document.getElementById('new-habit-label').value = '';
  document.getElementById('new-habit-desc').value = '';
  toggleAddHabitForm();
  renderAll();
}

function deleteCustomHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  saveHabits(state.habits);
  renderAll();
}

// 11. Hidratação
function addWater(deltaMl) {
  const today = getTodayDateString();
  const log = state.logs[today];
  if (!log) return;

  const prev = log.waterIntakeMl || 0;
  const target = log.waterTargetMl || state.profile.dailyWaterTargetMl;
  const next = Math.max(0, prev + deltaMl);

  log.waterIntakeMl = next;

  if (prev < target && next >= target) {
    state.userXp += 100;
    saveUserXP(state.userXp);
    if (state.profile.soundEnabled) sounds.playHabitClick();
  }

  saveLogs(state.logs);
  renderDashboard();
  renderMission();
}

// 12. Modal Finalizar Meu Dia
function openFinishModal() {
  const today = getTodayDateString();
  const log = state.logs[today] || { completedHabitIds: [], waterIntakeMl: 0 };
  const done = log.completedHabitIds.length;
  const total = state.habits.length;
  const minReq = state.profile.minHabitsToComplete;
  const isMet = done >= minReq;

  const countEl = document.getElementById('modal-habits-count');
  if (countEl) countEl.textContent = `${done} / ${total}`;

  const waterEl = document.getElementById('modal-water-count');
  if (waterEl) waterEl.textContent = `${log.waterIntakeMl || 0} ml`;

  const banner = document.getElementById('finish-criteria-banner');
  if (banner) {
    banner.innerHTML = isMet
      ? `<strong style="color: var(--pink-300); display: block; margin-bottom: 2px;">🎯 Critério diário alcançado!</strong>
         <span>Você cumpriu <strong>${done} de ${total}</strong> hábitos (critério mínimo: ${minReq}). Excelente constância!</span>`
      : `<strong style="color: var(--amber-400); display: block; margin-bottom: 2px;">⚠️ Atenção aos critérios diários:</strong>
         <span>Você cumpriu <strong>${done} de ${total}</strong> hábitos (critério mínimo: ${minReq}). Você ainda pode confirmar mesmo assim com transparência ao seu processo.</span>`;
  }

  // Render Stars
  renderStars('finish-energy-stars', state.energyRating, (r) => { state.energyRating = r; renderStars('finish-energy-stars', state.energyRating); });
  renderStars('finish-hunger-stars', state.hungerRating, (r) => { state.hungerRating = r; renderStars('finish-hunger-stars', state.hungerRating); });

  document.getElementById('finish-step-main').style.display = 'block';
  document.getElementById('finish-step-fail').style.display = 'none';

  const modal = document.getElementById('modal-finish-day');
  if (modal) modal.classList.add('active');

  if (window.lucide) lucide.createIcons();
}

function closeFinishModal() {
  const modal = document.getElementById('modal-finish-day');
  if (modal) modal.classList.remove('active');
}

function showFailStep() {
  document.getElementById('finish-step-main').style.display = 'none';
  document.getElementById('finish-step-fail').style.display = 'block';
}

function backToMainFinishStep() {
  document.getElementById('finish-step-main').style.display = 'block';
  document.getElementById('finish-step-fail').style.display = 'none';
}

function renderStars(containerId, rating, onClick) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'btn-ghost';
    star.style.padding = '2px';
    star.style.border = 'none';
    star.style.cursor = 'pointer';
    star.style.color = (i <= rating) ? 'var(--pink-400)' : 'var(--border-color)';
    star.innerHTML = '★';
    star.style.fontSize = '24px';
    star.onclick = () => { if (onClick) onClick(i); };
    container.appendChild(star);
  }
}

function confirmFinishDay(status) {
  const today = getTodayDateString();
  const log = state.logs[today] || {};
  const notes = document.getElementById('finish-notes').value.trim();

  log.status = status;
  log.notes = notes;
  log.energyRating = state.energyRating;
  log.hungerControlRating = state.hungerRating;
  log.finalizedAt = new Date().toISOString();

  state.logs[today] = log;
  saveLogs(state.logs);

  updateStreakState();

  if (status === 'completed') {
    state.userXp += 200;
    saveUserXP(state.userXp);

    if (state.profile.soundEnabled) sounds.playDayCompleted();

    // Confetes!
    if (window.confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#f43f5e', '#f472b6', '#fb7185', '#ffffff'],
      });
    }

    // Verifica milestone
    if (isMilestoneStreak(state.streak.currentStreak)) {
      const info = getMilestoneInfo(state.streak.currentStreak);
      if (info) {
        showMilestoneModal(info);
      }
    }

    addInAppNotification(
      '🔥 Dia Concluído com Sucesso!',
      `Parabéns! Sua ofensiva avançou para ${state.streak.currentStreak} dias consecutivos!`,
      'motivation'
    );
  } else {
    if (state.profile.soundEnabled) sounds.playWarning();
    addInAppNotification(
      'Atenção à sua rotina',
      state.streak.riskMessage || 'Não desista! Amanhã é mais uma chance de recomeçar com foco.',
      'streak_risk'
    );
  }

  checkAchievementsProgress();
  closeFinishModal();
  renderAll();
}

// 13. Milestones Modal
function showMilestoneModal(info) {
  const title = document.getElementById('milestone-modal-title');
  const subtitle = document.getElementById('milestone-modal-subtitle');
  if (title) title.textContent = info.title;
  if (subtitle) subtitle.textContent = info.subtitle;

  const modal = document.getElementById('modal-milestone');
  if (modal) modal.classList.add('active');

  if (state.profile.soundEnabled) sounds.playMilestone();
}

function closeMilestoneModal() {
  const modal = document.getElementById('modal-milestone');
  if (modal) modal.classList.remove('active');
}

function triggerExtraConfetti() {
  if (window.confetti) {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#f43f5e', '#d946ef', '#ffffff'],
    });
  }
}

// 14. Day Details Modal (from Calendar)
function openDayDetailsModal(dateStr) {
  state.selectedDetailDate = dateStr;
  const log = state.logs[dateStr] || { completedHabitIds: [], waterIntakeMl: 0, status: 'pending' };

  const title = document.getElementById('day-detail-title');
  if (title) title.textContent = formatFullDatePtBr(dateStr);

  const status = document.getElementById('day-detail-status');
  if (status) {
    status.textContent = (log.status === 'completed') ? 'Concluído com Sucesso' : (log.status === 'failed') ? 'Dia não cumprido' : 'Pendente';
    status.style.color = (log.status === 'completed') ? 'var(--pink-400)' : (log.status === 'failed') ? 'var(--rose-400)' : 'var(--amber-400)';
  }

  const habits = document.getElementById('day-detail-habits');
  if (habits) habits.textContent = `${log.completedHabitIds.length} / ${state.habits.length}`;

  const water = document.getElementById('day-detail-water');
  if (water) water.textContent = `${log.waterIntakeMl || 0} ml`;

  const notesBox = document.getElementById('day-detail-notes-box');
  const notesText = document.getElementById('day-detail-notes-text');
  if (notesBox && notesText) {
    if (log.notes) {
      notesBox.style.display = 'block';
      notesText.textContent = `"${log.notes}"`;
    } else {
      notesBox.style.display = 'none';
    }
  }

  const modal = document.getElementById('modal-day-details');
  if (modal) modal.classList.add('active');
}

function closeDayDetailsModal() {
  const modal = document.getElementById('modal-day-details');
  if (modal) modal.classList.remove('active');
}

function updateCurrentDetailDayStatus(newStatus) {
  if (!state.selectedDetailDate) return;
  const date = state.selectedDetailDate;
  if (!state.logs[date]) {
    state.logs[date] = {
      date,
      completedHabitIds: [],
      waterIntakeMl: 0,
      status: newStatus,
    };
  } else {
    state.logs[date].status = newStatus;
  }

  saveLogs(state.logs);
  updateStreakState();
  closeDayDetailsModal();
  renderAll();
}

// 15. Refeições
function openAddMealModal() {
  document.getElementById('meal-modal-title').textContent = 'Nova Refeição Planejada';
  document.getElementById('meal-edit-id').value = '';
  document.getElementById('meal-title-input').value = 'Lanche da Tarde';
  document.getElementById('meal-time-input').value = '16:00';
  document.getElementById('meal-plan-input').value = '';
  document.getElementById('meal-actual-input').value = '';
  document.getElementById('meal-notes-input').value = '';

  const modal = document.getElementById('modal-meal-form');
  if (modal) modal.classList.add('active');
}

function openEditMealModal(id) {
  const meal = state.meals.find(m => m.id === id);
  if (!meal) return;

  document.getElementById('meal-modal-title').textContent = 'Editar Refeição';
  document.getElementById('meal-edit-id').value = meal.id;
  document.getElementById('meal-title-input').value = meal.title;
  document.getElementById('meal-time-input').value = meal.time;
  document.getElementById('meal-plan-input').value = meal.plannedDescription;
  document.getElementById('meal-actual-input').value = meal.actualDescription || '';
  document.getElementById('meal-notes-input').value = meal.notes || '';

  const modal = document.getElementById('modal-meal-form');
  if (modal) modal.classList.add('active');
}

function closeMealModal() {
  const modal = document.getElementById('modal-meal-form');
  if (modal) modal.classList.remove('active');
}

function handleSaveMealForm(e) {
  e.preventDefault();
  const id = document.getElementById('meal-edit-id').value;
  const title = document.getElementById('meal-title-input').value.trim();
  const time = document.getElementById('meal-time-input').value;
  const planned = document.getElementById('meal-plan-input').value.trim();
  const actual = document.getElementById('meal-actual-input').value.trim();
  const notes = document.getElementById('meal-notes-input').value.trim();

  if (id) {
    const meal = state.meals.find(m => m.id === id);
    if (meal) {
      meal.title = title;
      meal.time = time;
      meal.plannedDescription = planned;
      meal.actualDescription = actual;
      meal.notes = notes;
    }
  } else {
    state.meals.push({
      id: 'meal_' + Date.now(),
      title,
      time,
      plannedDescription: planned,
      actualDescription: actual,
      followed: false,
      notes,
    });
    state.userXp += 40;
    saveUserXP(state.userXp);
  }

  saveMeals(state.meals);
  closeMealModal();
  renderPlanning();
  renderHeader();
  renderSidebar();
}

function deleteMealItem(id) {
  state.meals = state.meals.filter(m => m.id !== id);
  saveMeals(state.meals);
  renderPlanning();
}

function toggleMealFollowed(id) {
  const meal = state.meals.find(m => m.id === id);
  if (!meal) return;
  meal.followed = !meal.followed;
  if (meal.followed) {
    state.userXp += 40;
    saveUserXP(state.userXp);
    if (state.profile.soundEnabled) sounds.playHabitClick();
  }
  saveMeals(state.meals);
  renderPlanning();
  renderHeader();
  renderSidebar();
}

// 16. Gamificação & XP Check
function checkAchievementsProgress() {
  const currentStreak = state.streak.currentStreak;
  const today = getTodayDateString();
  const todayLog = state.logs[today] || {};

  state.achievements.forEach(ach => {
    if (ach.unlocked) return;

    let shouldUnlock = false;
    if (ach.requiredStreak) {
      ach.progressCurrent = Math.min(ach.progressMax, currentStreak);
      if (currentStreak >= ach.requiredStreak) shouldUnlock = true;
    } else if (ach.id === 'ach_water_master') {
      if ((todayLog.waterIntakeMl || 0) >= (todayLog.waterTargetMl || state.profile.dailyWaterTargetMl)) {
        shouldUnlock = true;
        ach.progressCurrent = 1;
      }
    } else if (ach.id === 'ach_all_habits') {
      if (todayLog.completedHabitIds && todayLog.completedHabitIds.length >= state.habits.length) {
        shouldUnlock = true;
        ach.progressCurrent = 1;
      }
    }

    if (shouldUnlock) {
      ach.unlocked = true;
      ach.unlockedAt = new Date().toISOString();
      state.userXp += ach.xpReward;
      saveUserXP(state.userXp);
      addInAppNotification('🏆 Conquista Desbloqueada!', `Você conquistou "${ach.title}" (+${ach.xpReward} XP)!`, 'achievement');
      if (state.profile.soundEnabled) sounds.playMilestone();
    }
  });

  saveAchievements(state.achievements);
}

function calculateLevel(xp) {
  const thresholds = [0, 500, 1200, 2200, 3600, 5500, 8000, 12000, 18000, 25000];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
    else break;
  }
  const currentBase = thresholds[level - 1] || 0;
  const nextXp = thresholds[level] || currentBase + 5000;
  return { level, nextXp, currentBase };
}

function getLevelTitle(level) {
  const titles = [
    'Iniciante do Foco',
    'Aprendiz Disciplinada',
    'Guardiã dos Hábitos',
    'Mestre da Consistência',
    'Atleta Nutricional',
    'Guerreira de Aço',
    'Lenda do Equilíbrio',
    'Centuriã FOCUSFIT'
  ];
  return titles[level - 1] || 'Lenda do Foco';
}

// 17. Notificações
function toggleNotificationsDropdown() {
  const panel = document.getElementById('notifications-panel');
  if (panel) {
    panel.classList.toggle('active');
  }
}

function renderNotificationsList() {
  const list = document.getElementById('notifications-list');
  if (!list) return;

  if (state.notifications.length === 0) {
    list.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">Nenhuma notificação no momento.</div>';
    return;
  }

  list.innerHTML = '';
  state.notifications.forEach(n => {
    const item = document.createElement('div');
    item.style.padding = '12px 18px';
    item.style.borderBottom = '1px solid var(--border-color)';
    item.style.backgroundColor = n.read ? 'transparent' : 'rgba(236,72,153,0.12)';
    item.style.cursor = 'pointer';
    item.onclick = () => { n.read = true; saveNotifications(state.notifications); renderNotificationsList(); renderHeader(); };

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <span style="font-size: 13px; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 6px;">
          ${!n.read ? '<span style="width: 6px; height: 6px; border-radius: 50%; background: var(--pink-400); display: inline-block;"></span>' : ''}
          ${n.title}
        </span>
        <span style="font-size: 10px; color: var(--text-muted); white-space: nowrap;">${formatDatePtBr(n.timestamp.slice(0, 10))}</span>
      </div>
      <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">${n.message}</p>
    `;
    list.appendChild(item);
  });
}

function addInAppNotification(title, message, type) {
  const notif = {
    id: 'notif_' + Date.now(),
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type,
  };
  state.notifications.unshift(notif);
  saveNotifications(state.notifications);
  renderNotificationsList();
  renderHeader();

  if ('Notification' in window && Notification.permission === 'granted' && state.profile.browserNotificationsEnabled) {
    try {
      new Notification(title, { body: message, icon: 'public/favicon.svg' });
    } catch (e) {}
  }
}

function markAllNotificationsAsRead() {
  state.notifications.forEach(n => n.read = true);
  saveNotifications(state.notifications);
  renderNotificationsList();
  renderHeader();
}

function clearNotifications() {
  state.notifications = [];
  saveNotifications(state.notifications);
  renderNotificationsList();
  renderHeader();
}

function sendTestNotification() {
  addInAppNotification(
    '🔔 Teste de Notificação FOCUSFIT',
    'Seu personal trainer alimentar está ativo! Hora de conferir seus objetivos e beber um copo d’água.',
    'reminder'
  );
  if (state.profile.soundEnabled) sounds.playNotification();
}

function requestBrowserPermission() {
  if (!('Notification' in window)) {
    alert('Notificações no navegador não são suportadas neste dispositivo.');
    return;
  }
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      state.profile.browserNotificationsEnabled = true;
      saveProfile(state.profile);
      sendTestNotification();
    }
    renderSettings();
  });
}

function toggleSound() {
  state.profile.soundEnabled = !state.profile.soundEnabled;
  saveProfile(state.profile);
  renderHeader();
  if (state.profile.soundEnabled) sounds.playHabitClick();
}

// 18. Simulador de Cenários
function runScenario(type) {
  const { logs, bestStreak } = createScenarioLogs(type);
  state.logs = logs;
  saveLogs(logs);

  if (bestStreak !== undefined) {
    saveBestStreak(bestStreak);
  }

  updateStreakState();

  if (type === '7_days_streak') {
    const info = getMilestoneInfo(7);
    if (info) showMilestoneModal(info);
    triggerExtraConfetti();
  }

  renderAll();
}

// 19. Backup Import
function handleImportBackup(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    if (importAppData(text)) {
      initState();
      renderAll();
      alert('Backup restaurado com sucesso! 🌸');
    } else {
      alert('Arquivo de backup inválido.');
    }
  };
  reader.readAsText(file);
}

// 20. Eventos de Janela
function setupEventListeners() {
  // Fecha notificações ao clicar fora
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('notifications-panel');
    const btn = document.getElementById('btn-notifications');
    if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
      panel.classList.remove('active');
    }
  });
}
