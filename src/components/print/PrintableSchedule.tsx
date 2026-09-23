/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { format } from 'date-fns';
import { DayInfo } from '../../types';
import { MealEntry } from '../../types/meals';
import { CalendarEvent } from '../../types/events';
import { PrintOptions } from '../../types/print';
import { PrintDayColumn } from './PrintDayColumn';
import { PrintDayRow } from './PrintDayRow';

interface PrintableScheduleProps {
  days: DayInfo[];
  meals: MealEntry[];
  events: CalendarEvent[];
  weekRange: string;
  plannerName?: string;
  options: PrintOptions;
}

export function PrintableSchedule({
  days,
  meals,
  events,
  weekRange,
  plannerName,
  options,
}: PrintableScheduleProps) {
  const currentDateFormatted = format(new Date(), 'MMM d, yyyy');
  const isLandscape = options.orientation === 'landscape';

  return (
    <div
      id="printable-week-schedule"
      className="bg-white text-black font-sans box-border w-full flex flex-col justify-between"
      style={{
        width: '100%',
        height: isLandscape ? '100vh' : '100vh',
        maxHeight: isLandscape ? '100vh' : '100vh',
        padding: '0',
        margin: '0',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        pageBreakAfter: 'avoid',
        breakAfter: 'avoid',
      }}
    >
      {/* Printable Sheet Top Header */}
      <div className="border-b-2 border-black pb-1.5 mb-1.5 flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-sm font-black tracking-tight uppercase text-black">
            {plannerName ? `${plannerName} — ` : ''}Weekly Meal & Activity Plan
          </h1>
          <p className="text-[10px] font-semibold text-neutral-800">
            {weekRange}
          </p>
        </div>
        <div className="text-right text-[8px] text-neutral-600 font-medium">
          <div>Printed on {currentDateFormatted}</div>
          <div>Black & White Single-Page Edition</div>
        </div>
      </div>

      {/* Main Schedule Grid: 7 days */}
      <div className="flex-1 border-2 border-black flex flex-col overflow-hidden min-h-0">
        {isLandscape ? (
          <div className="flex h-full w-full divide-x divide-black overflow-hidden">
            {days.map((day) => (
              <PrintDayColumn
                key={day.date.toISOString()}
                day={day}
                meals={meals}
                events={events}
                includeEvents={options.includeEvents}
                includeBlankSlots={options.includeBlankSlots}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full w-full divide-y divide-black overflow-hidden">
            {days.map((day) => (
              <PrintDayRow
                key={day.date.toISOString()}
                day={day}
                meals={meals}
                events={events}
                includeEvents={options.includeEvents}
                includeBlankSlots={options.includeBlankSlots}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sheet Bottom Footer / Notes & Grocery Reminder */}
      <div className="pt-1.5 mt-1 flex items-center justify-between text-[8px] text-neutral-600 border-t border-neutral-300 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold uppercase tracking-wider text-black">Weekly Focus / Notes:</span>
          <span className="inline-block border-b border-dotted border-neutral-400 w-64 h-2" />
        </div>
        <div className="flex items-center gap-2">
          <span>Water: [ ] [ ] [ ] [ ] [ ] [ ] [ ]</span>
          <span>•</span>
          <span>Groceries Synced: [ ]</span>
        </div>
      </div>
    </div>
  );
}
