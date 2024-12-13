import React from "react";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  setHours,
} from "date-fns";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { usePost } from "../contexts/PostContext";
import { Post } from "../types/database";
import { CalendarPost } from "../components/CalendarPost";
import { CalendarTimeSlot } from "../components/CalendarTimeSlot";
import { Layout } from "../components/Layout";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = Array.from({ length: 7 }, (_, i) => i);

export function Calendar() {
  const { posts, schedulePost } = usePost();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const weekStart = startOfWeek(selectedDate);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const [dayOffset, hour] = (over.id as string).split("-").map(Number);
    const newDate = addDays(weekStart, dayOffset);
    newDate.setHours(hour, 0, 0, 0);

    const post = posts.find(p => p.id === active.id);
    if (!post) return;
    
    try {
      schedulePost(post, newDate);
    } catch (error) {
      console.error("Failed to schedule post:", error);
    }
  };

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2" />
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Content Calendar
              </h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                Today
              </button>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
          <div className="py-4 px-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
            Time
          </div>
          {DAYS.map((dayOffset) => {
            const date = addDays(weekStart, dayOffset);
            return (
              <div
                key={dayOffset}
                className="py-4 px-2 text-center bg-white dark:bg-gray-800">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {format(date, "EEE")}
                </div>
                <div
                  className={`text-lg font-medium ${
                    isSameDay(date, new Date())
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}>
                  {format(date, "d")}
                </div>
              </div>
            );
          })}
        </div>

        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <div className="grid grid-cols-8">
            <div className="bg-white dark:bg-gray-800">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-20 border-b border-r border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center py-1">
                  {format(setHours(new Date(), hour), "ha")}
                </div>
              ))}
            </div>

            {DAYS.map((dayOffset) => (
              <div
                key={dayOffset}
                className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {HOURS.map((hour) => {
                  const date = addDays(weekStart, dayOffset);
                  date.setHours(hour, 0, 0, 0);
                  const scheduledPosts = posts.filter(
                    (post) =>
                      post.scheduledFor instanceof Date &&
                      isSameDay(post.scheduledFor, date) &&
                      post.scheduledFor.getHours() === hour
                  ).map((post): Post & { mediaUrls: string[] } => ({
                    ...post,
                    mediaUrls: post.media || []
                  }));

                  return (
                    <CalendarTimeSlot
                      key={`${dayOffset}-${hour}`}
                      id={`${dayOffset}-${hour}`}
                      date={date}>
                      {scheduledPosts.map((post) => (
                        <CalendarPost key={post.id} post={post} />
                      ))}
                    </CalendarTimeSlot>
                  );
                })}
              </div>
            ))}
          </div>
        </DndContext>
      </div>
    </Layout>
  );
}
