import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { isSameDay } from "date-fns";

interface CalendarTimeSlotProps {
  id: string;
  date: Date;
  children: React.ReactNode;
}

export function CalendarTimeSlot({
  id,
  date,
  children,
}: CalendarTimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const isToday = isSameDay(date, new Date());
  const currentHour = new Date().getHours();
  const isCurrentHour = isToday && date.getHours() === currentHour;

  return (
    <div
      ref={setNodeRef}
      className={`
        h-20 border-b border-gray-200 dark:border-gray-700 p-2
        transition-all duration-200
        ${
          isOver
            ? "bg-indigo-50 dark:bg-indigo-900/20"
            : "bg-white dark:bg-gray-800"
        }
        ${isToday ? "bg-opacity-60 dark:bg-opacity-60" : ""}
        ${isCurrentHour ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}
        hover:bg-gray-50 dark:hover:bg-gray-700
        group
      `}>
      <div
        className={`
          h-full w-full rounded-lg
          transition-all duration-200
          ${
            isOver
              ? "border-2 border-dashed border-indigo-400 dark:border-indigo-500"
              : ""
          }
          ${isCurrentHour ? "ring-2 ring-yellow-400 dark:ring-yellow-500" : ""}
        `}>
        {children}
      </div>
    </div>
  );
}
