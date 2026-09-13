/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, useRef, useState, useEffect } from 'react';
import { BookOpen, ChefHat } from 'lucide-react';
import { Recipe } from '../types/recipes';
import { useRecipes } from '../hooks/useRecipes';
import { cn } from '../lib/utils';

interface MealSlotInputProps {
  placeholder: string;
  themeInputClass: string;
  onSubmitText: (text: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenRecipePicker: () => void;
  onCancel: () => void;
}

export const MealSlotInput: FC<MealSlotInputProps> = ({
  placeholder,
  themeInputClass,
  onSubmitText,
  onSelectRecipe,
  onOpenRecipePicker,
  onCancel,
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { allRecipes } = useRecipes();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const matchingRecipes = React.useMemo(() => {
    if (!value.trim()) return [];
    const q = value.toLowerCase();
    return allRecipes
      .filter((r) => r.name.toLowerCase().includes(q))
      .slice(0, 4);
  }, [allRecipes, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSubmitText(value.trim());
      } else {
        onCancel();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div 
      onClick={(e) => e.stopPropagation()} 
      className="relative inline-block w-full max-w-full"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Delay closing so mousedown on dropdown can execute
          setTimeout(() => {
            if (value.trim()) {
              onSubmitText(value.trim());
            } else {
              onCancel();
            }
          }, 150);
        }}
        className={cn(
          "w-full rounded-lg border bg-white px-2.5 py-1 text-sm text-slate-900 shadow-2xs outline-none focus:ring-1 dark:border-indigo-500/50 dark:bg-slate-900 dark:text-slate-100",
          themeInputClass
        )}
      />

      {/* Autocomplete Suggestions Dropdown */}
      {matchingRecipes.length > 0 && (
        <div 
          className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-xl border border-purple-200/80 bg-white/95 p-1 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95"
          onMouseDown={(e) => e.preventDefault()} // Prevent input blur on click
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-indigo-400">
            Matching Existing Recipes
          </div>
          {matchingRecipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => onSelectRecipe(recipe)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
            >
              <div className="flex items-center gap-1.5 truncate">
                <ChefHat className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-indigo-400" />
                <span className="truncate font-semibold">{recipe.name}</span>
              </div>
              {recipe.cuisineTag && (
                <span className="shrink-0 rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  {recipe.cuisineTag}
                </span>
              )}
            </button>
          ))}
          <div className="mt-1 border-t border-purple-100/60 pt-1 dark:border-slate-800">
            <button
              type="button"
              onClick={onOpenRecipePicker}
              className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100/60 dark:text-indigo-300 dark:hover:bg-slate-800"
            >
              <BookOpen className="h-3 w-3" />
              <span>Browse all recipes...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
