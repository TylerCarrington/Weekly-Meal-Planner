/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
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
import { CalendarEvent, EventCategory } from '../types/events';
import { DayRow } from './DayRow';
import { MealChip } from './MealChip';
import { EventChip } from './EventChip';

interface WeeklyGridProps {
  days: DayInfo[];
  entries: MealEntry[];
  events: CalendarEvent[];
  recentRecipeIds: Set<string>;
  onAddMeal: (dateStr: string, type: MealType, name: string) => void;
  onUpdateMeal: (id: string, newName: string) => void;
  onDeleteMeal: (id: string) => void;
  onDuplicateMeal: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onMoveMeal: (activeId: string, overId: string) => void;
  
  onAddEvent: (dateStr: string, title: string, category?: EventCategory) => void;
  onDeleteEvent: (id: string) => void;
  onDuplicateEvent: (id: string, targetDateStr?: string) => void;
  onOpenEventDetail: (id: string) => void;
  onMoveEvent: (activeId: string, overId: string) => void;
}

export function WeeklyGrid({ 
  days, 
  entries, 
  events,
  recentRecipeIds,
  onAddMeal, 
  onUpdateMeal, 
  onDeleteMeal, 
  onDuplicateMeal,
  onOpenDetail,
  onMoveMeal,
  onAddEvent,
  onDeleteEvent,
  onDuplicateEvent,
  onOpenEventDetail,
  onMoveEvent
}: WeeklyGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

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
        <div className="overflow-hidden bg-white shadow-xl ring-1 ring-slate-200 sm:rounded-2xl dark:bg-slate-950 dark:ring-slate-800">
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
                  onUpdateMeal={onUpdateMeal}
                  onDeleteMeal={onDeleteMeal}
                  onDuplicateMeal={onDuplicateMeal}
                  onOpenDetail={onOpenDetail}
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
    </DndContext>
  );
}
