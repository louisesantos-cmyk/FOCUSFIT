import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Clock,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Trophy,
  Sparkles,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  exportAppData,
  importAppData,
} from '../../utils/storage';
import {
  requestBrowserNotificationPermission,
  getNotificationPermission,
} from '../../utils/notifications';

export const Settings: React.FC = () => {
  const {
    profile,
    updateProfile,
    habits,
    applyScenario,
    sendManualTestNotification,
  } = useApp();

  const [name, setName] = useState(profile.name);
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [waterTarget, setWaterTarget] = useState(profile.dailyWaterTargetMl);
  const [minHabits, setMinHabits] = useState(profile.minHabitsToComplete);

  // Reminder times
  const [breakfastTime, setBreakfastTime] = useState(profile.reminderTimes.breakfast);
  const [lunchTime, setLunchTime] = useState(profile.reminderTimes.lunch);
  const [snackTime, setSnackTime] = useState(profile.reminderTimes.snack);
  const [dinnerTime, setDinnerTime] = useState(profile.reminderTimes.dinner);
  const [dailyReviewTime, setDailyReviewTime] = useState(profile.reminderTimes.dailyReview);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationPerm, setNotificationPerm] = useState(getNotificationPermission);

  const avatarOptions = ['🌸', '🥑', '🍓', '🥗', '💪', '🏃‍♀️', '⚡', '🌟', '🔥', '👑'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Atleta',
      nickname: nickname.trim(),
      avatar,
      dailyWaterTargetMl: Number(waterTarget),
      minHabitsToComplete: Number(minHabits),
      reminderTimes: {
        ...profile.reminderTimes,
        breakfast: breakfastTime,
        lunch: lunchTime,
        snack: snackTime,
        dinner: dinnerTime,
        dailyReview: dailyReviewTime,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRequestNotifications = async () => {
    const res = await requestBrowserNotificationPermission();
    setNotificationPerm(res);
    if (res === 'granted') {
      updateProfile({ browserNotificationsEnabled: true });
      sendManualTestNotification();
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const ok = importAppData(text);
        if (ok) {
          window.location.reload();
        } else {
          alert('Arquivo de backup inválido.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-r from-pink-950/80 via-[#180612] to-[#0f040a] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-2">
              <SettingsIcon size={13} className="text-pink-300" />
              <span>Personalização</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Configurações & Perfil
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Ajuste seus horários de lembrete, critérios de validação da ofensiva, preferências de som e faça backup dos seus dados.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-pink-400 font-bold bg-pink-950/60 px-3 py-1.5 rounded-xl border border-pink-500/40">
                <Check size={14} /> Salvo com sucesso!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Profile Details */}
        <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-pink-950/60 pb-3">
            <User size={18} className="text-pink-400" />
            <span>Identidade & Perfil</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seu nome ou apelido:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-pink-950 bg-black/60 p-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Título ou lema pessoal:
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Foco & Determinação"
                className="w-full rounded-xl border border-pink-950 bg-black/60 p-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Escolha seu avatar:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {avatarOptions.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`h-11 w-11 rounded-2xl text-xl flex items-center justify-center transition border ${
                    avatar === av
                      ? 'border-pink-400 bg-pink-950/80 shadow-[0_0_8px_#ec4899]'
                      : 'border-slate-800 bg-black/30 hover:border-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reminders & Schedules */}
        <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-pink-950/60 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-pink-400" />
              <span>Horários de Lembretes Diários</span>
            </h2>
            <button
              type="button"
              onClick={sendManualTestNotification}
              className="text-xs text-pink-400 hover:text-pink-300 font-bold transition"
            >
              Testar Notificação Agora
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="rounded-2xl border border-pink-950 bg-black/40 p-3">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Café da Manhã
              </label>
              <input
                type="time"
                value={breakfastTime}
                onChange={(e) => setBreakfastTime(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-black/60 p-1.5 text-xs text-white"
              />
            </div>

            <div className="rounded-2xl border border-pink-950 bg-black/40 p-3">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Almoço
              </label>
              <input
                type="time"
                value={lunchTime}
                onChange={(e) => setLunchTime(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-black/60 p-1.5 text-xs text-white"
              />
            </div>

            <div className="rounded-2xl border border-pink-950 bg-black/40 p-3">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Lanche da Tarde
              </label>
              <input
                type="time"
                value={snackTime}
                onChange={(e) => setSnackTime(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-black/60 p-1.5 text-xs text-white"
              />
            </div>

            <div className="rounded-2xl border border-pink-950 bg-black/40 p-3">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Jantar
              </label>
              <input
                type="time"
                value={dinnerTime}
                onChange={(e) => setDinnerTime(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-black/60 p-1.5 text-xs text-white"
              />
            </div>

            <div className="rounded-2xl border border-pink-950 bg-black/40 p-3">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Revisão do Dia
              </label>
              <input
                type="time"
                value={dailyReviewTime}
                onChange={(e) => setDailyReviewTime(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-black/60 p-1.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Browser Notifications Permission */}
          <div className="mt-4 pt-4 border-t border-pink-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white block">
                Notificações no Navegador
              </span>
              <span className="text-[11px] text-slate-400">
                Status: {notificationPerm === 'granted' ? 'Autorizado ✓' : notificationPerm === 'denied' ? 'Bloqueado no navegador' : 'Pendente de autorização'}
              </span>
            </div>

            {notificationPerm !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestNotifications}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Autorizar Notificações
              </button>
            )}
          </div>
        </div>

        {/* Day Criteria & Targets */}
        <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-pink-950/60 pb-3">
            <Trophy size={18} className="text-amber-400" />
            <span>Metas Pessoais & Critérios de Conclusão</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mínimo de hábitos para validar um dia de ofensiva:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={habits.length || 6}
                  value={minHabits}
                  onChange={(e) => setMinHabits(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
                <span className="text-sm font-black text-pink-400 w-16">
                  {minHabits} de {habits.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Você escolhe seu padrão: seja realista e focado em manter o ritmo.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meta de água diária (ml):
              </label>
              <input
                type="number"
                step={250}
                min={1000}
                max={6000}
                value={waterTarget}
                onChange={(e) => setWaterTarget(Number(e.target.value))}
                className="w-full rounded-xl border border-pink-950 bg-black/60 p-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Recomendado: 2500 a 3500 ml para adultos ativos.
              </span>
            </div>
          </div>
        </div>

        {/* Preferences: Sound & Theme */}
        <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-pink-950/60 pb-3">
            <Sparkles size={18} className="text-pink-300" />
            <span>Preferências Visuais & Sonoras</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-2xl border border-pink-950 bg-black/30 p-4">
              <div>
                <span className="text-xs font-bold text-white block">Tema da Interface</span>
                <span className="text-[11px] text-slate-400">
                  {profile.theme === 'dark' ? 'Modo Escuro (Velvet Dark Pink & Rose)' : 'Modo Claro'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => updateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' })}
                className="p-2.5 rounded-xl border border-pink-500/30 bg-pink-950/40 text-pink-300 hover:text-white transition"
              >
                {profile.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-pink-950 bg-black/30 p-4">
              <div>
                <span className="text-xs font-bold text-white block">Efeitos Sonoros</span>
                <span className="text-[11px] text-slate-400">
                  {profile.soundEnabled ? 'Sons ativados' : 'Silencioso'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => updateProfile({ soundEnabled: !profile.soundEnabled })}
                className="p-2.5 rounded-xl border border-pink-500/30 bg-pink-950/40 text-pink-300 hover:text-white transition"
              >
                {profile.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-sm shadow-xl shadow-pink-500/25 transition cursor-pointer"
          >
            Salvar Todas as Configurações
          </button>
        </div>
      </form>

      {/* Simulator / Demonstration Testing Tools */}
      <div className="rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#21091a] via-[#140610] to-[#0f040a] p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-pink-300" />
            <span>Simulador de Cenários & Testes de Ofensiva</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Teste instantaneamente as regras da ofensiva (7 dias, aviso de 1 falha em risco, quebra após 2 falhas consecutivas e celebrações):
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <button
            type="button"
            onClick={() => applyScenario('7_days_streak')}
            className="p-3 rounded-2xl border border-pink-500/40 bg-pink-950/60 hover:bg-pink-900/60 text-left transition cursor-pointer"
          >
            <span className="text-xs font-bold text-pink-300 block mb-1">
              🔥 Ofensiva de 7 Dias
            </span>
            <span className="text-[11px] text-slate-300 leading-tight block">
              Ativa sequência de 7 dias com confetes e marco comemorativo
            </span>
          </button>

          <button
            type="button"
            onClick={() => applyScenario('at_risk_1_fail')}
            className="p-3 rounded-2xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/40 text-left transition cursor-pointer"
          >
            <span className="text-xs font-bold text-amber-300 block mb-1">
              ⚠️ Alerta de Ofensiva em Risco
            </span>
            <span className="text-[11px] text-slate-300 leading-tight block">
              Simula 1 falha ontem e aciona banner de incentivo para salvar hoje
            </span>
          </button>

          <button
            type="button"
            onClick={() => applyScenario('broken_2_fails')}
            className="p-3 rounded-2xl border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/40 text-left transition cursor-pointer"
          >
            <span className="text-xs font-bold text-rose-300 block mb-1">
              💔 Quebra (2 Falhas Seguidas)
            </span>
            <span className="text-[11px] text-slate-300 leading-tight block">
              Encerra sequência atual preservando o recorde anterior
            </span>
          </button>

          <button
            type="button"
            onClick={() => applyScenario('reset')}
            className="p-3 rounded-2xl border border-slate-700 bg-black/40 hover:bg-black/60 text-left transition cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-300 block mb-1">
              🔄 Restaurar Padrão
            </span>
            <span className="text-[11px] text-slate-400 leading-tight block">
              Retorna o dia atual para pendente
            </span>
          </button>
        </div>
      </div>

      {/* Backup: Export / Import */}
      <div className="rounded-3xl border border-pink-950/60 bg-[#160611] p-6 shadow-md">
        <h3 className="text-base font-bold text-white mb-2">
          Backup & Exportação dos Dados
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Seus dados estão salvos localmente no navegador. Você pode baixar uma cópia em JSON ou restaurá-la a qualquer momento.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportAppData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/40 text-pink-300 text-xs font-bold transition cursor-pointer"
          >
            <Download size={15} />
            <span>Exportar Dados (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-black/40 hover:bg-black/60 text-slate-300 text-xs font-bold transition cursor-pointer">
            <Upload size={15} />
            <span>Importar Backup (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

    </div>
  );
};
