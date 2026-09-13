/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CopyWeekMode } from '../../types/meals';
import { AlertCircle, PlusCircle, RefreshCw } from 'lucide-react';

interface CopyWeekModeSelectorProps {
  mode: CopyWeekMode;
  existingCount: number;
  onModeChange: (mode: CopyWeekMode) => void;
}

export function CopyWeekModeSelector({
  mode,
  existingCount,
  onModeChange,
}: CopyWeekModeSelectorProps) {
  if (existingCount <= 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
      <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Current week already has {existingCount} meal{existingCount > 1 ? 's' : ''} planned</span>
      </div>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        How would you like to handle your current meals?
      </p>

      <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onModeChange('append')}
          className={`flex items-start gap-2 rounded-lg border p-2.5 text-left transition-all ${
            mode === 'append'
              ? 'border-violet-600 bg-white font-medium text-slate-900 shadow-xs ring-2 ring-violet-500/20 dark:border-violet-500 dark:bg-slate-800 dark:text-slate-100'
              : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <PlusCircle className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">Keep & Append</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Add last week's meals alongside existing ones</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('replace')}
          className={`flex items-start gap-2 rounded-lg border p-2.5 text-left transition-all ${
            mode === 'replace'
              ? 'border-rose-600 bg-white font-medium text-slate-900 shadow-xs ring-2 ring-rose-500/20 dark:border-rose-500 dark:bg-slate-800 dark:text-slate-100'
              : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">Replace Week</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Clear existing meals and start fresh with last week's plan</div>
          </div>
        </button>
      </div>
    </div>
  );
}
