import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Sparkles,
  Check,
  Trash2,
  X,
  Volume2,
  VolumeX,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StreakFlame } from '../common/StreakFlame';
import { formatDatePtBr } from '../../utils/dateUtils';

export const Header: React.FC = () => {
  const {
    profile,
    updateProfile,
    streak,
    userLevel,
    userXp,
    nextLevelXp,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    sendManualTestNotification,
    setActiveTab,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const toggleTheme = () => {
    updateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' });
  };

  const toggleSound = () => {
    updateProfile({ soundEnabled: !profile.soundEnabled });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-pink-950/40 bg-[#0f040a]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-fuchsia-400 p-0.5 shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform duration-300">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0f040a]">
              <Flame className="h-5 w-5 text-pink-500 group-hover:text-pink-300 transition-colors fill-current" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-black tracking-wider text-white">
              <span className="text-xl">FOCUS</span>
              <span className="text-xl text-pink-400 font-extrabold">FIT</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-pink-400/80 font-bold -mt-1 hidden sm:inline">
              Personal Alimentar
            </span>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Streak Flame Badge */}
          <button
            onClick={() => setActiveTab('calendar')}
            className="flex items-center rounded-2xl bg-pink-950/40 hover:bg-pink-900/40 border border-pink-500/20 px-3 py-1.5 transition cursor-pointer"
            title="Ver calendário de ofensiva"
          >
            <StreakFlame streak={streak} size="sm" showLabel={true} />
          </button>

          {/* User Level Pill */}
          <button
            onClick={() => setActiveTab('achievements')}
            className="hidden md:flex items-center gap-2 rounded-2xl bg-pink-950/30 border border-pink-500/20 px-3 py-1.5 text-xs text-slate-300 hover:border-pink-500/40 transition cursor-pointer"
            title="Ver Conquistas & XP"
          >
            <Sparkles size={14} className="text-pink-400" />
            <span className="font-bold text-white">Nível {userLevel}</span>
            <span className="text-pink-300 text-[11px] font-semibold">{userXp} / {nextLevelXp} XP</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="rounded-xl p-2 text-slate-400 hover:bg-pink-950/60 hover:text-pink-400 transition cursor-pointer"
            title={profile.soundEnabled ? 'Sons ativados' : 'Sons desativados'}
            aria-label="Alternar som"
          >
            {profile.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 text-slate-400 hover:bg-pink-950/60 hover:text-pink-400 transition cursor-pointer"
            title={`Alternar para tema ${profile.theme === 'dark' ? 'claro' : 'escuro'}`}
            aria-label="Alternar tema"
          >
            {profile.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications Bell & Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-xl p-2 text-slate-400 hover:bg-pink-950/60 hover:text-pink-400 transition cursor-pointer"
              title="Notificações e Lembretes"
              aria-label="Notificações"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-pink-500/30 bg-[#160611] shadow-2xl shadow-black/80 backdrop-blur-2xl z-50 overflow-hidden animate-fadeIn">
                <div className="flex items-center justify-between border-b border-pink-950/80 px-4 py-3 bg-pink-950/40">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-pink-400" />
                    <h3 className="font-bold text-sm text-white">Central de Lembretes</h3>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                        {unreadCount} novas
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Notification Action Buttons */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-pink-950/60 bg-black/20 text-xs">
                  <button
                    onClick={markAllNotificationsAsRead}
                    disabled={unreadCount === 0}
                    className="flex items-center gap-1 text-slate-400 hover:text-pink-300 disabled:opacity-40 transition cursor-pointer"
                  >
                    <Check size={12} />
                    Marcar lidas
                  </button>
                  <button
                    onClick={sendManualTestNotification}
                    className="text-pink-400 hover:text-pink-300 font-medium transition cursor-pointer"
                  >
                    Simular lembrete
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    disabled={notifications.length === 0}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-400 disabled:opacity-40 transition cursor-pointer"
                  >
                    <Trash2 size={12} />
                    Limpar
                  </button>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-pink-950/40">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400">
                      Nenhuma notificação no momento.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3.5 transition cursor-pointer hover:bg-pink-950/30 ${
                          notif.read ? 'opacity-70 bg-transparent' : 'bg-pink-950/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {!notif.read && (
                              <span className="h-2 w-2 rounded-full bg-pink-400 inline-block" />
                            )}
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatDatePtBr(notif.timestamp.slice(0, 10))}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 text-center border-t border-pink-950/80 bg-black/30">
                  <span className="text-[11px] text-slate-400">
                    Lembretes diários configuráveis nas Configurações
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
