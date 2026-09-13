/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { CopyWeekMode, WeekSummaryPreview } from '../types/meals';
import { usePlanner } from '../contexts/PlannerContext';
import { getPreviousWeekSummary, copyPreviousWeekMeals } from '../storage/meals';

export function useCopyWeek(targetDate: Date, isOpen: boolean, onCompleted?: () => void) {
  const { activePlanner } = usePlanner();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [preview, setPreview] = useState<WeekSummaryPreview | null>(null);
  const [mode, setMode] = useState<CopyWeekMode>('append');
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = useCallback(async () => {
    if (!activePlanner || !isOpen) return;
    setIsLoading(true);
    setError(null);
    const res = await getPreviousWeekSummary(activePlanner.id, targetDate);
    setIsLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setPreview(res.data);
    }
  }, [activePlanner, isOpen, targetDate]);

  useEffect(() => {
    if (isOpen) {
      setMode('append');
      fetchPreview();
    } else {
      setPreview(null);
      setError(null);
    }
  }, [isOpen, fetchPreview]);

  const executeCopy = useCallback(async () => {
    if (!activePlanner) return false;
    setIsCopying(true);
    setError(null);
    const res = await copyPreviousWeekMeals(activePlanner.id, targetDate, mode);
    setIsCopying(false);
    if (res.error) {
      setError(res.error);
      return false;
    }
    if (onCompleted) {
      onCompleted();
    }
    return true;
  }, [activePlanner, targetDate, mode, onCompleted]);

  return {
    isLoading,
    isCopying,
    preview,
    mode,
    setMode,
    error,
    executeCopy,
    retry: fetchPreview,
  };
}
