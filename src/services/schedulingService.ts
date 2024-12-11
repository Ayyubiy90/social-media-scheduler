import axios from 'axios';
import { Post } from '../types/database';

const API_URL = import.meta.env.VITE_API_URL;

interface ScheduleResponse {
    jobId: string;
    message: string;
}

interface CancelPostData {
    postId: string;
}

export const schedulingService = {
    // Schedule a new post
    async schedulePost(post: Post, scheduledTime: Date): Promise<ScheduleResponse> {
        const token = localStorage.getItem('token');
        const response = await axios.post<ScheduleResponse>(
            `${API_URL}/schedule`,
            {
                postId: post.id,
                platforms: post.platforms,
                scheduledTime: scheduledTime.getTime()
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    // Cancel a scheduled post
    async cancelScheduledPost(postId: string, jobId: string): Promise<void> {
        const token = localStorage.getItem('token');
        const cancelData: CancelPostData = { postId };
        await axios.delete(`${API_URL}/cancel/${jobId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: cancelData
        });
    },

    // Reschedule a post
    async reschedulePost(postId: string, jobId: string, newScheduledTime: Date): Promise<ScheduleResponse> {
        const token = localStorage.getItem('token');
        const response = await axios.post<ScheduleResponse>(
            `${API_URL}/reschedule/${jobId}`,
            {
                postId,
                scheduledTime: newScheduledTime.getTime()
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    // Get scheduled posts
    async getScheduledPosts(): Promise<Post[]> {
        const token = localStorage.getItem('token');
        const response = await axios.get<Post[]>(`${API_URL}/posts`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                status: 'scheduled'
            }
        });
        return response.data;
    },

    // Update post status
    async updatePostStatus(postId: string, status: Post['status']): Promise<void> {
        const token = localStorage.getItem('token');
        await axios.put(
            `${API_URL}/posts/${postId}`,
            { status },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    }
};
