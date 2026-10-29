import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  UtensilsCrossed,
  CalendarDays,
  Trophy,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { NavTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, todayLog, habits } = useApp();

  const completedCount = todayLog.completedHabitIds.length;
  const totalHabits = habits.length;

  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'mission', label: 'Missão', icon: CheckSquare },
    { id: 'planning', label: 'Dieta', icon: UtensilsCrossed },
    { id: 'calendar', label: 'Histórico', icon: CalendarDays },
    { id: 'achievements', label: 'Conquistas', icon: Trophy },
    { id: 'stats', label: 'Gráficos', icon: BarChart3 },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-pink-950/60 bg-[#0f040a]/95 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-around px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 cursor-pointer ${
                isActive ? 'text-pink-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                {tab.id === 'mission' && completedCount < totalHabits && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold text-pink-300' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-pink-400 shadow-[0_0_8px_#ec4899]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
