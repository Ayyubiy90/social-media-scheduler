import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorDialogProps {
  message: string;
  onClose: () => void;
  isOpen: boolean;
}

export function ErrorDialog({ message, onClose, isOpen }: ErrorDialogProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  // Extract countdown time from message if it exists
  useEffect(() => {
    if (isOpen && message.includes("wait")) {
      const match = message.match(/wait (\d+) seconds/);
      if (match && match[1]) {
        setCountdown(parseInt(match[1], 10));
      }
    } else {
      setCountdown(null);
    }
  }, [isOpen, message]);

  // Handle countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Format the message to show countdown
  const formattedMessage =
    countdown !== null
      ? message.replace(/\d+ seconds/, `${countdown} seconds`)
      : message;

  // Prevent scrolling when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          aria-hidden="true"
          onClick={countdown === null ? onClose : undefined}></div>

        {/* Center dialog */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-gray-800">
          <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-900">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Authentication Error
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {formattedMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={countdown === null ? onClose : undefined}
              disabled={countdown !== null}
              className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm dark:hover:bg-red-800 ${
                countdown !== null ? "opacity-50 cursor-not-allowed" : ""
              }`}>
              {countdown !== null ? `Wait (${countdown}s)` : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
