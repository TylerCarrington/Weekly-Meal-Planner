/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  rating: number | undefined;
  onRate: (rating: 1 | 2 | 3 | 4 | 5) => void;
}

export function StarRating({ rating = 0, onRate }: StarRatingProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Rating
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star as 1 | 2 | 3 | 4 | 5)}
            className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                star <= rating
                  ? "fill-indigo-500 text-indigo-500 dark:fill-indigo-400 dark:text-indigo-400"
                  : "fill-slate-200 text-slate-200 hover:fill-indigo-300 dark:fill-slate-700 dark:text-slate-700 dark:hover:fill-indigo-800"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
