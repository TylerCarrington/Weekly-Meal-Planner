/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC } from 'react';
import { ChefHat, Plus, Clock, Star, History } from 'lucide-react';
import { Recipe } from '../../types/recipes';
import { cn } from '../../lib/utils';

interface RecipePickerItemProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

export const RecipePickerItem: FC<RecipePickerItemProps> = ({ recipe, onSelect }) => {
  return (
    <div 
      className="group flex items-center justify-between rounded-xl border border-purple-100/90 bg-white p-3 shadow-2xs transition-all hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-indigo-700 dark:hover:bg-slate-800 cursor-pointer"
      onClick={() => onSelect(recipe)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-purple-50 text-purple-400 dark:bg-slate-700 dark:text-slate-400">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.name} className="h-full w-full object-cover" />
          ) : (
            <ChefHat className="h-6 w-6 opacity-60" />
          )}
        </div>

        <div className="min-w-0">
          <h4 className="truncate font-bold text-sm text-slate-900 group-hover:text-violet-900 dark:text-slate-100 dark:group-hover:text-indigo-300">
            {recipe.name}
          </h4>
          
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            {recipe.cuisineTag && (
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                {recipe.cuisineTag}
              </span>
            )}
            {recipe.rating && (
              <span className="flex items-center gap-0.5 font-semibold text-amber-600 dark:text-amber-400">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {recipe.rating}
              </span>
            )}
            {recipe.totalTime && recipe.totalTime > 0 && (
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3 text-slate-400" />
                {recipe.totalTime}m
              </span>
            )}
            {(recipe.timesUsed || 0) > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-purple-700 dark:text-purple-300">
                <History className="h-3 w-3" />
                {recipe.timesUsed}x
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(recipe);
        }}
        className="shrink-0 flex items-center gap-1 rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-800 border border-violet-200/70 transition-all hover:bg-violet-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-600 dark:hover:text-white"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add</span>
      </button>
    </div>
  );
};
