import React, { FC } from 'react';
import { CalendarEvent } from '../types/events';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

interface EventChipProps {
  event: CalendarEvent;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, targetDateStr?: string) => void;
  onOpenDetail: (id: string) => void;
}

export const EventChip: FC<EventChipProps> = ({ event, onDelete, onDuplicate, onOpenDetail }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event_${event.id}`,
    data: {
      type: 'Event',
      event,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const colorClasses = {
    Appointment: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30',
    Sports: 'bg-orange-100 text-orange-900 hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-200 dark:hover:bg-orange-500/30',
    'Special Event': 'bg-pink-100 text-pink-900 hover:bg-pink-200 dark:bg-pink-500/20 dark:text-pink-200 dark:hover:bg-pink-500/30',
    Custom: 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
  }[event.category] || 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600';

  const dotColor = {
    Appointment: 'bg-emerald-500 dark:bg-emerald-400',
    Sports: 'bg-orange-500 dark:bg-orange-400',
    'Special Event': 'bg-pink-500 dark:bg-pink-400',
    Custom: 'bg-slate-500 dark:bg-slate-400',
  }[event.category] || 'bg-slate-500 dark:bg-slate-400';

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetail(event.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleContainerClick}
      className={cn(
        "group flex w-fit max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold transition-all cursor-pointer shadow-sm border border-black/5 dark:border-white/5",
        colorClasses,
        isDragging && "opacity-50 ring-2 ring-indigo-500 dark:ring-indigo-400 relative z-20 shadow-md"
      )}
    >
      <div className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />
      <span className="truncate">
        {event.title}
      </span>
      {(event.startTime || event.location) && (
        <span className="opacity-70 text-[11px] ml-1 font-medium whitespace-nowrap">
          {event.startTime} {event.location && `- ${event.location}`}
        </span>
      )}
      
      <div className="ml-1 flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(event.id);
          }}
          className="rounded p-0.5 opacity-60 hover:opacity-100"
          aria-label="Duplicate event"
          title="Duplicate"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event.id);
          }}
          className="ml-0.5 rounded p-0.5 opacity-60 hover:text-red-600 hover:opacity-100 dark:hover:text-red-400"
          aria-label="Remove event"
          title="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};