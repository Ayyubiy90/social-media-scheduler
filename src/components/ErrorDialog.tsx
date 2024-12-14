import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorDialogProps {
  message: string;
  onClose: () => void;
  isOpen: boolean;
}

export function ErrorDialog({ message, onClose, isOpen }: ErrorDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Error</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
