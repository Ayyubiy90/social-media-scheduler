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
  console.log("Initialized posts:", posts); // Log initialized posts

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts((currentPosts) => {
      const updatedPosts = currentPosts.map((post) =>
        post.id === id ? { ...post, ...updates, updatedAt: new Date().toISOString() } : post
      );
      console.log("Updated posts:", updatedPosts); // Log updated posts
      return updatedPosts;
    });
  };

  const addPost = (post: Post) => {
    setPosts((currentPosts) => {
      const newPosts = [...currentPosts, post];
      console.log("Added post:", post, "New posts:", newPosts); // Log added post
      return newPosts;
    });
  };

  const deletePost = (id: string) => {
    setPosts((currentPosts) => {
      const filteredPosts = currentPosts.filter((post) => post.id !== id);
      console.log("Deleted post with id:", id, "Remaining posts:", filteredPosts); // Log deleted post
      return filteredPosts;
    });
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
