import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useUser } from './UserContext';
import * as db from '../services/databaseService';
import { Post, Notification, UserProfile } from '../types/database';

interface DatabaseContextType {
    posts: Post[];
    notifications: Notification[];
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    fetchPosts: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    fetchUserProfile: () => Promise<void>;
    createNewPost: (post: Omit<Post, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updatePost: (postId: string, data: Partial<Post>) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    markNotificationAsRead: (notificationId: string) => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const fetchedPosts = await db.getPostsByUser(user.uid);
            setPosts(fetchedPosts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    const fetchNotifications = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const fetchedNotifications = await db.getNotificationsByUser(user.uid);
            setNotifications(fetchedNotifications);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    const fetchUserProfile = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const profile = await db.getUser(user.uid);
            setUserProfile(profile);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    const createNewPost = async (postData: Omit<Post, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const newPost: Post = {
                ...postData,
                id: db.generateId(),
                userId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await db.createPost(newPost);
            setPosts(prev => [newPost, ...prev]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create post');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePost = async (postId: string, data: Partial<Post>) => {
        setLoading(true);
        try {
            await db.updatePost(postId, data);
            setPosts(prev => prev.map(post => 
                post.id === postId ? { ...post, ...data, updatedAt: new Date() } : post
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update post');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (postId: string) => {
        setLoading(true);
        try {
            await db.deletePost(postId);
            setPosts(prev => prev.filter(post => post.id !== postId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete post');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            await db.markNotificationAsRead(notificationId);
            setNotifications(prev => prev.map(notification =>
                notification.id === notificationId ? { ...notification, read: true } : notification
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
            throw err;
        }
    };

    const updateUserProfile = async (data: Partial<UserProfile>) => {
        if (!user?.uid || !userProfile) return;
        setLoading(true);
        try {
            await db.updateUser(user.uid, data);
            setUserProfile(prev => prev ? { ...prev, ...data } : null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <DatabaseContext.Provider
            value={{
                posts,
                notifications,
                userProfile,
                loading,
                error,
                fetchPosts,
                fetchNotifications,
                fetchUserProfile,
                createNewPost,
                updatePost,
                deletePost,
                markNotificationAsRead,
                updateUserProfile
            }}
        >
            {children}
        </DatabaseContext.Provider>
    );
}

export function useDatabase() {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
}
