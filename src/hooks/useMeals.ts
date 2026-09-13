/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { MealEntry, MealType, WeeklyMealPlan, CopyWeekMode, WeekSummaryPreview } from '../types/meals';
import { Recipe } from '../types/recipes';
import { saveMeal, updateMeal, deleteMeal, duplicateMeal, copyPreviousWeekMeals, getPreviousWeekSummary } from '../storage/meals';
import { linkRecipeToMeal, getRecipe } from '../storage/recipes';
import { getWeekKey, WEEK_STARTS_ON } from '../utils/dateUtils';
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

    const start = startOfWeek(viewDate, { weekStartsOn: WEEK_STARTS_ON });
    const end = endOfWeek(viewDate, { weekStartsOn: WEEK_STARTS_ON });
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
    
    const start2 = startOfWeek(prev2, { weekStartsOn: WEEK_STARTS_ON });
    const end1 = endOfWeek(prev1, { weekStartsOn: WEEK_STARTS_ON });
    
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

  const addMealFromRecipe = useCallback(async (
    recipeOrId: string | Recipe,
    nameOrDateStr: string,
    dateStrOrType: string | MealType,
    typeArg?: MealType
  ) => {
    if (!activePlanner) return;

    let recipe: Recipe | null = null;
    let recipeId = '';
    let mealName = '';
    let targetDate = '';
    let targetType: MealType = MealType.Dinner;

    if (typeof recipeOrId === 'string') {
      recipeId = recipeOrId;
      mealName = nameOrDateStr;
      targetDate = dateStrOrType as string;
      targetType = typeArg || MealType.Dinner;
      const fetched = await getRecipe(activePlanner.id, recipeId);
      if (fetched.data) {
        recipe = fetched.data;
      }
    } else {
      recipe = recipeOrId;
      recipeId = recipe.id;
      mealName = recipe.name;
      targetDate = nameOrDateStr;
      targetType = (dateStrOrType as MealType) || MealType.Dinner;
    }

    const newMealData: any = {
      name: recipe?.name || mealName,
      date: targetDate,
      type: targetType,
      order: 999,
      recipeId,
    };

    if (recipe) {
      if (recipe.imageUrl) newMealData.imageUrl = recipe.imageUrl;
      if (recipe.ingredients && recipe.ingredients.length > 0) newMealData.ingredients = recipe.ingredients;
      if (recipe.directions) newMealData.directions = recipe.directions;
      if (recipe.notes) newMealData.notes = recipe.notes;
      if (recipe.sourceUrl) newMealData.sourceUrl = recipe.sourceUrl;
      if (recipe.prepTime !== undefined) newMealData.prepTime = recipe.prepTime;
      if (recipe.cookTime !== undefined) newMealData.cookTime = recipe.cookTime;
      if (recipe.servings !== undefined) newMealData.servings = recipe.servings;
      if (recipe.cuisineTag) newMealData.cuisineTag = recipe.cuisineTag;
      if (recipe.dietaryFlags && recipe.dietaryFlags.length > 0) newMealData.dietaryFlags = recipe.dietaryFlags;
      if (recipe.rating !== undefined) newMealData.rating = recipe.rating;
      if (recipe.labels && recipe.labels.length > 0) newMealData.labels = recipe.labels;
    }

    const res = await saveMeal(activePlanner.id, newMealData);
    if (res.data) {
      await linkRecipeToMeal(activePlanner.id, res.data.id, recipeId);
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

  const copyMeal = useCallback(async (id: string, targetDateStr?: string, targetType?: MealType) => {
    if (!activePlanner) return;
    await duplicateMeal(activePlanner.id, id, targetDateStr, targetType);
  }, [activePlanner]);

  const moveMealToDate = useCallback(async (id: string, targetDateStr: string, targetType?: MealType) => {
    if (!activePlanner) return;
    const entries = weeklyPlan?.entries || [];
    const activeMeal = entries.find(m => m.id === id);
    const toType = targetType || activeMeal?.type || MealType.Dinner;
    await updateMeal(activePlanner.id, id, { date: targetDateStr, type: toType });
  }, [activePlanner, weeklyPlan]);

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
    
    if (toDate !== activeMeal.date || toType !== activeMeal.type) {
      await updateMeal(activePlanner.id, activeId, { date: toDate, type: toType });
    }
  }, [activePlanner, weeklyPlan]);

  const copyPreviousWeek = useCallback(async (mode: CopyWeekMode = 'append') => {
    if (!activePlanner) return { success: false, count: 0, error: 'No active planner' };
    const res = await copyPreviousWeekMeals(activePlanner.id, viewDate, mode);
    if (res.error) {
      setError(res.error);
      return { success: false, count: 0, error: res.error };
    }
    return { success: true, count: res.data?.copiedCount || 0 };
  }, [activePlanner, viewDate]);

  const getPreviousWeekPreview = useCallback(async (): Promise<WeekSummaryPreview | null> => {
    if (!activePlanner) return null;
    const res = await getPreviousWeekSummary(activePlanner.id, viewDate);
    if (res.error) {
      setError(res.error);
      return null;
    }
    return res.data;
  }, [activePlanner, viewDate]);

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
    moveMealToDate,
    copyPreviousWeek,
    getPreviousWeekPreview,
    refreshMeals: () => {}, // unused in realtime
  };
}

