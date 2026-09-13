/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, useState, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { X, Search, BookOpen, ChefHat, Filter } from 'lucide-react';
import { Recipe } from '../../types/recipes';
import { MealType } from '../../types/meals';
import { useRecipes } from '../../hooks/useRecipes';
import { RecipePickerItem } from './RecipePickerItem';
import { cn } from '../../lib/utils';

interface RecipePickerModalProps {
  isOpen: boolean;
  targetDateStr: string;
  targetType: MealType;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe, targetDateStr: string, targetType: MealType) => void;
  onChangeTargetType?: (type: MealType) => void;
}

export const RecipePickerModal: FC<RecipePickerModalProps> = ({
  isOpen,
  targetDateStr,
  targetType,
  onClose,
  onSelectRecipe,
  onChangeTargetType,
}) => {
  const { allRecipes } = useRecipes();
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [currentSlot, setCurrentSlot] = useState<MealType>(targetType);

  useEffect(() => {
    setCurrentSlot(targetType);
  }, [targetType]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedCuisine('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const uniqueCuisines = useMemo(() => {
    const set = new Set<string>();
    allRecipes.forEach((r) => {
      if (r.cuisineTag) set.add(r.cuisineTag);
    });
    return Array.from(set);
  }, [allRecipes]);

  const filteredRecipes = useMemo(() => {
    return allRecipes.filter((r) => {
      const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
      const matchesCuisine = !selectedCuisine || r.cuisineTag === selectedCuisine;
      return matchesSearch && matchesCuisine;
    });
  }, [allRecipes, search, selectedCuisine]);

  if (!isOpen) return null;

  const formattedDate = targetDateStr
    ? format(parseISO(targetDateStr), 'EEEE, MMM d')
    : '';

  const handleSelect = (recipe: Recipe) => {
    onSelectRecipe(recipe, targetDateStr, currentSlot);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-purple-100/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100/70 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-indigo-950 dark:text-indigo-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Add from Existing Recipes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target: <span className="font-semibold text-slate-700 dark:text-slate-300">{formattedDate}</span> &bull; <span className="capitalize">{currentSlot}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-purple-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Slot selector pill switch */}
        <div className="flex items-center gap-2 border-b border-purple-100/50 bg-purple-50/30 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Meal Slot:</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(MealType).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setCurrentSlot(t);
                  onChangeTargetType?.(t);
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all",
                  currentSlot === t
                    ? "bg-violet-600 text-white shadow-2xs dark:bg-indigo-600"
                    : "bg-white text-slate-600 hover:bg-purple-100/60 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Cuisines filter */}
        <div className="p-5 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Search existing recipes by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-purple-200/80 bg-purple-50/25 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-2xs outline-none focus:border-violet-500 focus:bg-white focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {uniqueCuisines.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCuisine('')}
                className={cn(
                  "rounded-full px-3 py-1 font-semibold transition-all whitespace-nowrap",
                  !selectedCuisine
                    ? "bg-violet-100 text-violet-900 border border-violet-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                All Cuisines
              </button>
              {uniqueCuisines.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCuisine(c === selectedCuisine ? '' : c)}
                  className={cn(
                    "rounded-full px-3 py-1 font-semibold transition-all whitespace-nowrap",
                    selectedCuisine === c
                      ? "bg-violet-100 text-violet-900 border border-violet-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recipes List */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2.5 custom-scrollbar">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipePickerItem 
                key={recipe.id} 
                recipe={recipe} 
                onSelect={handleSelect} 
              />
            ))
          ) : allRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500">
              <ChefHat className="h-12 w-12 text-purple-300 opacity-60 mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Your Recipe Library is empty</p>
              <p className="mt-1 text-xs max-w-xs text-slate-500">
                Add recipes in the Recipes tab, or you can create one right away to reuse anytime!
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500">
              <p className="text-sm font-semibold">No recipes matching "{search}"</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedCuisine(''); }}
                className="mt-2 text-xs font-bold text-violet-600 hover:underline"
              >
                Clear search filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
