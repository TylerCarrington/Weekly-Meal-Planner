/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { MealEntry } from '../types/meals';
import { getMealDetail, updateMealDetail } from '../storage/meals';
import { usePlanner } from '../contexts/PlannerContext';

export function useMealDetail() {
  const { activePlanner } = usePlanner();
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openPanel = useCallback((id: string) => {
    setActiveMealId(id);
    setError(null);
  }, []);

  const closePanel = useCallback(() => {
    setActiveMealId(null);
    setMeal(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!activeMealId || !activePlanner) {
      setMeal(null);
      return;
    }
    getMealDetail(activePlanner.id, activeMealId).then(result => {
      if (result.error) {
        setError(result.error);
      } else {
        setMeal(result.data);
      }
    });
  }, [activeMealId, activePlanner]);

  const updateDetail = useCallback(async (updates: Partial<MealEntry>) => {
    if (!activeMealId || !activePlanner) return;
    
    // Optimistic cache update locally for snappy UI
    setMeal((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates } as MealEntry;
    });
    
    const result = await updateMealDetail(activePlanner.id, activeMealId, updates);
    if (result.error) {
      setError(result.error);
    } else {
      // Set the returned meal which includes any natively-computed values
      setMeal(result.data);
    }
  }, [activeMealId, activePlanner]);

  return { 
    activeMealId, 
    meal, 
    error, 
    openPanel, 
    closePanel, 
    updateDetail 
  };
}

