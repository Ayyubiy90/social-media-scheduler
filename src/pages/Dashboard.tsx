import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'wouter';
import { PostCard } from '../components/PostCard';
import { usePosts } from '../contexts/PostContext';

export function Dashboard() {
  const { posts } = usePosts();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome Back!</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and schedule your social media posts
            </p>
          </div>
          <Link href="/create">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus className="h-5 w-5 mr-2" />
              Create Post
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Posts</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}