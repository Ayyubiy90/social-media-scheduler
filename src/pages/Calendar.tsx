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
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 mb-8 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <CalendarIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Content Calendar
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                  className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-6 py-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200 w-full sm:w-auto">
                  Today
                </button>
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                  className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all duration-200 hover:shadow-xl">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
              <div className="py-4 px-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Time</span>
              </div>
              {DAYS.map((dayOffset) => {
                const date = addDays(weekStart, dayOffset);
                const isToday = isSameDay(date, new Date());
                return (
                  <div
                    key={dayOffset}
                    className={`py-4 px-2 text-center transition-colors duration-200 ${
                      isToday ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                    }`}>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {format(date, "EEE")}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        isToday
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-900 dark:text-white"
                      }`}>
                      {format(date, "d")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calendar Grid */}
            <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
              <div className="grid grid-cols-8">
                {/* Time Column */}
                <div className="bg-gray-50 dark:bg-gray-800/50">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-20 border-b border-r border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center">
                      {format(setHours(new Date(), hour), "ha")}
                    </div>
                  ))}
                </div>

                {/* Days Columns */}
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
        </div>
      </div>
    </div>
  );
}
