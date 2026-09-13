/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Copy } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { DayInfo } from '../types';
import { MealEntry, MealType } from '../types/meals';
import { Recipe } from '../types/recipes';
import { CalendarEvent, EventCategory } from '../types/events';
import { DayRow } from './DayRow';
import { MealChip } from './MealChip';
import { EventChip } from './EventChip';
import { MoveCopyMealModal } from './MoveCopyMealModal';
import { RecipePickerModal } from './recipes/RecipePickerModal';

interface WeeklyGridProps {
  days: DayInfo[];
  entries: MealEntry[];
  events: CalendarEvent[];
  recentRecipeIds: Set<string>;
  onAddMeal: (dateStr: string, type: MealType, name: string) => void;
  onAddMealFromRecipe?: (recipe: Recipe, dateStr: string, type: MealType) => void;
  onUpdateMeal: (id: string, newName: string) => void;
  onDeleteMeal: (id: string) => void;
  onDuplicateMeal: (id: string, targetDateStr?: string, targetType?: MealType) => void;
  onOpenDetail: (id: string) => void;
  onOpenMoveCopyModal?: (meal: MealEntry) => void;
  onMoveMeal: (activeId: string, overId: string) => void;
  onMoveMealToDate?: (id: string, targetDateStr: string, targetType?: MealType) => void;
  
  onAddEvent: (dateStr: string, title: string, category?: EventCategory) => void;
  onDeleteEvent: (id: string) => void;
  onDuplicateEvent: (id: string, targetDateStr?: string) => void;
  onOpenEventDetail: (id: string) => void;
  onMoveEvent: (activeId: string, overId: string) => void;
  onCopyPreviousWeek?: () => void;
}

export function WeeklyGrid({ 
  days, 
  entries, 
  events,
  recentRecipeIds,
  onAddMeal, 
  onAddMealFromRecipe,
  onUpdateMeal, 
  onDeleteMeal, 
  onDuplicateMeal,
  onOpenDetail,
  onOpenMoveCopyModal,
  onMoveMeal,
  onMoveMealToDate,
  onAddEvent,
  onDeleteEvent,
  onDuplicateEvent,
  onOpenEventDetail,
  onMoveEvent,
  onCopyPreviousWeek,
}: WeeklyGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [internalMoveCopyMeal, setInternalMoveCopyMeal] = useState<MealEntry | null>(null);
  const [recipePickerTarget, setRecipePickerTarget] = useState<{ dateStr: string; type: MealType } | null>(null);

  const handleOpenMoveCopy = (meal: MealEntry) => {
    if (onOpenMoveCopyModal) {
      onOpenMoveCopyModal(meal);
    } else {
      setInternalMoveCopyMeal(meal);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeStr = String(active.id);
      if (activeStr.startsWith('event_')) {
        onMoveEvent(activeStr, String(over.id));
      } else {
        onMoveMeal(activeStr, String(over.id));
      }
    }
  };

  const activeMeal = activeId ? entries.find(m => m.id === activeId) : null;
  const activeEvent = activeId?.startsWith('event_') ? events.find(e => `event_${e.id}` === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mx-auto w-full max-w-7xl lg:px-8">
        <div className="overflow-hidden bg-white/95 shadow-xl shadow-purple-100/40 ring-1 ring-purple-100/80 sm:rounded-3xl dark:bg-slate-950 dark:ring-slate-800 dark:shadow-none">
          {entries.length === 0 && onCopyPreviousWeek && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-purple-100/80 bg-purple-50/40 px-6 py-3 text-xs dark:border-slate-800 dark:bg-slate-900/40">
              <span className="text-slate-600 dark:text-slate-400">
                No meals planned for this week yet. You can add meals to each day or copy your plan from last week.
              </span>
              <button
                type="button"
                onClick={onCopyPreviousWeek}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-purple-200/80 bg-white px-3 py-1.5 font-semibold text-violet-700 shadow-2xs hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-800 dark:text-violet-300 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Last Week</span>
              </button>
            </div>
          )}
          <div className="flex flex-col">
            {days.map((day) => {
              const dateStr = format(day.date, 'yyyy-MM-dd');
              const dayMeals = entries.filter((m) => m.date === dateStr);
              const dayEvents = events.filter((e) => e.date === dateStr);
              return (
                <DayRow 
                  key={day.date.toISOString()} 
                  day={day} 
                  meals={dayMeals}
                  events={dayEvents}
                  onAddMeal={onAddMeal}
                  onAddRecipe={onAddMealFromRecipe}
                  onOpenRecipePicker={(dStr, t) => setRecipePickerTarget({ dateStr: dStr, type: t })}
                  onUpdateMeal={onUpdateMeal}
                  onDeleteMeal={onDeleteMeal}
                  onDuplicateMeal={onDuplicateMeal}
                  onOpenDetail={onOpenDetail}
                  onOpenMoveCopyModal={handleOpenMoveCopy}
                  recentRecipeIds={recentRecipeIds}
                  onAddEvent={onAddEvent}
                  onDeleteEvent={onDeleteEvent}
                  onDuplicateEvent={onDuplicateEvent}
                  onOpenEventDetail={onOpenEventDetail}
                />
              );
            })}
          </div>
        </div>
      </div>
      
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeMeal ? (
          <MealChip 
            meal={activeMeal} 
            onUpdate={() => {}}
            onDelete={() => {}} 
            onDuplicate={() => {}} 
            onOpenDetail={() => {}} 
          />
        ) : activeEvent ? (
          <EventChip 
            event={activeEvent}
            onDelete={() => {}}
            onDuplicate={() => {}}
            onOpenDetail={() => {}}
          />
        ) : null}
      </DragOverlay>

      {!onOpenMoveCopyModal && (
        <MoveCopyMealModal
          isOpen={Boolean(internalMoveCopyMeal)}
          meal={internalMoveCopyMeal}
          onClose={() => setInternalMoveCopyMeal(null)}
          onCopy={(id, targetDate, targetType) => onDuplicateMeal(id, targetDate, targetType)}
          onMove={(id, targetDate, targetType) => {
            if (onMoveMealToDate) {
              onMoveMealToDate(id, targetDate, targetType);
            }
          }}
        />
      )}

      {recipePickerTarget && (
        <RecipePickerModal
          isOpen={Boolean(recipePickerTarget)}
          targetDateStr={recipePickerTarget.dateStr}
          targetType={recipePickerTarget.type}
          onClose={() => setRecipePickerTarget(null)}
          onSelectRecipe={(recipe, targetDateStr, targetType) => {
            onAddMealFromRecipe?.(recipe, targetDateStr, targetType);
          }}
          onChangeTargetType={(type) => {
            setRecipePickerTarget((prev) => (prev ? { ...prev, type } : null));
          }}
        />
      )}
    </DndContext>
  );
}
