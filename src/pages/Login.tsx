import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SocialLoginButtons from "../components/SocialLoginButtons";
import { ThemeToggle } from "../components/ThemeToggle";
import { LogIn, Mail, Lock } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { ErrorDialog } from "../components/ErrorDialog";

const MAX_ATTEMPTS = 5;
const COOLDOWN_TIME = 60; // seconds

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    error: authError,
    loading: authLoading,
    clearError,
  } = useUser();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Show error dialog when auth error occurs
  useEffect(() => {
    if (authError) {
      setShowErrorDialog(true);
      setAttempts((prev) => prev + 1);

      if (attempts + 1 >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setCooldownTime(COOLDOWN_TIME);
      }
    }
  }, [authError]);

  // Handle cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLocked && cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, cooldownTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setShowErrorDialog(true);
      return;
    }

    try {
      await login(credentials);
      // Get the redirect path from location state or default to dashboard
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by UserContext and shown in dialog
      console.error("Login error:", error);
    }
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
    clearError();
  };

  // Get the appropriate error message
  const getErrorMessage = () => {
    if (isLocked) {
      return `Too many failed attempts. Please wait ${cooldownTime} seconds before trying again.`;
    }
    return authError || "";
  };

  // Get remaining attempts message
  const getRemainingAttemptsMessage = () => {
    if (isLocked) return "";
    const remaining = MAX_ATTEMPTS - attempts;
    if (remaining <= 3) {
      return `\n\nRemaining attempts: ${remaining}`;
    }
    return "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-900 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <LogIn className="w-8 h-8" />
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              create a new account
            </button>
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Dialog */}
            <ErrorDialog
              message={getErrorMessage() + getRemainingAttemptsMessage()}
              isOpen={showErrorDialog}
              onClose={handleCloseErrorDialog}
            />

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLocked}
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isLocked}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={authLoading || isLocked}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  authLoading || isLocked ? "opacity-50 cursor-not-allowed" : ""
                }`}>
                {authLoading
                  ? "Signing in..."
                  : isLocked
                  ? `Locked (${cooldownTime}s)`
                  : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <SocialLoginButtons />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
