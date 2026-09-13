import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Recipe } from '../../types/recipes';
import { MealType } from '../../types/meals';
import { format, addDays } from 'date-fns';

interface AddToWeekModalProps {
  recipe: Recipe;
  onClose: () => void;
  onConfirm: (recipeId: string, name: string, dateStr: string, type: MealType) => void;
}

export function AddToWeekModal({ recipe, onClose, onConfirm }: AddToWeekModalProps) {
  // Setup next 14 days for selection explicitly natively supporting upcoming slots seamlessly
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedType, setSelectedType] = useState<MealType>(MealType.Dinner);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(recipe.id, recipe.name, selectedDate, selectedType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-50">Add to Planner</h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Assign <span className="font-medium text-slate-700 dark:text-slate-300">"{recipe.name}"</span> to your active weekly plan.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Target Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            >
              {dates.map((d) => (
                <option key={d.toISOString()} value={format(d, 'yyyy-MM-dd')}>
                  {format(d, 'EEEE, MMM d')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Meal Slot
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as MealType)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            >
              {Object.values(MealType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Add to Week
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}