import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SocialLoginButtons from "../components/SocialLoginButtons";
import { ThemeToggle } from "../components/ThemeToggle";
import { LogIn, Mail, Lock } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { ErrorDialog } from "../components/ErrorDialog";

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
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  // Clear any existing auth errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Show error dialog when auth error occurs
  useEffect(() => {
    if (authError) {
      setIsErrorDialogOpen(true);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            <ErrorDialog
              message={authError || ""}
              isOpen={isErrorDialogOpen}
              onClose={() => {
                setIsErrorDialogOpen(false);
                clearError();
              }}
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
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
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
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={authLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  authLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}>
                {authLoading ? "Signing in..." : "Sign in"}
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
