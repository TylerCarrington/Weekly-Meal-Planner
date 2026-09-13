import React, { useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { CalendarEvent, EventCategory } from '../types/events';
import { BlurInput } from './detail/BlurInput';
import { BlurTextArea } from './detail/BlurTextArea';

interface EventDetailPanelProps {
  isOpen: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
}

export function EventDetailPanel({ isOpen, event, onClose, onUpdate }: EventDetailPanelProps) {
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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-slate-50 shadow-2xl transition-transform sm:w-[480px] dark:bg-[#0f172a]">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <Calendar className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold">
              Event Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            
            <BlurInput
              label="Title"
              value={event.title}
              onSave={(val) => onUpdate(event.id, { title: val })}
              placeholder="Event name..."
              className="text-lg font-bold"
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Category
              </label>
              <select
                value={event.category}
                onChange={(e) => onUpdate(event.id, { category: e.target.value as EventCategory })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="Appointment">Appointment</option>
                <option value="Sports">Sports</option>
                <option value="Special Event">Special Event</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <BlurInput
                label="Start Time"
                value={event.startTime}
                onSave={(val) => onUpdate(event.id, { startTime: val })}
                placeholder="e.g. 10:00 AM"
              />
              <BlurInput
                label="End Time"
                value={event.endTime}
                onSave={(val) => onUpdate(event.id, { endTime: val })}
                placeholder="e.g. 11:00 AM"
              />
            </div>

            <BlurInput
              label="Location"
              value={event.location}
              onSave={(val) => onUpdate(event.id, { location: val })}
              placeholder="Address or Link"
            />

            <BlurTextArea
              label="Notes"
              value={event.notes}
              onSave={(val) => onUpdate(event.id, { notes: val })}
              placeholder="Add event details here..."
              className="min-h-[120px]"
            />
            
            <div className="h-6" />
          </div>
        </div>
      </div>
    </>
  );
}