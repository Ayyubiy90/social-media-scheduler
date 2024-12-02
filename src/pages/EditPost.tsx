import React from 'react';
import { useRoute } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePosts } from '../contexts/PostContext';
import { PlatformSelector } from '../components/PlatformSelector';
import { MediaUpload } from '../components/MediaUpload';
import { DateTimePicker } from '../components/DateTimePicker';
import { Platform } from '../types';

const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(280, 'Content too long'),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  scheduledFor: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export function EditPost() {
  const [, params] = useRoute('/edit/:id');
  const { posts, updatePost } = usePosts();
  const post = posts.find(p => p.id === params?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: post?.content || '',
      platforms: post?.platforms || [],
      scheduledFor: post?.scheduledFor || undefined,
      mediaUrls: post?.mediaUrls || [],
    },
  });

  const onSubmit = (data: PostFormData) => {
    if (post) {
      updatePost(post.id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const selectedPlatforms = watch('platforms');

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Post</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <div className="mt-1">
            <textarea
              {...register('content')}
              rows={4}
              className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="What's on your mind?"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Platforms
          </label>
          <div className="mt-1">
            <PlatformSelector
              selected={selectedPlatforms as Platform[]}
              onChange={(platforms) => setValue('platforms', platforms)}
            />
            {errors.platforms && (
              <p className="mt-1 text-sm text-red-600">{errors.platforms.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Media
          </label>
          <div className="mt-1">
            <MediaUpload
              onUpload={(urls) => setValue('mediaUrls', urls)}
              initialUrls={post.mediaUrls}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Schedule
          </label>
          <div className="mt-1">
            <DateTimePicker
              onChange={(date) => setValue('scheduledFor', date)}
              initialDate={post.scheduledFor}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Update Post
          </button>
        </div>
      </form>
    </div>
  );
}