import React from 'react';
import { MoreVertical, Edit2, Copy, Trash2, X } from 'lucide-react';
import { Post } from '../types';
import { usePosts } from '../contexts/PostContext';
import { useLocation } from 'wouter';

interface PostActionsProps {
  post: Post;
}

export function PostActions({ post }: PostActionsProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const { deletePost, addPost } = usePosts();
  const [, setLocation] = useLocation();

  const handleEdit = () => {
    setLocation(`/edit/${post.id}`);
    setShowMenu(false);
  };

  const handleDuplicate = () => {
    const duplicatedPost: Post = {
      ...post,
      id: crypto.randomUUID(),
      content: `${post.content} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledFor: null,
    };
    addPost(duplicatedPost);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600"
      >
        <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-300" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            <button
              onClick={handleEdit}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-600"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-600"
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-700 dark:hover:bg-gray-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}