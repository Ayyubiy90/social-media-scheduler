import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Post } from '../types';
import { mockPosts } from '../lib/mockData';

interface PostContextType {
  posts: Post[];
  updatePost: (id: string, updates: Partial<Post>) => void;
  addPost: (post: Post) => void;
  deletePost: (id: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === id ? { ...post, ...updates, updatedAt: new Date().toISOString() } : post
      )
    );
  };

  const addPost = (post: Post) => {
    setPosts((currentPosts) => [...currentPosts, post]);
  };

  const deletePost = (id: string) => {
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
  };

  return (
    <PostContext.Provider value={{ posts, updatePost, addPost, deletePost }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}