/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { X, Copy, ArrowRightLeft, Calendar, Clock } from 'lucide-react';
import { MealEntry, MealType } from '../types/meals';
import { cn } from '../lib/utils';

export type MoveCopyMode = 'copy' | 'move';

interface MoveCopyMealModalProps {
  isOpen: boolean;
  meal: MealEntry | null;
  onClose: () => void;
  onCopy: (id: string, targetDateStr: string, targetType: MealType) => void;
  onMove: (id: string, targetDateStr: string, targetType: MealType) => void;
}

export function MoveCopyMealModal({
  isOpen,
  meal,
  onClose,
  onCopy,
  onMove,
}: MoveCopyMealModalProps) {
  if (!isOpen || !meal) return null;

  const currentDateObj = parseISO(meal.date);
  const nextDateStr = format(addDays(currentDateObj, 1), 'yyyy-MM-dd');

  const [mode, setMode] = useState<MoveCopyMode>('copy');
  const [targetDate, setTargetDate] = useState<string>(nextDateStr);
  const [targetType, setTargetType] = useState<MealType>(meal.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'copy') {
      onCopy(meal.id, targetDate, targetType);
    } else {
      onMove(meal.id, targetDate, targetType);
    }
    onClose();
  };

  const handleQuickNextDay = (selectedMode: MoveCopyMode) => {
    if (selectedMode === 'copy') {
      onCopy(meal.id, nextDateStr, meal.type);
    } else {
      onMove(meal.id, nextDateStr, meal.type);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl border border-purple-100/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-purple-100/60 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {mode === 'copy' ? 'Copy Meal' : 'Move Meal'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              "{meal.name}" &bull; Currently on {format(currentDateObj, 'EEE, MMM d')} ({meal.type})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-purple-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Toggle */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-purple-50/70 p-1 border border-purple-100/60 dark:bg-slate-800 dark:border-transparent">
          <button
            type="button"
            onClick={() => setMode('copy')}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all",
              mode === 'copy'
                ? "bg-white text-violet-700 shadow-sm border border-purple-100 dark:bg-slate-700 dark:text-indigo-400 dark:border-transparent"
                : "text-slate-600 hover:text-violet-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Meal
          </button>
          <button
            type="button"
            onClick={() => setMode('move')}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all",
              mode === 'move'
                ? "bg-white text-violet-700 shadow-sm border border-purple-100 dark:bg-slate-700 dark:text-indigo-400 dark:border-transparent"
                : "text-slate-600 hover:text-violet-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Move Meal
          </button>
        </div>

        {/* Quick Shortcut */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleQuickNextDay(mode)}
            className="flex w-full items-center justify-between rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-2.5 text-xs font-semibold text-violet-800 transition-colors hover:bg-violet-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
          >
            <span>Quick: {mode === 'copy' ? 'Copy to' : 'Move to'} Next Day</span>
            <span className="font-bold">{format(addDays(currentDateObj, 1), 'EEE, MMM d')} &rarr;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              className="w-full rounded-xl border border-purple-200/80 bg-white px-3 py-2 text-sm text-slate-800 shadow-2xs focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Meal Slot
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.values(MealType).map((type) => {
                const isActive = targetType === type;
                const slotStyles = {
                  [MealType.Breakfast]: isActive ? "border-amber-300 bg-amber-100 text-amber-950 font-bold" : "border-slate-200 text-slate-600 hover:bg-amber-50/50",
                  [MealType.Lunch]: isActive ? "border-emerald-300 bg-emerald-100 text-emerald-950 font-bold" : "border-slate-200 text-slate-600 hover:bg-emerald-50/50",
                  [MealType.Dinner]: isActive ? "border-violet-300 bg-violet-100 text-violet-950 font-bold" : "border-slate-200 text-slate-600 hover:bg-violet-50/50",
                  [MealType.Other]: isActive ? "border-rose-300 bg-rose-100 text-rose-950 font-bold" : "border-slate-200 text-slate-600 hover:bg-rose-50/50",
                }[type];

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTargetType(type)}
                    className={cn(
                      "rounded-lg border px-2 py-1.5 text-xs transition-all capitalize shadow-2xs",
                      slotStyles,
                      "dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-purple-100/60 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50/50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-violet-700 active:scale-95"
            >
              {mode === 'copy' ? <Copy className="h-3.5 w-3.5" /> : <ArrowRightLeft className="h-3.5 w-3.5" />}
              {mode === 'copy' ? 'Confirm Copy' : 'Confirm Move'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
