import React from 'react';
import { Post } from '../types';
import { PostActions } from './PostActions';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-gray-100">{post.content}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {post.platforms.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              post.status === 'scheduled'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
            }`}
          >
            {post.status}
          </span>
          <PostActions post={post} />
        </div>
      </div>
      {post.mediaUrls.length > 0 && (
        <div className="mt-2">
          <img
            src={post.mediaUrls[0]}
            alt="Post media"
            className="h-32 w-full object-cover rounded"
          />
        </div>
      )}
    </div>
  );
}