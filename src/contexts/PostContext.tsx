import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Post } from "../types/database";
import { postService } from "../services/postService";

interface PostContextType {
  posts: Post[];
  drafts: Post[];
  scheduledPosts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  createPost: (
    content: string,
    platforms: string[],
    scheduledFor?: Date
  ) => Promise<Post>;
  updatePost: (
    postId: string,
    content: string,
    platforms: string[]
  ) => Promise<Post>;
  deletePost: (postId: string) => Promise<void>;
  schedulePost: (postId: string, scheduledFor: Date) => Promise<Post>;
  cancelScheduledPost: (postId: string) => Promise<Post>;
  validateContent: (
    content: string,
    platform: string
  ) => { valid: boolean; message?: string };
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await postService.getPosts();
      setPosts(fetchedPosts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async (
    content: string,
    platforms: string[],
    scheduledFor?: Date
  ): Promise<Post> => {
    setLoading(true);
    try {
      const newPost = await postService.createPost({
        content,
        platforms,
        scheduledFor,
        draft: !scheduledFor,
      });
      setPosts((prev) => [newPost, ...prev]);
      setError(null);
      return newPost;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create post";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (
    postId: string,
    content: string,
    platforms: string[]
  ): Promise<Post> => {
    setLoading(true);
    try {
      const updatedPost = await postService.updatePost(postId, {
        content,
        platforms,
      });
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
      setError(null);
      return updatedPost;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update post";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string): Promise<void> => {
    setLoading(true);
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete post";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const schedulePost = async (
    postId: string,
    scheduledFor: Date
  ): Promise<Post> => {
    setLoading(true);
    try {
      const scheduledPost = await postService.schedulePost(
        postId,
        scheduledFor
      );
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? scheduledPost : post))
      );
      setError(null);
      return scheduledPost;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to schedule post";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelScheduledPost = async (postId: string): Promise<Post> => {
    setLoading(true);
    try {
      const cancelledPost = await postService.cancelScheduledPost(postId);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? cancelledPost : post))
      );
      setError(null);
      return cancelledPost;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel scheduled post";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateContent = (content: string, platform: string) => {
    return postService.validatePostContent(content, platform);
  };

  // Computed properties
  const drafts = posts.filter((post) => post.status === "draft");
  const scheduledPosts = posts.filter((post) => post.status === "scheduled");

  return (
    <PostContext.Provider
      value={{
        posts,
        drafts,
        scheduledPosts,
        loading,
        error,
        fetchPosts,
        createPost,
        updatePost,
        deletePost,
        schedulePost,
        cancelScheduledPost,
        validateContent,
      }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
}
