import React from 'react';
import { Settings, TrendingUp, Moon, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useStore();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 text-white p-4 shadow-lg transition-colors duration-200">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Crypto Sentiment Trader</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-6 w-6" />
            ) : (
              <Moon className="h-6 w-6" />
            )}
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};