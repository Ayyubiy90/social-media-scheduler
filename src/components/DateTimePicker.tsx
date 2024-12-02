import React from 'react';
import { format } from 'date-fns';

interface DateTimePickerProps {
  onChange: (date: string) => void;
  initialDate?: string | null;
}

export function DateTimePicker({ onChange, initialDate }: DateTimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    onChange(date.toISOString());
  };

  const now = new Date();
  const minDateTime = format(now, "yyyy-MM-dd'T'HH:mm");
  const defaultValue = initialDate ? format(new Date(initialDate), "yyyy-MM-dd'T'HH:mm") : '';

  return (
    <input
      type="datetime-local"
      min={minDateTime}
      defaultValue={defaultValue}
      onChange={handleChange}
      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 sm:text-sm"
      placeholder="MM/DD/YYYY --:-- --"
    />
  );
}