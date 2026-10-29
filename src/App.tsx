import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { MilestoneCelebrationModal } from './components/layout/MilestoneCelebrationModal';
import { Dashboard } from './components/pages/Dashboard';
import { DailyMission } from './components/pages/DailyMission';
import { MealPlanning } from './components/pages/MealPlanning';
import { CalendarHistory } from './components/pages/CalendarHistory';
import { Achievements } from './components/pages/Achievements';
import { Statistics } from './components/pages/Statistics';
import { Settings } from './components/pages/Settings';

const MainLayout: React.FC = () => {
  const { activeTab, milestoneCelebration, dismissMilestoneCelebration } = useApp();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'mission':
        return <DailyMission />;
      case 'planning':
        return <MealPlanning />;
      case 'calendar':
        return <CalendarHistory />;
      case 'achievements':
        return <Achievements />;
      case 'stats':
        return <Statistics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f040a] text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* App Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Milestone Celebratory Confetti Modal */}
      <MilestoneCelebrationModal
        milestone={milestoneCelebration}
        onClose={dismissMilestoneCelebration}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
