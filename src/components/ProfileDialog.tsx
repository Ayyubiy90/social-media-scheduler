import React from "react";
import { Pencil, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { User } from "../services/authService";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function ProfileDialog({ isOpen, onClose, user }: ProfileDialogProps) {
  const navigate = useNavigate();
  const { logout } = useUser();

  if (!isOpen) return null;

  const getInitial = (email: string | null) => {
    return email ? email[0].toUpperCase() : "U";
  };

  const getProfileColor = (email: string | null) => {
    if (!email) return "bg-blue-500";
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSettings = () => {
    navigate("/settings");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black bg-opacity-25"
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-4 top-20 md:inset-x-auto md:left-auto md:right-4 md:w-96 z-50"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile
                </h2>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer hover:scale-105 transform transition-all duration-200">
                {user?.photoURL ? (
                  <div className="relative group-hover:opacity-90 transition-all">
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                    />
                    <div className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-20 transition-all duration-200" />
                  </div>
                ) : (
                  <div
                    className={`w-20 h-20 rounded-full ${getProfileColor(
                      user?.email
                    )} flex items-center justify-center text-white text-2xl font-semibold ring-2 ring-white dark:ring-gray-800 group-hover:opacity-90 transition-opacity`}>
                    {getInitial(user?.email)}
                  </div>
                )}
                <button
                  className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all group-hover:scale-110 z-10 cursor-pointer"
                  onClick={handleSettings}
                  title="Change profile picture">
                  <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* User Info */}
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.displayName || "User"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4">
            <button
              onClick={handleSettings}
              className="w-full mb-2 px-4 py-2 text-left flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <SettingsIcon className="w-5 h-5" />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
