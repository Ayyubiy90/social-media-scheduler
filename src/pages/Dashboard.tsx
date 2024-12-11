import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { Post, Notification } from '../types/database';

const Dashboard = () => {
    const { user, logout } = useUser();
    const { 
        userProfile,
        posts,
        notifications,
        loading,
        error,
        fetchUserProfile,
        fetchPosts,
        fetchNotifications
    } = useDatabase();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user?.uid) {
            fetchUserProfile();
            fetchPosts();
            fetchNotifications();
        }
    }, [user?.uid, fetchUserProfile, fetchPosts, fetchNotifications]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const copyToClipboard = async () => {
        if (user?.token) {
            try {
                await navigator.clipboard.writeText(user.token);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    };

    const formatDate = (date: Date | undefined): string => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-600 dark:text-gray-300">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-red-600 dark:text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
                                <ThemeToggle />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Logout
                            </button>
                        </div>
                        
                        {/* User Profile Section */}
                        <div className="text-gray-600 dark:text-gray-300">
                            <p className="mb-2">Welcome{userProfile?.displayName ? `, ${userProfile.displayName}` : ''}!</p>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium">Authentication Token:</p>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                            copied 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600'
                                        }`}
                                    >
                                        {copied ? 'Copied!' : 'Copy Token'}
                                    </button>
                                </div>
                                <p className="text-sm break-all font-mono bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                                    {user?.token}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Posts Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h2>
                        <div className="space-y-4">
                            {posts.length === 0 ? (
                                <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
                            ) : (
                                posts.map((post: Post) => (
                                    <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                        <p className="text-gray-900 dark:text-white">{post.content}</p>
                                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {post.status === 'scheduled' && (
                                                <span>Scheduled for: {formatDate(post.scheduledFor)}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Notifications</h2>
                        <div className="space-y-4">
                            {notifications.length === 0 ? (
                                <p className="text-gray-600 dark:text-gray-400">No notifications</p>
                            ) : (
                                notifications.map((notification: Notification) => (
                                    <div key={notification.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                                        <div>
                                            <p className="text-gray-900 dark:text-white">{notification.message}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                                New
                                            </span>
                                        )}
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
