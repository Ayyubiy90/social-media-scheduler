import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePost } from "../contexts/PostContext";
import {
  LayoutDashboard,
  CalendarCheck,
  Archive,
  Edit2,
  Trash2,
  Clock,
  Calendar,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { drafts, scheduledPosts, loading, fetchPosts, deletePost } = usePost();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 mb-8 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <LayoutDashboard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
              </div>
            </div>

            {/* Scheduled Posts Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 transition-all duration-200 hover:shadow-lg backdrop-blur-md bg-opacity-30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Scheduled Posts
                  </h2>
                </div>
              </div>
              <div className="space-y-6">
                {scheduledPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No scheduled posts yet
                    </p>
                  </div>
                ) : (
                  scheduledPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-all duration-200 hover:shadow-lg">
                      <p className="text-gray-900 dark:text-white text-lg mb-4">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            Scheduled for: {formatDate(post.scheduledFor!)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/edit-post/${post.id}`)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200">
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 rounded-lg transition-colors duration-200">
                            <Trash2 className="w-4 h-4" />
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 transform transition-all duration-200 hover:shadow-lg mb-4 backdrop-blur-md bg-opacity-30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Archive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Drafts
                </h2>
              </div>
              <div className="space-y-6">
                {drafts.length === 0 ? (
                  <div className="text-center py-8">
                    <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No drafts available
                    </p>
                  </div>
                ) : (
                  drafts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-all duration-200 hover:shadow-lg">
                      <p className="text-gray-900 dark:text-white text-lg mb-4">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Created: {formatDate(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/edit-post/${post.id}`)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200">
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 rounded-lg transition-colors duration-200">
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
};

export default Dashboard;
