import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  UtensilsCrossed,
  CalendarDays,
  Trophy,
  BarChart3,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { NavTab } from '../../types';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, profile, streak, todayLog, habits, userLevel } = useApp();

  const completedCount = todayLog.completedHabitIds.length;
  const totalHabits = habits.length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'mission',
      label: 'Minha Missão',
      icon: CheckSquare,
      badge: `${completedCount}/${totalHabits}`,
    },
    {
      id: 'planning',
      label: 'Planejamento',
      icon: UtensilsCrossed,
    },
    {
      id: 'calendar',
      label: 'Calendário & Histórico',
      icon: CalendarDays,
    },
    {
      id: 'achievements',
      label: 'Conquistas',
      icon: Trophy,
    },
    {
      id: 'stats',
      label: 'Estatísticas',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-pink-950/40 bg-[#12050e] p-4 select-none shrink-0 min-h-[calc(100vh-4rem)]">
      
      {/* Navigation List */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/10 text-pink-300 border border-pink-500/40 shadow-sm shadow-pink-500/10'
                  : 'text-slate-400 hover:bg-pink-950/40 hover:text-pink-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? 'bg-pink-500 text-white font-bold shadow-[0_0_10px_#ec4899]'
                      : 'bg-pink-950/40 text-slate-400 group-hover:text-pink-400'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isActive
                      ? 'bg-pink-400 text-slate-950'
                      : 'bg-pink-950/80 text-pink-300 border border-pink-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mini User Profile Card */}
      <div className="mt-6 rounded-2xl border border-pink-500/20 bg-gradient-to-b from-pink-950/30 to-[#190814] p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-900/50 border border-pink-400/30 text-2xl shadow-inner shadow-pink-500/20">
            {profile.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{profile.name}</h4>
            <div className="flex items-center gap-1.5 text-xs text-pink-400">
              <Sparkles size={12} className="text-pink-300" />
              <span>Nível {userLevel}</span>
              <span className="text-slate-500">•</span>
              <span className="font-semibold text-slate-300">{streak.currentStreak}d 🔥</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('settings')}
          className="mt-3 flex w-full items-center justify-between rounded-xl bg-black/30 hover:bg-pink-950/50 px-2.5 py-1.5 text-xs text-slate-300 hover:text-pink-300 transition cursor-pointer"
        >
          <span>Gerenciar Perfil</span>
          <ChevronRight size={14} />
        </button>
      </div>

    </aside>
  );
};
