import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface CalendarTimeSlotProps {
  id: string;
  date: Date;
  children: React.ReactNode;
}

export function CalendarTimeSlot({ id, children }: CalendarTimeSlotProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className="h-20 border-b border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
      {children}
    </div>
  );
}
