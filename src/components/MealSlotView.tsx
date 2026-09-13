/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { MealEntry, MealType } from '../types/meals';
import { Recipe } from '../types/recipes';
import { MealChip } from './MealChip';
import { MealSlotInput } from './MealSlotInput';
import { cn } from '../lib/utils';

interface MealSlotViewProps {
  type: MealType;
  dateStr: string;
  meals: MealEntry[];
  recentRecipeIds: Set<string>;
  onAdd: (dateStr: string, type: MealType, name: string) => void;
  onAddRecipe?: (recipe: Recipe, dateStr: string, type: MealType) => void;
  onOpenRecipePicker?: (dateStr: string, type: MealType) => void;
  onUpdate: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, targetDateStr?: string, targetType?: MealType) => void;
  onOpenDetail: (id: string) => void;
  onOpenMoveCopyModal?: (meal: MealEntry) => void;
}

const SLOT_PASTEL_THEMES: Record<MealType, {
  container: string;
  badge: string;
  isOver: string;
  input: string;
  addBtn: string;
}> = {
  [MealType.Breakfast]: {
    container: "border-amber-200/70 bg-amber-50/25 hover:border-amber-300 hover:bg-amber-50/40 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-700",
    badge: "bg-amber-100 text-amber-900 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
    isOver: "ring-2 ring-amber-400 bg-amber-100/40 dark:bg-amber-500/10",
    input: "border-amber-300 focus:border-amber-500 focus:ring-amber-500",
    addBtn: "text-amber-700 hover:bg-amber-100/80 dark:text-amber-400",
  },
  [MealType.Lunch]: {
    container: "border-emerald-200/70 bg-emerald-50/25 hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-700",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
    isOver: "ring-2 ring-emerald-400 bg-emerald-100/40 dark:bg-emerald-500/10",
    input: "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500",
    addBtn: "text-emerald-700 hover:bg-emerald-100/80 dark:text-emerald-400",
  },
  [MealType.Dinner]: {
    container: "border-violet-200/70 bg-violet-50/25 hover:border-violet-300 hover:bg-violet-50/40 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-700",
    badge: "bg-violet-100 text-violet-900 border-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40",
    isOver: "ring-2 ring-violet-400 bg-violet-100/40 dark:bg-violet-500/10",
    input: "border-violet-300 focus:border-violet-500 focus:ring-violet-500",
    addBtn: "text-violet-700 hover:bg-violet-100/80 dark:text-violet-400",
  },
  [MealType.Other]: {
    container: "border-rose-200/70 bg-rose-50/25 hover:border-rose-300 hover:bg-rose-50/40 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-700",
    badge: "bg-rose-100 text-rose-900 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
    isOver: "ring-2 ring-rose-400 bg-rose-100/40 dark:bg-rose-500/10",
    input: "border-rose-300 focus:border-rose-500 focus:ring-rose-500",
    addBtn: "text-rose-700 hover:bg-rose-100/80 dark:text-rose-400",
  },
};

export const MealSlotView: FC<MealSlotViewProps> = ({
  type,
  dateStr,
  meals,
  recentRecipeIds,
  onAdd,
  onAddRecipe,
  onOpenRecipePicker,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenDetail,
  onOpenMoveCopyModal,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const slotTheme = SLOT_PASTEL_THEMES[type] || SLOT_PASTEL_THEMES[MealType.Breakfast];

  const containerId = `slot|${dateStr}|${type}`;
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const itemIds = meals.map(m => m.id);

  const handleSlotClick = () => {
    if (!isAdding) {
      setIsAdding(true);
    }
  };

  const handleAddSubmit = (text: string) => {
    if (text.trim()) {
      onAdd(dateStr, type, text.trim());
    }
    setIsAdding(false);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    if (onAddRecipe) {
      onAddRecipe(recipe, dateStr, type);
    }
    setIsAdding(false);
  };

  return (
    <SortableContext id={containerId} items={itemIds} strategy={rectSortingStrategy}>
      <div 
        ref={setNodeRef}
        className={cn(
          "flex min-h-[90px] flex-col gap-2 rounded-xl border p-3 shadow-2xs transition-all cursor-text",
          slotTheme.container,
          isOver && slotTheme.isOver
        )}
        onClick={handleSlotClick}
      >
        <div className="flex items-center justify-between select-none">
          <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border", slotTheme.badge)}>
            {type === MealType.Other ? 'Snacks / Other' : type}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenRecipePicker?.(dateStr, type);
              }}
              title="Add from existing recipes"
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border shadow-2xs transition-all",
                "bg-white/90 hover:bg-white border-slate-200/90 dark:bg-slate-800/90 dark:border-slate-700 dark:hover:bg-slate-750",
                slotTheme.addBtn
              )}
              aria-label="Add from existing recipes"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] text-slate-400 font-medium opacity-0 group-hover/slot:opacity-100 transition-opacity">
              click to add
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Render existing meal chips ordered by their designated order property */}
          {[...meals]
            .sort((a, b) => a.order - b.order)
            .map((meal) => (
              <MealChip 
                key={meal.id} 
                meal={meal} 
                isRecentlyUsed={meal.recipeId ? recentRecipeIds.has(meal.recipeId) : false}
                onUpdate={onUpdate} 
                onDelete={onDelete} 
                onDuplicate={onDuplicate}
                onOpenDetail={onOpenDetail}
                onOpenMoveCopyModal={onOpenMoveCopyModal}
              />
            ))}
            
          {/* Render inline input if adding a new meal */}
          {isAdding && (
            <MealSlotInput
              placeholder={`Add ${type.toLowerCase()} or choose recipe...`}
              themeInputClass={slotTheme.input}
              onSubmitText={handleAddSubmit}
              onSelectRecipe={handleSelectRecipe}
              onOpenRecipePicker={() => {
                setIsAdding(false);
                onOpenRecipePicker?.(dateStr, type);
              }}
              onCancel={() => setIsAdding(false)}
            />
          )}
        </div>
      </div>
    </SortableContext>
  );
};

