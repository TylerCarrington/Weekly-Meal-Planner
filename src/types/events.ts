/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EventCategory = 'Appointment' | 'Sports' | 'Special Event' | 'Custom';

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  category: EventCategory;
  colorLabel?: string;
  createdAt: number;
}

export interface WeeklyEventPlan {
  weekKey: string;
  entries: CalendarEvent[];
}