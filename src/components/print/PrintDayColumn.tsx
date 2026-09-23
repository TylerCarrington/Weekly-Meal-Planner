/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { format } from 'date-fns';
import { DayInfo } from '../../types';
import { MealEntry, MealType } from '../../types/meals';
import { CalendarEvent } from '../../types/events';

interface PrintDayColumnProps {
  key?: React.Key;
  day: DayInfo;
  meals: MealEntry[];
  events: CalendarEvent[];
  includeEvents: boolean;
  includeBlankSlots: boolean;
}

const SLOTS: MealType[] = [
  MealType.Breakfast,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Other,
];

export function PrintDayColumn({
  day,
  meals,
  events,
  includeEvents,
  includeBlankSlots,
}: PrintDayColumnProps) {
  const dateStr = format(day.date, 'yyyy-MM-dd');
  const dayMeals = meals.filter((m) => m.date === dateStr);
  const dayEvents = events.filter((e) => e.date === dateStr);

  return (
    <div className="flex flex-col flex-1 border-r border-black last:border-r-0 h-full overflow-hidden bg-white text-black">
      {/* Day Header */}
      <div className="border-b-2 border-black bg-neutral-100 py-1 px-1.5 text-center">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-black">
          {day.dayName.slice(0, 3)}
        </div>
        <div className="text-[10px] font-semibold text-neutral-800">
          {format(day.date, 'MMM d')}
        </div>
      </div>

      {/* Meal Slots */}
      <div className="flex-1 flex flex-col divide-y divide-neutral-300 overflow-hidden text-[9px] leading-tight">
        {SLOTS.map((slot) => {
          const slotMeals = dayMeals.filter((m) => m.type === slot);
          const hasMeals = slotMeals.length > 0;

          if (slot === MealType.Other && !hasMeals && !includeBlankSlots) {
            return null;
          }

          return (
            <div key={slot} className="flex-1 p-1 flex flex-col min-h-0">
              <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-600 block mb-0.5">
                {slot}
              </span>
              <div className="space-y-0.5 overflow-hidden">
                {slotMeals.map((meal) => (
                  <div key={meal.id} className="font-medium text-black truncate flex items-start gap-1">
                    <span className="text-[8px] leading-none text-neutral-500">•</span>
                    <span className="truncate">{meal.name}</span>
                  </div>
                ))}
                {!hasMeals && includeBlankSlots && (
                  <div className="border-b border-dotted border-neutral-300 mt-2 h-0 w-full" />
                )}
              </div>
            </div>
          );
        })}

        {/* Events Section */}
        {includeEvents && (dayEvents.length > 0 || includeBlankSlots) && (
          <div className="p-1 min-h-[30px] bg-neutral-50/50">
            <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-600 block mb-0.5">
              Events
            </span>
            <div className="space-y-0.5">
              {dayEvents.map((evt) => (
                <div key={evt.id} className="text-neutral-800 text-[8px] truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full border border-black shrink-0 inline-block" />
                  <span className="truncate font-semibold">
                    {evt.startTime ? `${evt.startTime} ` : ''}
                    {evt.title}
                  </span>
                </div>
              ))}
              {dayEvents.length === 0 && includeBlankSlots && (
                <div className="border-b border-dotted border-neutral-300 mt-2 h-0 w-full" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
