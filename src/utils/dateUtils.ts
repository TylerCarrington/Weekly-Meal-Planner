/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { DayInfo } from '../types';

/**
 * Returns an array of 7 DayInfo objects for the week containing the given date.
 * Weeks start on Monday.
 */
export function getDaysInWeek(date: Date): DayInfo[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const today = new Date();

  return Array.from({ length: 7 }).map((_, i) => {
    const dayDate = addDays(start, i);
    return {
      date: dayDate,
      isToday: isSameDay(dayDate, today),
      dayName: format(dayDate, 'EEEE'),
      dayNumber: dayDate.getDate(),
      monthName: format(dayDate, 'MMMM'),
      year: dayDate.getFullYear(),
    };
  });
}

/**
 * Returns a formatted date range for the week (e.g., "Oct 24 – Oct 30, 2026")
 */
export function getWeekRangeHeader(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = addDays(start, 6);

  if (start.getFullYear() !== end.getFullYear()) {
    return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
  }
  
  if (start.getMonth() !== end.getMonth()) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }

  return `${format(start, 'MMMM d')} – ${format(end, 'd, yyyy')}`;
}

/**
 * Generates a consistent week key (YYYY-MM-DD of Monday) for data storage.
 */
export function getWeekKey(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  // If the parsed date is invalid, fallback to today to prevent format sequence errors
  const safeDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const start = startOfWeek(safeDate, { weekStartsOn: 1 });
  return format(start, 'yyyy-MM-dd');
}
