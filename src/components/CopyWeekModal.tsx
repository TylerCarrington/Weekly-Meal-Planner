/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalendarSync, X, Loader2, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useCopyWeek } from '../hooks/useCopyWeek';
import { CopyWeekMealPreview } from './copyWeek/CopyWeekMealPreview';
import { CopyWeekModeSelector } from './copyWeek/CopyWeekModeSelector';

interface CopyWeekModalProps {
  isOpen: boolean;
  targetDate: Date;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CopyWeekModal({ isOpen, targetDate, onClose, onSuccess }: CopyWeekModalProps) {
  const {
    isLoading,
    isCopying,
    preview,
    mode,
    setMode,
    error,
    executeCopy,
  } = useCopyWeek(targetDate, isOpen, () => {
    onSuccess?.();
    onClose();
  });

  if (!isOpen) return null;

  const formatRange = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return '';
    try {
      return `${format(parseISO(startStr), 'MMM d')} – ${format(parseISO(endStr), 'MMM d, yyyy')}`;
    } catch {
      return `${startStr} to ${endStr}`;
    }
  };

  const hasSourceMeals = (preview?.sourceMealsCount || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-slate-900 dark:border dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <div className="rounded-lg bg-violet-100 p-2 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              <CalendarSync className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Copy Previous Week</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Duplicate planned meals from last week</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
              <p className="mt-2 text-xs">Checking previous week meals...</p>
            </div>
          ) : (
            <>
              {preview && (
                <div className="flex items-center justify-between rounded-xl bg-violet-50/60 p-3 text-xs border border-violet-100/80 dark:bg-violet-950/20 dark:border-violet-900/40">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">From Last Week</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{formatRange(preview.prevWeekStartStr, preview.prevWeekEndStr)}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-violet-400" />
                  <div className="text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">To Current Week</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{formatRange(preview.targetWeekStartStr, preview.targetWeekEndStr)}</div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900">
                  {error}
                </div>
              )}

              {!hasSourceMeals ? (
                <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  <p className="font-medium">No meals found in the previous week to copy.</p>
                  <p className="mt-1 text-xs">Try navigating back to add meals, or plan this week from scratch.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Meals to copy ({preview?.sourceMealsCount})</span>
                      <span className="text-[11px] text-slate-500 font-normal">Day & slot mapped automatically</span>
                    </div>
                    <CopyWeekMealPreview meals={preview?.sourceMeals || []} />
                  </div>

                  <CopyWeekModeSelector
                    mode={mode}
                    existingCount={preview?.targetMealsCount || 0}
                    onModeChange={setMode}
                  />
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isCopying}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {hasSourceMeals ? 'Cancel' : 'Close'}
          </button>
          {hasSourceMeals && (
            <button
              type="button"
              onClick={executeCopy}
              disabled={isCopying || isLoading}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-600"
            >
              {isCopying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Copying Meals...</span>
                </>
              ) : (
                <span>
                  {mode === 'replace' ? 'Replace & Copy Meals' : `Copy ${preview?.sourceMealsCount || ''} Meals`}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
