import React, { useState } from "react";
import {
  Pencil,
  Settings as SettingsIcon,
  LogOut,
  User,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { User as UserType } from "../services/authService";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { uploadProfilePicture } from "../services/storageService";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

export function ProfileDialog({ isOpen, onClose, user }: ProfileDialogProps) {
  const navigate = useNavigate();
  const { logout } = useUser();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      await uploadProfilePicture(file);
      setIsUploadOpen(false);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-25 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="fixed inset-x-4 top-20 md:inset-x-auto md:left-auto md:right-4 md:w-96 z-50"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all duration-200">
          {/* Header with Profile Picture */}
          <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl">
            <div className="absolute -bottom-12 inset-x-0 flex justify-center">
              <div className="relative group">
                {user?.photoURL ? (
                  <div className="relative group-hover:opacity-90 transition-all duration-200">
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-24 h-24 rounded-xl object-cover ring-4 ring-white dark:ring-gray-800 shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-xl bg-black opacity-0 group-hover:opacity-20 transition-all duration-200" />
                  </div>
                ) : (
                  <div
                    className={`w-24 h-24 rounded-xl ${getProfileColor(
                      user?.email
                    )} flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white dark:ring-gray-800 shadow-lg group-hover:opacity-90 transition-all duration-200`}>
                    {getInitial(user?.email)}
                  </div>
                )}
                <button
                  className={`absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 group-hover:scale-110 ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => !uploading && setIsUploadOpen(true)}
                  disabled={uploading}
                  title={uploading ? "Uploading..." : "Change profile picture"}>
                  <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-16 px-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Name
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.displayName || "User"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 mt-6 space-y-3">
            <button
              onClick={handleSettings}
              className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 dark:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-all duration-200">
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium">Profile Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <ProfilePictureUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
