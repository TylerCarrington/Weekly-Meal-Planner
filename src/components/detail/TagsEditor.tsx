/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TagsEditorProps {
  label: string;
  tags: string[] | undefined;
  onSave: (tags: string[]) => void;
  tagColorClass?: string;
}

export function TagsEditor({ label, tags = [], onSave, tagColorClass = "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200" }: TagsEditorProps) {
  const [newTag, setNewTag] = useState('');

  const handleAdd = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onSave([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onSave(tags.filter((t) => t !== tagToRemove));
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
        {label}
      </label>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "flex items-center gap-1 overflow-hidden rounded-md px-2 py-1 text-xs font-medium shadow-sm transition-colors",
                tagColorClass
              )}
            >
              <span className="truncate">{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="rounded-full p-0.5 opacity-60 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={`Add ${label.toLowerCase()}...`}
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          onClick={handleAdd}
          disabled={!newTag.trim()}
          className="flex shrink-0 items-center justify-center rounded-lg bg-indigo-500 p-2 text-white shadow-sm transition-colors hover:bg-indigo-600 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
