/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { MealEntry, MealType, WeeklyMealPlan } from '../types/meals';
import { saveMeal, updateMeal, deleteMeal, duplicateMeal } from '../storage/meals';
import { linkRecipeToMeal } from '../storage/recipes';
import { getWeekKey } from '../utils/dateUtils';
import { usePlanner } from '../contexts/PlannerContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { endOfWeek, startOfWeek, format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export function useMeals(viewDate: Date) {
  const { activePlanner } = usePlanner();
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMealPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentRecipeIds, setRecentRecipeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!activePlanner) return;

    const start = startOfWeek(viewDate, { weekStartsOn: 1 });
    const end = endOfWeek(viewDate, { weekStartsOn: 1 });
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');
    const weekKey = getWeekKey(viewDate);

    const q = query(
      collection(db, `planners/${activePlanner.id}/meals`),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealEntry));
      setWeeklyPlan({ weekKey, entries });
      setError(null);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `planners/${activePlanner.id}/meals`);
      setError('Failed to load meals');
    });

    return () => unsubscribe();
  }, [viewDate, activePlanner]);

  useEffect(() => {
    if (!activePlanner) return;
    
    // Recent recipes logic
    const prev1 = new Date(viewDate);
    prev1.setDate(prev1.getDate() - 7);
    const prev2 = new Date(viewDate);
    prev2.setDate(prev2.getDate() - 14);
    
    const start2 = startOfWeek(prev2, { weekStartsOn: 1 });
    const end1 = endOfWeek(prev1, { weekStartsOn: 1 });
    
    const q = query(
      collection(db, `planners/${activePlanner.id}/meals`),
      where('date', '>=', format(start2, 'yyyy-MM-dd')),
      where('date', '<=', format(end1, 'yyyy-MM-dd'))
    );
    
    getDocs(q).then(snap => {
      const recents = new Set<string>();
      snap.docs.forEach(d => {
        const recipeId = d.data().recipeId;
        if (recipeId) recents.add(recipeId);
      });
      setRecentRecipeIds(recents);
    }).catch(console.error);
    
  }, [viewDate, activePlanner]);

  const addMeal = useCallback(async (dateStr: string, type: MealType, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName || !activePlanner) {
      console.warn("addMeal blocked: validation failed", { 
        hasName: !!trimmedName, 
        hasPlanner: !!activePlanner,
        plannerId: activePlanner?.id 
      });
      return;
    }
    
    console.log("Saving meal...", { dateStr, type, trimmedName, plannerId: activePlanner.id });
    const res = await saveMeal(activePlanner.id, { name: trimmedName, date: dateStr, type, order: 999 });
    
    if (res.error) {
      console.error("Meal save failed:", res.error);
      setError(res.error);
    } else {
      console.log("Meal saved successfully", res.data?.id);
    }
  }, [activePlanner]);

  const addMealFromRecipe = useCallback(async (recipeId: string, name: string, dateStr: string, type: MealType) => {
    if (!activePlanner) return;
    const res = await saveMeal(activePlanner.id, { name, date: dateStr, type, order: 999, recipeId });
    if (res.data) {
      linkRecipeToMeal(activePlanner.id, res.data.id, recipeId);
    }
  }, [activePlanner]);

  const editMealName = useCallback(async (id: string, newName: string) => {
    if (!newName.trim() || !activePlanner) return;
    await updateMeal(activePlanner.id, id, { name: newName.trim() });
  }, [activePlanner]);

  const removeMeal = useCallback(async (id: string) => {
    if (!activePlanner) return;
    await deleteMeal(activePlanner.id, id);
  }, [activePlanner]);

  const copyMeal = useCallback(async (id: string) => {
    if (!activePlanner) return;
    await duplicateMeal(activePlanner.id, id);
  }, [activePlanner]);

  const moveMeal = useCallback(async (activeId: string, overId: string) => {
    // We update order directly
    if (!activePlanner || activeId === overId) return;
    
    const entries = weeklyPlan?.entries || [];
    const activeMeal = entries.find(m => m.id === activeId);
    if (!activeMeal) return;
    
    let toDate = activeMeal.date;
    let toType = activeMeal.type;

    if (overId.startsWith('slot|')) {
      const parts = overId.split('|');
      toDate = parts[1];
      toType = parts[2] as MealType;
    } else {
      const overMeal = entries.find((m) => m.id === overId);
      if (overMeal) {
        toDate = overMeal.date;
        toType = overMeal.type;
      }
    }
    
    await updateMeal(activePlanner.id, activeId, { date: toDate, type: toType });
  }, [activePlanner, weeklyPlan]);

  return {
    entries: weeklyPlan?.entries || [],
    error,
    recentRecipeIds,
    addMeal,
    addMealFromRecipe,
    editMealName,
    removeMeal,
    copyMeal,
    moveMeal,
    refreshMeals: () => {}, // unused in realtime
  };
}

