/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { format, parseISO } from 'date-fns';
import { MealType } from '../../types/meals';

interface MealPreviewItem {
  id: string;
  name: string;
  date: string;
  type: MealType;
}

interface CopyWeekMealPreviewProps {
  meals: MealPreviewItem[];
}

const TYPE_COLORS: Record<MealType, string> = {
  [MealType.Breakfast]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  [MealType.Lunch]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  [MealType.Dinner]: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  [MealType.Other]: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
};

export function CopyWeekMealPreview({ meals }: CopyWeekMealPreviewProps) {
  if (meals.length === 0) return null;

  return (
    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs dark:border-slate-800 dark:bg-slate-900/50">
      <ul className="space-y-1.5">
        {meals.map((meal) => {
          let dayDisplay = meal.date;
          try {
            dayDisplay = format(parseISO(meal.date), 'EEE, MMM d');
          } catch {
            // fallback
          }

          return (
            <li
              key={meal.id}
              className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 shadow-2xs dark:bg-slate-800/80"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">
                  {dayDisplay}
                </span>
                <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                  {meal.name}
                </span>
              </div>
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TYPE_COLORS[meal.type] || 'bg-slate-100 text-slate-700'}`}>
                {meal.type}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
