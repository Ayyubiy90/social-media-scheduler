import React, { useState } from "react";
import { SocialMediaConnector } from "../components/SocialMediaConnector";
import { ThemeToggle } from "../components/ThemeToggle";
import { Settings as SettingsIcon, KeyRound, User, Mail } from "lucide-react";
import { changePassword } from "../services/authService";
import { useUser } from "../contexts/UserContext";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useUser();

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 mb-8 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Settings
                </h1>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 mb-8 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Account Information
              </h2>
            </div>
            <div className="pl-4 border-l-4 border-purple-500 dark:border-purple-400">
              <div className="flex items-center space-x-3 py-3">
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Email:
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {user?.email || "abdullahabdurazaq10@gmail.com"}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 mb-8 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <KeyRound className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Profile Settings
              </h2>
            </div>
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
                  className="block w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400 text-base px-4 transition-colors duration-200"
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
                  className="block w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400 text-base px-4 transition-colors duration-200"
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
                  className="block w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400 text-base px-4 transition-colors duration-200"
                />
              </div>
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-r-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-400 rounded-r-lg">
                  {success}
                </div>
              )}
              <div>
                <button
                  onClick={handlePasswordChange}
                  className="inline-flex items-center justify-center py-3 px-6 border border-transparent rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl">
                  <KeyRound className="w-5 h-5 mr-2" />
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Social Media Connections */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 transform transition-all duration-200 hover:shadow-xl">
            <SocialMediaConnector />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
