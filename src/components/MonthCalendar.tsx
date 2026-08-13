'use client';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { useState } from 'react';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface MonthCalendarProps {
  selectedDates: Set<string>;
  onSelectDate: (isoDate: string) => void;
  accent?: 'primary' | 'golf';
}

const accentClasses = {
  primary: 'bg-primary text-on-primary',
  golf: 'bg-golf text-on-golf',
};

export function MonthCalendar({ selectedDates, onSelectDate, accent = 'primary' }: MonthCalendarProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const today = startOfDay(new Date());

  const days = eachDayOfInterval({ start: startOfMonth(cursor), end: endOfMonth(cursor) });
  const leadingBlanks = getDay(startOfMonth(cursor));

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor((c) => subMonths(c, 1))}
          className="rounded-md px-2 py-1 text-text-secondary hover:bg-background"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-text-primary">{format(cursor, 'MMMM yyyy')}</span>
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="rounded-md px-2 py-1 text-text-secondary hover:bg-background"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="py-1 text-xs text-text-muted">
            {label}
          </div>
        ))}

        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd');
          const isPast = isBefore(day, today);
          const isSelected = selectedDates.has(iso);

          return (
            <button
              key={iso}
              type="button"
              disabled={isPast}
              onClick={() => onSelectDate(iso)}
              className={`aspect-square rounded-md text-sm transition disabled:cursor-not-allowed disabled:text-text-muted disabled:opacity-40 ${
                isSelected ? accentClasses[accent] : 'text-text-primary hover:bg-background'
              }`}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
