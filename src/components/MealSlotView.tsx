/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, useRef, useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { MealEntry, MealType } from '../types/meals';
import { MealChip } from './MealChip';
import { cn } from '../lib/utils';

interface MealSlotViewProps {
  type: MealType;
  dateStr: string;
  meals: MealEntry[];
  recentRecipeIds: Set<string>;
  onAdd: (dateStr: string, type: MealType, name: string) => void;
  onUpdate: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onOpenDetail: (id: string) => void;
}

export const MealSlotView: FC<MealSlotViewProps> = ({
  type,
  dateStr,
  meals,
  recentRecipeIds,
  onAdd,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenDetail,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const containerId = `slot|${dateStr}|${type}`;
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const itemIds = meals.map(m => m.id);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSlotClick = () => {
    if (!isAdding) {
      setIsAdding(true);
    }
  };

  const handleAddSubmit = () => {
    if (newValue.trim()) {
      onAdd(dateStr, type, newValue);
    }
    setNewValue('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddSubmit();
    if (e.key === 'Escape') {
      setNewValue('');
      setIsAdding(false);
    }
  };

  return (
    <SortableContext id={containerId} items={itemIds} strategy={rectSortingStrategy}>
      <div 
        ref={setNodeRef}
        className={cn(
          "flex min-h-[90px] flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-indigo-300 cursor-text dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-700",
          isOver && "ring-2 ring-indigo-500 bg-indigo-50/10 dark:bg-indigo-500/10"
        )}
        onClick={handleSlotClick}
      >
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase select-none dark:text-slate-400">
          {type}
        </span>
        
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
              />
            ))}
            
          {/* Render inline input if adding a new meal */}
          {isAdding && (
            <div onClick={(e) => e.stopPropagation()} className="inline-block w-full max-w-full">
              <input
                ref={inputRef}
                type="text"
                placeholder="Add meal..."
                className="w-full rounded-md border border-indigo-400 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-indigo-500/50 dark:bg-slate-900 dark:text-slate-100"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onBlur={handleAddSubmit}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
        </div>
      </div>
    </SortableContext>
  );
};

