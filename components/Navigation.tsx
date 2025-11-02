import React from 'react';
import { MoonIcon, ChartBarIcon } from './Icons';

type Page = 'tracker' | 'history';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { page: 'tracker' as Page, label: 'Tracker', icon: <MoonIcon className="w-6 h-6 mb-1" /> },
    { page: 'history' as Page, label: 'History', icon: <ChartBarIcon className="w-6 h-6 mb-1" /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/60 backdrop-blur-xl border-t border-slate-200/10 z-50">
      <div className="container mx-auto flex justify-around items-center h-20">
        {navItems.map(item => {
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`flex flex-col items-center justify-center w-28 h-14 rounded-2xl transition-all duration-300 ease-in-out transform focus:outline-none hover:scale-105 ${
                isActive
                  ? 'bg-slate-700/50 text-sky-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-sky-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-xs font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
