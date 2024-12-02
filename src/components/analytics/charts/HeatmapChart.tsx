import React from 'react';
import { format } from 'date-fns';

interface HeatmapData {
  hour: number;
  day: string;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
}

export function HeatmapChart({ data }: HeatmapChartProps) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColor = (value: number) => {
    if (value > 80) return 'bg-blue-800';
    if (value > 60) return 'bg-blue-600';
    if (value > 40) return 'bg-blue-400';
    if (value > 20) return 'bg-blue-200';
    return 'bg-blue-100';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[768px]">
        <div className="grid grid-cols-[auto_repeat(24,minmax(24px,1fr))]">
          {/* Header */}
          <div className="sticky left-0 bg-white" />
          {hours.map((hour) => (
            <div key={hour} className="text-xs text-gray-500 text-center">
              {format(new Date().setHours(hour), 'ha')}
            </div>
          ))}

          {/* Data grid */}
          {days.map((day) => (
            <React.Fragment key={day}>
              <div className="sticky left-0 bg-white text-xs text-gray-500 pr-2">
                {day}
              </div>
              {hours.map((hour) => {
                const cellData = data.find(
                  (d) => d.hour === hour && d.day === day
                );
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`h-6 border border-white ${
                      getColor(cellData?.value || 0)
                    }`}
                    title={`${day} ${hour}:00 - Value: ${
                      cellData?.value || 0
                    }`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}