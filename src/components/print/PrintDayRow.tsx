/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { format } from 'date-fns';
import { DayInfo } from '../../types';
import { MealEntry, MealType } from '../../types/meals';
import { CalendarEvent } from '../../types/events';

interface PrintDayRowProps {
  key?: React.Key;
  day: DayInfo;
  meals: MealEntry[];
  events: CalendarEvent[];
  includeEvents: boolean;
  includeBlankSlots: boolean;
}

const PRIMARY_SLOTS: MealType[] = [
  MealType.Breakfast,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Other,
];

export function PrintDayRow({
  day,
  meals,
  events,
  includeEvents,
  includeBlankSlots,
}: PrintDayRowProps) {
  const dateStr = format(day.date, 'yyyy-MM-dd');
  const dayMeals = meals.filter((m) => m.date === dateStr);
  const dayEvents = events.filter((e) => e.date === dateStr);

  return (
    <div className="flex border-b border-black last:border-b-0 flex-1 min-h-0 bg-white text-black text-[9px] leading-tight">
      {/* Day label */}
      <div className="w-20 border-r border-black bg-neutral-100 p-1.5 flex flex-col justify-center text-center shrink-0">
        <span className="font-extrabold uppercase text-[10px] tracking-wider text-black">
          {day.dayName.slice(0, 3)}
        </span>
        <span className="text-[9px] font-semibold text-neutral-800">
          {format(day.date, 'MMM d')}
        </span>
      </div>

      {/* Meals Grid */}
      <div className="flex-1 grid grid-cols-4 divide-x divide-neutral-200 p-1">
        {PRIMARY_SLOTS.map((slot) => {
          const slotMeals = dayMeals.filter((m) => m.type === slot);
          return (
            <div key={slot} className="px-1.5 flex flex-col min-h-0">
              <span className="text-[7.5px] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">
                {slot}
              </span>
              <div className="space-y-0.5 overflow-hidden">
                {slotMeals.map((m) => (
                  <div key={m.id} className="font-medium text-black truncate">
                    • {m.name}
                  </div>
                ))}
                {slotMeals.length === 0 && includeBlankSlots && (
                  <div className="border-b border-dotted border-neutral-300 mt-2 h-0 w-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Events Column if included */}
      {includeEvents && (
        <div className="w-28 border-l border-black p-1 bg-neutral-50/50 flex flex-col shrink-0">
          <span className="text-[7.5px] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">
            Events
          </span>
          <div className="space-y-0.5 overflow-hidden">
            {dayEvents.map((evt) => (
              <div key={evt.id} className="text-[8px] truncate font-medium">
                • {evt.startTime ? `${evt.startTime} ` : ''}{evt.title}
              </div>
            ))}
            {dayEvents.length === 0 && includeBlankSlots && (
              <div className="border-b border-dotted border-neutral-300 mt-2 h-0 w-full" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
