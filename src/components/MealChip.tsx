/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { format, addDays, parseISO } from 'date-fns';
import { MealEntry, MealType } from '../types/meals';
import { X, Copy, History, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { hasRichDetails } from '../utils/mealUtils';

interface MealChipProps {
  meal: MealEntry;
  onUpdate: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, targetDateStr?: string, targetType?: MealType) => void;
  onOpenDetail: (id: string) => void;
  onOpenMoveCopyModal?: (meal: MealEntry) => void;
  isRecentlyUsed?: boolean;
}

const MEAL_PASTEL_THEMES: Record<MealType, {
  chip: string;
  dot: string;
  actionBtn: string;
  ring: string;
}> = {
  [MealType.Breakfast]: {
    chip: "bg-amber-100/90 text-amber-950 border border-amber-300/90 hover:bg-amber-200/90 shadow-2xs dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/30 dark:hover:bg-amber-500/30",
    dot: "bg-amber-500 dark:bg-amber-400",
    actionBtn: "text-amber-800 hover:bg-amber-200/80 dark:text-amber-300 dark:hover:bg-amber-600/40",
    ring: "ring-amber-400",
  },
  [MealType.Lunch]: {
    chip: "bg-emerald-100/90 text-emerald-950 border border-emerald-300/90 hover:bg-emerald-200/90 shadow-2xs dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/30 dark:hover:bg-emerald-500/30",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    actionBtn: "text-emerald-800 hover:bg-emerald-200/80 dark:text-emerald-300 dark:hover:bg-emerald-600/40",
    ring: "ring-emerald-400",
  },
  [MealType.Dinner]: {
    chip: "bg-violet-100/90 text-violet-950 border border-violet-300/90 hover:bg-violet-200/90 shadow-2xs dark:bg-violet-500/20 dark:text-violet-200 dark:border-violet-500/30 dark:hover:bg-violet-500/30",
    dot: "bg-violet-500 dark:bg-violet-400",
    actionBtn: "text-violet-800 hover:bg-violet-200/80 dark:text-violet-300 dark:hover:bg-violet-600/40",
    ring: "ring-violet-400",
  },
  [MealType.Other]: {
    chip: "bg-rose-100/90 text-rose-950 border border-rose-300/90 hover:bg-rose-200/90 shadow-2xs dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/30 dark:hover:bg-rose-500/30",
    dot: "bg-rose-500 dark:bg-rose-400",
    actionBtn: "text-rose-800 hover:bg-rose-200/80 dark:text-rose-300 dark:hover:bg-rose-600/40",
    ring: "ring-rose-400",
  },
};

export const MealChip: FC<MealChipProps> = ({ 
  meal, 
  onDelete, 
  onDuplicate, 
  onOpenDetail, 
  onOpenMoveCopyModal,
  isRecentlyUsed 
}) => {
  const hasDetails = hasRichDetails(meal);
  const theme = MEAL_PASTEL_THEMES[meal.type] || MEAL_PASTEL_THEMES[MealType.Breakfast];

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: meal.id,
    data: {
      type: 'Meal',
      meal,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetail(meal.id);
  };

  const handleQuickNextDayCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextDate = format(addDays(parseISO(meal.date), 1), 'yyyy-MM-dd');
    onDuplicate(meal.id, nextDate, meal.type);
  };

  const handleOpenMoveCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenMoveCopyModal?.(meal);
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleContainerClick}
      className={cn(
        "group flex w-fit max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold transition-all cursor-grab active:cursor-grabbing select-none",
        theme.chip,
        isDragging && cn("opacity-40 ring-2 scale-105 z-30 shadow-lg", theme.ring)
      )}
    >
      <span className="truncate hover:underline underline-offset-2 font-medium">
        {meal.name}
      </span>
      {isRecentlyUsed && (
        <div className="ml-0.5 text-amber-600 shrink-0" title="Rotation Warning: This recipe was used recently">
          <History className="h-3 w-3" />
        </div>
      )}
      {hasDetails && (
        <div 
          className={cn("ml-0.5 h-1.5 w-1.5 shrink-0 rounded-full", theme.dot)} 
          title="Contains details"
        />
      )}
      <div className="ml-0.5 flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleQuickNextDayCopy}
          className={cn("rounded p-0.5 transition-colors", theme.actionBtn)}
          aria-label="Copy to next day"
          title="Quick: Copy to next day"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleOpenMoveCopy}
          className={cn("rounded p-0.5 transition-colors", theme.actionBtn)}
          aria-label="Move or copy meal"
          title="Move or copy to another day..."
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(meal.id);
          }}
          className="rounded p-0.5 text-slate-500 hover:bg-rose-200 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-red-900/50 dark:hover:text-red-300"
          aria-label="Delete meal"
          title="Delete"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};


