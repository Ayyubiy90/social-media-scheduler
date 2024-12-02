import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Post } from '../types';

interface CalendarPostProps {
  post: Post;
}

export function CalendarPost({ post }: CalendarPostProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: post.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md text-sm mb-1 cursor-move"
    >
      <div className="font-medium text-blue-900 dark:text-blue-100 truncate">{post.content}</div>
      <div className="flex mt-1 space-x-1">
        {post.platforms.map((platform) => (
          <span
            key={platform}
            className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs"
          >
            {platform}
          </span>
        ))}
      </div>
    </div>
  );
}