/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DayInfo {
  date: Date;
  isToday: boolean;
  dayName: string;
  dayNumber: number;
  monthName: string;
  year: number;
}

export type Theme = 'light' | 'dark';
