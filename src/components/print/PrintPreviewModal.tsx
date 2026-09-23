/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer, X, LayoutTemplate, CheckSquare } from 'lucide-react';
import { DayInfo } from '../../types';
import { MealEntry } from '../../types/meals';
import { CalendarEvent } from '../../types/events';
import { PrintOptions, PrintOrientation } from '../../types/print';
import { PrintableSchedule } from './PrintableSchedule';

interface PrintPreviewModalProps {
  isOpen: boolean;
  days: DayInfo[];
  meals: MealEntry[];
  events: CalendarEvent[];
  weekRange: string;
  plannerName?: string;
  options: PrintOptions;
  onClose: () => void;
  onPrint: () => void;
  onSetOrientation: (orientation: PrintOrientation) => void;
  onToggleEvents: (val: boolean) => void;
  onToggleBlankSlots: (val: boolean) => void;
}

export function PrintPreviewModal({
  isOpen,
  days,
  meals,
  events,
  weekRange,
  plannerName,
  options,
  onClose,
  onPrint,
  onSetOrientation,
  onToggleEvents,
  onToggleBlankSlots,
}: PrintPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 dark:border dark:border-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white dark:bg-slate-100 dark:text-slate-900">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Print Weekly Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Single-page high contrast black & white layout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Options Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs dark:bg-slate-950/60 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <LayoutTemplate className="h-3.5 w-3.5" /> Layout:
            </span>
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => onSetOrientation('landscape')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  options.orientation === 'landscape'
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Landscape (7 Cols)
              </button>
              <button
                type="button"
                onClick={() => onSetOrientation('portrait')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  options.orientation === 'portrait'
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Portrait (7 Rows)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={options.includeEvents}
                onChange={(e) => onToggleEvents(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-0 dark:border-slate-700 dark:bg-slate-800"
              />
              <span>Include Events</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={options.includeBlankSlots}
                onChange={(e) => onToggleBlankSlots(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-0 dark:border-slate-700 dark:bg-slate-800"
              />
              <span>Handwriting Lines</span>
            </label>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="flex-1 bg-slate-200/80 p-4 sm:p-6 overflow-auto flex items-center justify-center dark:bg-slate-950">
          <div className="bg-white text-black p-4 sm:p-6 shadow-2xl rounded-sm border border-neutral-300 max-w-full max-h-full overflow-hidden flex flex-col scale-90 sm:scale-100 origin-center transition-all w-[780px] h-[520px]">
            <PrintableSchedule
              days={days}
              meals={meals}
              events={events}
              weekRange={weekRange}
              plannerName={plannerName}
              options={options}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tip: In your browser print settings, select &ldquo;{options.orientation === 'landscape' ? 'Landscape' : 'Portrait'}&rdquo; for best results.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
