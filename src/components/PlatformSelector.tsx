import React from 'react';
import { Twitter, Instagram, Linkedin } from 'lucide-react';
import { Platform } from '../types';

interface PlatformSelectorProps {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export function PlatformSelector({ selected, onChange }: PlatformSelectorProps) {
  const togglePlatform = (platform: Platform) => {
    const newSelection = selected.includes(platform)
      ? selected.filter(p => p !== platform)
      : [...selected, platform];
    onChange(newSelection);
  };

  return (
    <div className="flex space-x-4">
      <button
        type="button"
        onClick={() => togglePlatform('twitter')}
        className={`p-2 rounded-md ${
          selected.includes('twitter')
            ? 'bg-blue-900 text-blue-100'
            : 'bg-white text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
        } dark:hover:bg-gray-600`}
      >
        <Twitter className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={() => togglePlatform('instagram')}
        className={`p-2 rounded-md ${
          selected.includes('instagram')
            ? 'bg-pink-900 text-pink-100'
            : 'bg-white text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
        } dark:hover:bg-gray-600`}
      >
        <Instagram className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={() => togglePlatform('linkedin')}
        className={`p-2 rounded-md ${
          selected.includes('linkedin')
            ? 'bg-blue-900 text-blue-100'
            : 'bg-white text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
        } dark:hover:bg-gray-600`}
      >
        <Linkedin className="h-6 w-6" />
      </button>
    </div>
  );
}
