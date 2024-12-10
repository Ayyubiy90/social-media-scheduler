import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

const Dashboard = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const copyToClipboard = async () => {
        if (user?.token) {
            try {
                await navigator.clipboard.writeText(user.token);
                setCopied(true);
                // Reset the "Copied!" message after 2 seconds
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6">
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
                        <div className="text-gray-600 dark:text-gray-300">
                            <p className="mb-2">Welcome to your dashboard!</p>
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
