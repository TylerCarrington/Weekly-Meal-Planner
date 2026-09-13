/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface BlurTextAreaProps {
  label: string;
  value: string | undefined;
  onSave: (val: string) => void;
  className?: string;
  placeholder?: string;
}

export function BlurTextArea({ label, value = '', onSave, className, placeholder }: BlurTextAreaProps) {
  const [localVal, setLocalVal] = useState(value || '');

  useEffect(() => {
    setLocalVal(value || '');
  }, [value]);

  const handleBlur = () => {
    if (localVal !== (value || '')) {
      onSave(localVal);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <textarea
        value={localVal}
        placeholder={placeholder}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        className={cn(
          "min-h-[100px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
          className
        )}
      />
    </div>
  );
}
