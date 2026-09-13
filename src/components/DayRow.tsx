/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC } from 'react';
import { format } from 'date-fns';
import { DayInfo } from '../types';
import { MealEntry, MealType } from '../types/meals';
import { CalendarEvent, EventCategory } from '../types/events';
import { MealSlotView } from './MealSlotView';
import { EventDayView } from './EventDayView';
import { cn } from '../lib/utils';

interface DayRowProps {
  day: DayInfo;
  meals: MealEntry[];
  events: CalendarEvent[];
  recentRecipeIds: Set<string>;
  onAddMeal: (dateStr: string, type: MealType, name: string) => void;
  onUpdateMeal: (id: string, newName: string) => void;
  onDeleteMeal: (id: string) => void;
  onDuplicateMeal: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onAddEvent: (dateStr: string, title: string, category?: EventCategory) => void;
  onDeleteEvent: (id: string) => void;
  onDuplicateEvent: (id: string, targetDateStr?: string) => void;
  onOpenEventDetail: (id: string) => void;
}

export const DayRow: FC<DayRowProps> = ({ 
  day, meals, events, recentRecipeIds, 
  onAddMeal, onUpdateMeal, onDeleteMeal, onDuplicateMeal, onOpenDetail,
  onAddEvent, onDeleteEvent, onDuplicateEvent, onOpenEventDetail
}) => {
  const dateStr = format(day.date, 'yyyy-MM-dd');
  
  return (
    <div
      className={cn(
        "group relative grid min-h-[120px] grid-cols-1 border-b border-slate-100 sm:grid-cols-[180px_1fr] dark:border-slate-900",
        day.isToday ? "bg-indigo-500/5" : "bg-slate-50/20 dark:bg-slate-900/10"
      )}
    >
      {day.isToday && (
        <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500" />
      )}
      
      <div className="flex flex-col justify-center border-slate-100 px-6 py-4 sm:border-r dark:border-slate-900">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest sm:text-xs",
            day.isToday ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
          )}
        >
          {day.dayName}
        </span>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-3xl font-light tracking-tight tabular-nums sm:text-4xl",
              day.isToday ? "text-indigo-600 dark:text-indigo-100" : "text-slate-300 dark:text-slate-400"
            )}
          >
            {day.dayNumber}
          </span>
          {day.isToday && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
              Today
            </span>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col px-4 py-4 sm:px-8">
        <EventDayView 
          dateStr={dateStr}
          events={events}
          onAddEvent={onAddEvent}
          onDeleteEvent={onDeleteEvent}
          onDuplicateEvent={onDuplicateEvent}
          onOpenEventDetail={onOpenEventDetail}
        />
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {Object.values(MealType).map((type) => {
            const slotMeals = meals.filter((m) => m.type === type);
            return (
              <MealSlotView
                key={type}
                type={type}
                dateStr={dateStr}
                meals={slotMeals}
                onAdd={onAddMeal}
                onUpdate={onUpdateMeal}
                onDelete={onDeleteMeal}
                onDuplicate={onDuplicateMeal}
                onOpenDetail={onOpenDetail}
                recentRecipeIds={recentRecipeIds}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
