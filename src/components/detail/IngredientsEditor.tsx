/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ingredient } from '../../types/meals';
import { X, Plus } from 'lucide-react';

interface IngredientsEditorProps {
  ingredients: Ingredient[] | undefined;
  onSave: (ingredients: Ingredient[]) => void;
}

export function IngredientsEditor({ ingredients = [], onSave }: IngredientsEditorProps) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      const newList = [...ingredients, { name: name.trim(), quantity: qty.trim() }];
      onSave(newList);
      setName('');
      setQty('');
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const newList = ingredients.filter((_, index) => index !== indexToRemove);
    onSave(newList);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Ingredients
      </label>
      
      {ingredients.length > 0 && (
        <ul className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
          {ingredients.map((ing, idx) => (
            <li key={idx} className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-1.5 text-sm shadow-sm dark:bg-slate-800">
              <div className="flex flex-1 items-center gap-2 truncate">
                <span className="font-medium text-slate-900 dark:text-slate-100">{ing.name}</span>
                {ing.quantity && <span className="text-slate-500 dark:text-slate-400">— {ing.quantity}</span>}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="rounded text-slate-400 hover:text-red-500 dark:hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="New ingredient..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <input
          type="text"
          placeholder="Qty (e.g. 2 cups)"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full max-w-[120px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="flex shrink-0 items-center justify-center rounded-lg bg-indigo-500 p-2 text-white shadow-sm transition-colors hover:bg-indigo-600 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
