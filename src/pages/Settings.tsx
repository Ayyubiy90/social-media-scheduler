import React from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useUser } from '../contexts/UserContext';

export function Settings() {
  const { user } = useUser();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme</h2>
          <ThemeToggle />
        </div>

        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile</h2>
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-12 w-12 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Connected Platforms</h2>
          <div className="space-y-4">
            {user.connectedPlatforms.map((platform) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white capitalize">{platform}</span>
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                  Connected
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}