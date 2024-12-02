import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
          theme === 'light'
            ? 'text-yellow-500'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <Sun className="h-5 w-5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
          theme === 'dark'
            ? 'text-blue-500'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <Moon className="h-5 w-5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
          theme === 'system'
            ? 'text-green-500'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <Monitor className="h-5 w-5" />
      </button>
    </div>
  );
}