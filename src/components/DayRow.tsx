/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC } from 'react';
import { format } from 'date-fns';
import { DayInfo } from '../types';
import { MealEntry, MealType } from '../types/meals';
import { Recipe } from '../types/recipes';
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
  onAddRecipe?: (recipe: Recipe, dateStr: string, type: MealType) => void;
  onOpenRecipePicker?: (dateStr: string, type: MealType) => void;
  onUpdateMeal: (id: string, newName: string) => void;
  onDeleteMeal: (id: string) => void;
  onDuplicateMeal: (id: string, targetDateStr?: string, targetType?: MealType) => void;
  onOpenDetail: (id: string) => void;
  onOpenMoveCopyModal?: (meal: MealEntry) => void;
  onAddEvent: (dateStr: string, title: string, category?: EventCategory) => void;
  onDeleteEvent: (id: string) => void;
  onDuplicateEvent: (id: string, targetDateStr?: string) => void;
  onOpenEventDetail: (id: string) => void;
}

export const DayRow: FC<DayRowProps> = ({ 
  day, meals, events, recentRecipeIds, 
  onAddMeal, onAddRecipe, onOpenRecipePicker, onUpdateMeal, onDeleteMeal, onDuplicateMeal, onOpenDetail, onOpenMoveCopyModal,
  onAddEvent, onDeleteEvent, onDuplicateEvent, onOpenEventDetail
}) => {
  const dateStr = format(day.date, 'yyyy-MM-dd');
  
  return (
    <div
      className={cn(
        "group relative grid min-h-[120px] grid-cols-1 border-b border-purple-100/60 sm:grid-cols-[180px_1fr] dark:border-slate-900 transition-colors",
        day.isToday ? "bg-linear-to-r from-violet-100/50 via-pink-50/30 to-white/40 dark:bg-indigo-500/10" : "bg-white/50 hover:bg-purple-50/20 dark:bg-slate-900/10"
      )}
    >
      {day.isToday && (
        <div className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-violet-500 via-pink-400 to-amber-300 rounded-r-full" />
      )}
      
      <div className="flex flex-col justify-center border-purple-100/60 px-6 py-4 sm:border-r dark:border-slate-900">
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-wider sm:text-xs",
            day.isToday ? "text-violet-700 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
          )}
        >
          {day.dayName}
        </span>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-3xl font-bold tracking-tight tabular-nums sm:text-4xl",
              day.isToday ? "text-violet-950 dark:text-indigo-100" : "text-slate-800 dark:text-slate-300"
            )}
          >
            {day.dayNumber}
          </span>
          {day.isToday && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-800 border border-violet-200/80 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800">
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
                onAddRecipe={onAddRecipe}
                onOpenRecipePicker={onOpenRecipePicker}
                onUpdate={onUpdateMeal}
                onDelete={onDeleteMeal}
                onDuplicate={onDuplicateMeal}
                onOpenDetail={onOpenDetail}
                onOpenMoveCopyModal={onOpenMoveCopyModal}
                recentRecipeIds={recentRecipeIds}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
