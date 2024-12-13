import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DatabaseProvider } from "./contexts/DatabaseContext";
import { PostProvider } from "./contexts/PostContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import { SocialMediaProvider } from "./contexts/SocialMediaContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import Analytics from "./pages/Analytics";
import { Calendar } from "./pages/Calendar";
import Settings from "./pages/Settings";
import { NotificationProvider } from "./contexts/NotificationContext";

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Auth Route wrapper (redirects to dashboard if already logged in)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (user) {
    // If user is already logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logout"
        element={
          <ProtectedRoute>
            <LogoutHandler />
          </ProtectedRoute>
        }
      />

      {/* Default Route - Redirect to login if not authenticated, dashboard if authenticated */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Logout handler component
const LogoutHandler = () => {
  const { logout } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleLogout = async () => {
      await logout();
      navigate('/login', { replace: true });
    };
    handleLogout();
  }, [logout, navigate]);

  return null;
};

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <DatabaseProvider>
          <PostProvider>
            <AnalyticsProvider>
              <SocialMediaProvider>
                <NotificationProvider>
                  <Router>
                    <div className="min-h-screen bg-white dark:bg-gray-900">
                      <AppRoutes />
                    </div>
                  </Router>
                </NotificationProvider>
              </SocialMediaProvider>
            </AnalyticsProvider>
          </PostProvider>
        </DatabaseProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
