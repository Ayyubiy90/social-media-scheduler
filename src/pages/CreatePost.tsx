import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Platform } from '../types';
import { PlatformSelector } from '../components/PlatformSelector';
import { MediaUpload } from '../components/MediaUpload';
import { DateTimePicker } from '../components/DateTimePicker';

const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(280, 'Content too long'),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  scheduledFor: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export function CreatePost() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      platforms: [],
      mediaUrls: [],
    },
  });

  const onSubmit = (data: PostFormData) => {
    // Handle post submission for Facebook
    if (data.platforms.includes('facebook')) {
      console.log('Facebook post submitted:', data);
    }
    console.log('Form submitted:', data);
  };

  const selectedPlatforms = watch('platforms');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create New Post</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Content
            </label>
            <div className="mt-1">
              <textarea
                {...register('content')}
                rows={4}
                className="shadow-sm block w-full sm:text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 pl-2"
                placeholder="What's on your mind?"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Platforms
            </label>
            <div className="mt-1">
              <PlatformSelector
                selected={selectedPlatforms as Platform[]}
                onChange={(platforms) => setValue('platforms', platforms)}
              />
              {errors.platforms && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.platforms.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Media
            </label>
            <div className="mt-1">
              <MediaUpload
                onUpload={(urls) => setValue('mediaUrls', urls)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Schedule
            </label>
            <div className="mt-1">
              <DateTimePicker
                onChange={(date) => setValue('scheduledFor', date)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              Schedule Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}