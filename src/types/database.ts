export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    socialAccounts?: {
        google?: string;
        facebook?: string;
        twitter?: string;
        linkedin?: string;
    };
    preferences?: {
        theme?: 'light' | 'dark' | 'system';
        notifications?: boolean;
        emailUpdates?: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface Post {
    id: string;
    userId: string;
    content: string;
    media?: string[];
    platforms: string[];
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    scheduledFor?: Date;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Notification {
    id: string;
    userId: string;
    postId: string;
    type: 'scheduled' | 'published' | 'failed';
    message: string;
    read: boolean;
    scheduledFor?: Date;
    createdAt: Date;
}
