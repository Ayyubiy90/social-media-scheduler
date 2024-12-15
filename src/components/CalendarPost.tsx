import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  GripHorizontal,
} from "lucide-react";
import { Post } from "../types/database";

interface CalendarPostProps {
  post: Post;
}

const platformIcons = {
  facebook: { icon: Facebook, color: "#1877F2", bgColor: "bg-[#1877F2]/10" },
  twitter: { icon: Twitter, color: "#1DA1F2", bgColor: "bg-[#1DA1F2]/10" },
  linkedin: { icon: Linkedin, color: "#0A66C2", bgColor: "bg-[#0A66C2]/10" },
  instagram: { icon: Instagram, color: "#E4405F", bgColor: "bg-[#E4405F]/10" },
};

export function CalendarPost({ post }: CalendarPostProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: post.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm
        border border-gray-200 dark:border-gray-600
        transition-all duration-200
        ${
          isDragging
            ? "shadow-lg scale-105 opacity-90 cursor-grabbing"
            : "hover:shadow-md cursor-grab"
        }
      `}>
      {/* Drag Handle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 text-xs text-gray-500 dark:text-gray-400">
          {new Date(post.scheduledFor || "").toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <GripHorizontal className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Content */}
      <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
        {post.content}
      </div>

      {/* Platforms */}
      <div className="flex flex-wrap gap-2">
        {post.platforms.map((platform) => {
          const {
            icon: Icon,
            color,
            bgColor,
          } = platformIcons[
            platform.toLowerCase() as keyof typeof platformIcons
          ] || {};

          if (!Icon) return null;

          return (
            <div
              key={platform}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${bgColor} transition-colors duration-200
              `}
              style={{ color }}>
              <Icon className="w-3 h-3" />
              <span>{platform}</span>
            </div>
          );
        })}
      </div>

      {/* Media Preview */}
      {post.media && post.media.length > 0 && (
        <div className="mt-2 flex gap-1">
          {post.media.slice(0, 2).map((url, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-md bg-cover bg-center bg-gray-200 dark:bg-gray-600"
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
          {post.media.length > 2 && (
            <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
              +{post.media.length - 2}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
