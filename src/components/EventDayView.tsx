import React, { FC, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CalendarEvent, EventCategory } from '../types/events';
import { EventChip } from './EventChip';
import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { Calendar } from 'lucide-react';

interface EventDayViewProps {
  dateStr: string;
  events: CalendarEvent[];
  onAddEvent: (dateStr: string, title: string, category?: EventCategory) => void;
  onDeleteEvent: (id: string) => void;
  onDuplicateEvent: (id: string, targetDateStr?: string) => void;
  onOpenEventDetail: (id: string) => void;
}

export const EventDayView: FC<EventDayViewProps> = ({
  dateStr,
  events,
  onAddEvent,
  onDeleteEvent,
  onDuplicateEvent,
  onOpenEventDetail,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day_${dateStr}`,
    data: {
      type: 'DayEvents',
    },
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');

  const handleAddSubmit = () => {
    if (newValue.trim()) {
      onAddEvent(dateStr, newValue.trim()); // Defers to 'Custom' category
    }
    setNewValue('');
    setIsAdding(false);
  };

  const handleBlur = () => {
    handleAddSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddSubmit();
    if (e.key === 'Escape') {
      setNewValue('');
      setIsAdding(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg p-2 min-h-[40px] transition-colors mb-2",
        isOver ? "bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-800" : "bg-transparent",
      )}
    >
      <div className="flex items-center text-slate-400 dark:text-slate-500 mr-2 shrink-0">
        <Calendar className="h-4 w-4" />
      </div>

      {events.map((event) => (
        <EventChip
          key={event.id}
          event={event}
          onDelete={onDeleteEvent}
          onDuplicate={(id) => onDuplicateEvent(id)}
          onOpenDetail={onOpenEventDetail}
        />
      ))}

      {isAdding ? (
        <input
          autoFocus
          className="w-40 rounded-full border border-sky-300 bg-white px-3 py-1 text-[13px] font-medium text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-400 dark:border-indigo-800 dark:bg-slate-900 dark:text-slate-200"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="New event..."
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold text-sky-800 bg-sky-50/80 border border-sky-200/80 transition-all hover:bg-sky-100 hover:border-sky-300 shadow-2xs dark:text-slate-400 dark:bg-slate-800/40 dark:border-transparent dark:hover:bg-slate-800 dark:hover:text-slate-300",
            events.length === 0 && "opacity-75"
          )}
        >
          <Plus className="h-3 w-3" />
          Add Event
        </button>
      )}
    </div>
  );
};