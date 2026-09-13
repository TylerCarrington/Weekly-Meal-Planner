import React, { FC } from 'react';
import { ChefHat, History, Copy, X, Plus } from 'lucide-react';
import { Recipe } from '../../types/recipes';
import { cn } from '../../lib/utils';
import { hasRichDetails } from '../../utils/mealUtils';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAddToWeek: (recipe: Recipe) => void;
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipe, onEdit, onDuplicate, onDelete, onAddToWeek }) => {
  const hasDetails = hasRichDetails(recipe as any);

  return (
    <div 
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
      onClick={() => onEdit(recipe)}
    >
      <div className="relative">
        {recipe.imageUrl ? (
          <div className="h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img src={recipe.imageUrl} alt={recipe.name} className="h-full w-full object-cover" loading="lazy" />
          </div>
        ) : (
          <div className="flex h-32 w-full items-center justify-center bg-slate-50 text-slate-300 dark:bg-slate-800/50 dark:text-slate-700">
            <ChefHat className="h-10 w-10 opacity-50" />
          </div>
        )}
        
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(recipe.id); }}
            className="rounded bg-white/90 p-1.5 text-slate-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400"
            title="Duplicate Recipe"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(recipe.id); }}
            className="rounded bg-white/90 p-1.5 text-slate-600 shadow-sm hover:bg-red-50 hover:text-red-600 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-red-900/40 dark:hover:text-red-400"
            title="Delete Recipe"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-2 dark:text-slate-100">
            {recipe.name}
          </h3>
          {hasDetails && (
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" title="Contains rich details" />
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-1">
          {recipe.cuisineTag && (
            <span className="inline-block rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">
              {recipe.cuisineTag}
            </span>
          )}
          {recipe.rating && (
            <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              {recipe.rating} ★
            </span>
          )}
          {(recipe.timesUsed || 0) > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400" title="Times Used">
              <History className="h-3 w-3" /> {recipe.timesUsed}
            </span>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onAddToWeek(recipe); }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
        >
          <Plus className="h-4 w-4" /> Add to Week
        </button>
      </div>
    </div>
  );
}
