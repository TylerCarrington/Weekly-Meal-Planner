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
    Appointment: 'bg-teal-100/90 text-teal-950 border border-teal-300/90 hover:bg-teal-200/90 dark:bg-teal-500/20 dark:text-teal-200 dark:border-teal-500/30 dark:hover:bg-teal-500/30',
    Sports: 'bg-orange-100/90 text-orange-950 border border-orange-300/90 hover:bg-orange-200/90 dark:bg-orange-500/20 dark:text-orange-200 dark:border-orange-500/30 dark:hover:bg-orange-500/30',
    'Special Event': 'bg-fuchsia-100/90 text-fuchsia-950 border border-fuchsia-300/90 hover:bg-fuchsia-200/90 dark:bg-fuchsia-500/20 dark:text-fuchsia-200 dark:border-fuchsia-500/30 dark:hover:bg-fuchsia-500/30',
    Custom: 'bg-sky-100/90 text-sky-950 border border-sky-300/90 hover:bg-sky-200/90 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-500/30 dark:hover:bg-sky-500/30',
  }[event.category] || 'bg-sky-100/90 text-sky-950 border border-sky-300/90 hover:bg-sky-200/90 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-500/30 dark:hover:bg-sky-500/30';

  const dotColor = {
    Appointment: 'bg-teal-500 dark:bg-teal-400',
    Sports: 'bg-orange-500 dark:bg-orange-400',
    'Special Event': 'bg-fuchsia-500 dark:bg-fuchsia-400',
    Custom: 'bg-sky-500 dark:bg-sky-400',
  }[event.category] || 'bg-sky-500 dark:bg-sky-400';

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