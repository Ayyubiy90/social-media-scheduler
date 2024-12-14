import React, { useState } from "react";
import { SocialMediaConnector } from "../components/SocialMediaConnector";
import { ThemeToggle } from "../components/ThemeToggle";
import { Layout } from "../components/Layout";
import { Settings as SettingsIcon, KeyRound } from "lucide-react";
import { changePassword } from "../services/authService";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = async () => {
    try {
      setError("");
      setSuccess("");

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("All fields are required");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long");
        return;
      }

      await changePassword(currentPassword, newPassword);

      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to change password"
      );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6" />
                    Settings
                  </h1>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Profile Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Profile Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full h-12 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 text-base px-4"
                  />
                </div>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full h-12 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 text-base px-4"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full h-12 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 text-base px-4"
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {success}
                  </div>
                )}
                <div>
                  <button
                    onClick={handlePasswordChange}
                    className="inline-flex items-center justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                    <KeyRound className="w-5 h-5 mr-2" />
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Social Media Connections */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6">
              <SocialMediaConnector />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
