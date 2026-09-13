/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC } from 'react';
import { MealEntry } from '../types/meals';
import { X, Copy, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { hasRichDetails } from '../utils/mealUtils';

interface MealChipProps {
  meal: MealEntry;
  onUpdate: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onOpenDetail: (id: string) => void;
  isRecentlyUsed?: boolean;
}

export const MealChip: FC<MealChipProps> = ({ meal, onDelete, onDuplicate, onOpenDetail, isRecentlyUsed }) => {
  const hasDetails = hasRichDetails(meal);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetail(meal.id);
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={cn(
        "group flex w-fit max-w-full items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors cursor-pointer",
        "bg-indigo-100 text-indigo-900 hover:bg-indigo-200",
        "dark:bg-indigo-500/20 dark:text-indigo-200 dark:hover:bg-indigo-500/30"
      )}
    >
      <span className="truncate hover:underline underline-offset-2">
        {meal.name}
      </span>
      {isRecentlyUsed && (
        <div className="ml-0.5 text-amber-500 shrink-0" title="Rotation Warning: This recipe was used recently">
          <History className="h-3 w-3" />
        </div>
      )}
      {hasDetails && (
        <div 
          className="ml-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" 
          title="Contains details"
        />
      )}
      <div className="ml-0.5 flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(meal.id);
          }}
          className="rounded p-0.5 text-indigo-600 hover:bg-indigo-300 dark:text-indigo-400 dark:hover:bg-indigo-600/40"
          aria-label="Duplicate meal"
          title="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(meal.id);
          }}
          className="rounded p-0.5 text-slate-500 hover:bg-red-200 hover:text-red-700 dark:text-slate-400 dark:hover:bg-red-900/50 dark:hover:text-red-300"
          aria-label="Delete meal"
          title="Delete"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

