import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { usePost } from "../contexts/PostContext";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  LayoutDashboard,
  Copy,
  FilePlus2,
  LogOut,
  KeyRound,
  CalendarCheck,
  Archive,
  BarChart2,
  Calendar,
  Settings,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { drafts, scheduledPosts, loading, error, fetchPosts, deletePost } =
    usePost();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const copyToClipboard = async () => {
    if (user?.token) {
      try {
        await navigator.clipboard.writeText(user.token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <LayoutDashboard className="w-6 h-6" />
                  Dashboard
                </h1>
                <ThemeToggle />
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/analytics")}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <BarChart2 className="w-4 h-4" />
                  Analytics
                </button>
                <button
                  onClick={() => navigate("/calendar")}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <Calendar className="w-4 h-4" />
                  Calendar
                </button>
                <button
                  onClick={() => navigate("/create-post")}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <FilePlus2 className="w-4 h-4" />
                  Create Post
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="text-gray-600 dark:text-gray-300">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    <p className="font-medium">Authentication Token:</p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600"
                    }`}>
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy Token"}
                  </button>
                </div>
                <p className="text-sm break-all font-mono bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                  {user?.token}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-6">
              {error}
            </div>
          )}

          {/* Scheduled Posts Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <CalendarCheck className="w-5 h-5" />
              Scheduled Posts
            </h2>
            <div className="space-y-4">
              {scheduledPosts.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  No scheduled posts
                </p>
              ) : (
                scheduledPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="text-gray-900 dark:text-white">
                      {post.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        Scheduled for: {formatDate(post.scheduledFor!)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/edit-post/${post.id}`)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                          Edit
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Drafts Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Archive className="w-5 h-5" />
              Drafts
            </h2>
            <div className="space-y-4">
              {drafts.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No drafts</p>
              ) : (
                drafts.map((post) => (
                  <div
                    key={post.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="text-gray-900 dark:text-white">
                      {post.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Created: {formatDate(post.createdAt)}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/edit-post/${post.id}`)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                          Edit
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
