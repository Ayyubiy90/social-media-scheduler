import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useUser } from "./UserContext";
import { Post, CreatePostData } from "../types/database";
import { postService } from "../services/postService";
import { schedulingService } from "../services/schedulingService";

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
    scheduledFor?: Date,
    media?: { file: File; base64: string }
  ) => Promise<Post>;
  updatePost: (
    postId: string,
    content: string,
    platforms: string[]
  ) => Promise<Post>;
  deletePost: (postId: string) => Promise<void>;
  schedulePost: (post: Post, scheduledTime: Date) => Promise<void>;
  cancelScheduledPost: (postId: string, jobId: string) => Promise<void>;
  reschedulePost: (
    postId: string,
    jobId: string,
    newScheduledTime: Date
  ) => Promise<void>;
  validateContent: (
    content: string,
    platform: string
  ) => { valid: boolean; message?: string };
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const allPosts = await postService.getPosts();
      setPosts(allPosts || []); // Ensure posts is an array even if null/undefined is returned
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Fetch posts when user changes
  useEffect(() => {
    if (user?.uid) {
      fetchPosts();
    } else {
      setPosts([]); // Clear posts when user logs out
    }
  }, [user?.uid, fetchPosts]);

  const createPost = async (
    content: string,
    platforms: string[],
    scheduledFor?: Date,
    media?: { file: File; base64: string }
  ): Promise<Post> => {
    setLoading(true);
    try {
      const postData: CreatePostData = {
        content,
        platforms,
        scheduledFor,
        draft: !scheduledFor,
        media: media ? [media.base64] : undefined,
        mediaType: media ? (media.file.type.startsWith('image/') ? 'image' : 'video') : undefined
      };

      const newPost = await postService.createPost(postData);

      if (scheduledFor) {
        await schedulingService.schedulePost(newPost, scheduledFor);
      }

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
    post: Post,
    scheduledTime: Date
  ): Promise<void> => {
    setLoading(true);
    try {
      await schedulingService.schedulePost(post, scheduledTime);
      await schedulingService.updatePostStatus(post.id, "scheduled");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, status: "scheduled", scheduledFor: scheduledTime }
            : p
        )
      );
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to schedule post";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelScheduledPost = async (
    postId: string,
    jobId: string
  ): Promise<void> => {
    setLoading(true);
    try {
      await schedulingService.cancelScheduledPost(postId, jobId);
      await schedulingService.updatePostStatus(postId, "draft");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, status: "draft", scheduledFor: undefined }
            : p
        )
      );
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel scheduled post";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reschedulePost = async (
    postId: string,
    jobId: string,
    newScheduledTime: Date
  ): Promise<void> => {
    setLoading(true);
    try {
      await schedulingService.reschedulePost(postId, jobId, newScheduledTime);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, scheduledFor: newScheduledTime } : p
        )
      );
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reschedule post";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateContent = (content: string, platform: string) => {
    return postService.validatePostContent(content, platform);
  };

  // Computed properties - ensure posts is an array before filtering
  const drafts = Array.isArray(posts) ? posts.filter((post) => post.status === "draft") : [];
  const scheduledPosts = Array.isArray(posts) ? posts.filter((post) => post.status === "scheduled") : [];

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
        reschedulePost,
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
