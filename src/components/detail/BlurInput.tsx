/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface BlurInputProps {
  label: string;
  value: string | number | undefined;
  onSave: (val: string) => void;
  className?: string;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
}

export function BlurInput({ label, value = '', onSave, className, type = 'text', readOnly, placeholder }: BlurInputProps) {
  const [localVal, setLocalVal] = useState(value?.toString() || '');

  useEffect(() => {
    setLocalVal(value?.toString() || '');
  }, [value]);

  const handleBlur = () => {
    if (localVal !== (value?.toString() || '')) {
      onSave(localVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <input
        type={type}
        value={localVal}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
          readOnly && "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
          className
        )}
      />
    </div>
  );
}
