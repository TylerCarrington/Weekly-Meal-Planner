/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { X, Image as ImageIcon, Copy, ArrowRight, ArrowRightLeft, BookOpen } from 'lucide-react';
import { MealEntry, MealType } from '../types/meals';
import { Recipe } from '../types/recipes';
import { RecipePickerModal } from './recipes/RecipePickerModal';
import { BlurInput } from './detail/BlurInput';
import { BlurTextArea } from './detail/BlurTextArea';
import { StarRating } from './detail/StarRating';
import { IngredientsEditor } from './detail/IngredientsEditor';
import { TagsEditor } from './detail/TagsEditor';

interface MealDetailPanelProps {
  isOpen: boolean;
  meal: MealEntry | null;
  onClose: () => void;
  onUpdate: (updates: any) => void;
  onDuplicate?: (id: string, targetDateStr?: string, targetType?: MealType) => void;
  onMove?: (id: string, targetDateStr: string, targetType?: MealType) => void;
  onOpenMoveCopyModal?: (meal: MealEntry) => void;
}

export function MealDetailPanel({ 
  isOpen, 
  meal, 
  onClose, 
  onUpdate,
  onDuplicate,
  onOpenMoveCopyModal,
}: MealDetailPanelProps) {
  const [isRecipePickerOpen, setIsRecipePickerOpen] = useState(false);

  // Prevent body scrolling when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Pressing Escape closes the panel
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !meal) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-slate-50 shadow-2xl transition-transform sm:w-[480px] dark:bg-[#0f172a]">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {meal.name || 'Meal Details'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <div className="flex flex-col gap-6">
            
            {/* Quick Action Bar for Copy, Move & Link Recipe */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/40">
              <button
                type="button"
                onClick={() => {
                  const nextDate = format(addDays(parseISO(meal.date), 1), 'yyyy-MM-dd');
                  onDuplicate?.(meal.id, nextDate, meal.type);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Copy to Next Day
              </button>
              <button
                type="button"
                onClick={() => onOpenMoveCopyModal?.(meal)}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Move or Copy to...
              </button>
              <button
                type="button"
                onClick={() => setIsRecipePickerOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50 dark:border-purple-800 dark:bg-slate-800 dark:text-purple-300 dark:hover:bg-slate-700"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {meal.recipeId ? "Replace with Recipe" : "Load from Recipe"}
              </button>
            </div>

            {/* Header / Hero Section */}
            <div className="flex flex-col gap-4">
              {meal.imageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                  <img src={meal.imageUrl} alt={meal.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50">
                  <ImageIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                </div>
              )}
              <BlurInput
                label="Image URL"
                value={meal.imageUrl}
                onSave={(val) => onUpdate({ imageUrl: val })}
                type="url"
              />
            </div>

            {/* Basic Info */}
            <div className="flex flex-col gap-6">
              <BlurInput
                label="Name"
                value={meal.name}
                onSave={(val) => onUpdate({ name: val })}
              />
              <div className="grid grid-cols-2 gap-4">
                <BlurInput
                  label="Cuisine"
                  value={meal.cuisineTag}
                  onSave={(val) => onUpdate({ cuisineTag: val })}
                />
                <BlurInput
                  label="Servings"
                  type="number"
                  value={meal.servings}
                  onSave={(val) => onUpdate({ servings: val ? Number(val) : undefined })}
                />
              </div>
              <StarRating 
                rating={meal.rating} 
                onRate={(val) => onUpdate({ rating: val })} 
              />
            </div>

            {/* Timing */}
            <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <BlurInput
                label="Prep (min)"
                type="number"
                value={meal.prepTime}
                onSave={(val) => onUpdate({ prepTime: val ? Number(val) : undefined })}
                className="bg-slate-50 dark:bg-slate-900"
              />
              <BlurInput
                label="Cook (min)"
                type="number"
                value={meal.cookTime}
                onSave={(val) => onUpdate({ cookTime: val ? Number(val) : undefined })}
                className="bg-slate-50 dark:bg-slate-900"
              />
              <BlurInput
                label="Total (min)"
                type="number"
                readOnly
                value={meal.totalTime ?? ''}
                onSave={() => {}} // calculated, ignored
                className="bg-slate-100 dark:bg-slate-800 border-none font-medium"
              />
            </div>

            {/* Ingredients & Directions */}
            <IngredientsEditor 
              ingredients={meal.ingredients} 
              onSave={(val) => onUpdate({ ingredients: val })} 
            />
            
            <BlurTextArea
              label="Directions"
              value={meal.directions}
              onSave={(val) => onUpdate({ directions: val })}
              placeholder="1. Preheat the oven..."
            />

            <BlurInput
              label="Source URL"
              value={meal.sourceUrl}
              onSave={(val) => onUpdate({ sourceUrl: val })}
              type="url"
              placeholder="https://..."
            />

            {/* Metadata / Tags */}
            <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <TagsEditor
                label="Dietary Flags"
                tags={meal.dietaryFlags}
                onSave={(val) => onUpdate({ dietaryFlags: val })}
                tagColorClass="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              />
              <TagsEditor
                label="Labels"
                tags={meal.labels}
                onSave={(val) => onUpdate({ labels: val })}
                tagColorClass="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
              />
            </div>

            <BlurTextArea
              label="Notes"
              value={meal.notes}
              onSave={(val) => onUpdate({ notes: val })}
              placeholder="Add your personal notes here..."
              className="min-h-[80px]"
            />
            
            <div className="h-6" /> {/* Scroll padding bottom */}
          </div>
        </div>
      </div>

      {isRecipePickerOpen && (
        <RecipePickerModal
          isOpen={isRecipePickerOpen}
          targetDateStr={meal.date}
          targetType={meal.type}
          onClose={() => setIsRecipePickerOpen(false)}
          onSelectRecipe={(recipe) => {
            onUpdate({
              name: recipe.name,
              recipeId: recipe.id,
              imageUrl: recipe.imageUrl || '',
              ingredients: recipe.ingredients || [],
              directions: recipe.directions || '',
              notes: recipe.notes || '',
              sourceUrl: recipe.sourceUrl || '',
              prepTime: recipe.prepTime,
              cookTime: recipe.cookTime,
              servings: recipe.servings,
              cuisineTag: recipe.cuisineTag || '',
              dietaryFlags: recipe.dietaryFlags || [],
              rating: recipe.rating,
              labels: recipe.labels || [],
            });
            setIsRecipePickerOpen(false);
          }}
        />
      )}
    </>
  );
}
