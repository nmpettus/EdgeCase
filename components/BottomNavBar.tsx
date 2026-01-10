import React from 'react';
import { FlaskConical, Trophy, BookOpen } from 'lucide-react';

type Tab = 'lab' | 'controls' | 'learn';

interface BottomNavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isDarkMode: boolean;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange, isDarkMode }) => {
  const themeClasses = {
    nav: isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200',
    activeText: 'text-indigo-600',
    inactiveText: isDarkMode ? 'text-slate-400' : 'text-slate-500'
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'lab', label: 'Lab', icon: <FlaskConical size={24} /> },
    { id: 'controls', label: 'Presets', icon: <Trophy size={24} /> },
    { id: 'learn', label: 'Learn', icon: <BookOpen size={24} /> },
  ];

  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t px-4 py-2 ${themeClasses.nav}`}>
      <div className="flex justify-around items-start">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center gap-1 w-20 h-14 rounded-lg transition-colors"
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className={activeTab === tab.id ? themeClasses.activeText : themeClasses.inactiveText}>
              {tab.icon}
            </span>
            <span className={`text-xs font-bold ${activeTab === tab.id ? themeClasses.activeText : themeClasses.inactiveText}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="w-8 h-1 bg-indigo-600 rounded-full mt-1 animate-in fade-in-50 duration-300" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;
