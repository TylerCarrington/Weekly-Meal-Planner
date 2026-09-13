/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { saveRecipe, updateRecipe, deleteRecipe, duplicateRecipe } from '../storage/recipes';
import { Recipe } from '../types/recipes';
import { usePlanner } from '../contexts/PlannerContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export type RecipeSortMethod = 'recent' | 'alphabetical' | 'rating' | 'uses';

export function useRecipes() {
  const { activePlanner } = usePlanner();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('');
  const [sortBy, setSortBy] = useState<RecipeSortMethod>('recent');

  useEffect(() => {
    if (!activePlanner) {
      setRecipes([]);
      return;
    }
    
    // Default to alphabetical sync
    const q = query(
      collection(db, `planners/${activePlanner.id}/recipes`)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        const prep = data.prepTime || 0;
        const cook = data.cookTime || 0;
        const computedTotal = prep + cook;
        return {
          id: doc.id,
          ...data,
          ...(computedTotal > 0 ? { totalTime: computedTotal } : {})
        } as Recipe;
      });
      setRecipes(results);
      setError(null);
    }, (err) => {
      console.error(err);
      setError('Failed to load recipes');
    });

    return () => unsubscribe();
  }, [activePlanner]);

  const addRecipe = useCallback(async (name: string) => {
    if (!activePlanner) return null;
    const result = await saveRecipe(activePlanner.id, { name: name.trim() || 'New Recipe' });
    if (result.error || !result.data) {
      setError(result.error || 'Failed to add recipe');
      return null;
    }
    return result.data;
  }, [activePlanner]);

  const editRecipe = useCallback(async (id: string, updates: Partial<Recipe>) => {
    if (!activePlanner) return;
    const result = await updateRecipe(activePlanner.id, id, updates);
    if (result.error || !result.data) {
      setError(result.error || 'Failed to update recipe');
    }
  }, [activePlanner]);

  const removeRecipe = useCallback(async (id: string) => {
    if (!activePlanner) return;
    const result = await deleteRecipe(activePlanner.id, id);
    if (result.error) {
      setError(result.error);
    }
  }, [activePlanner]);

  const copyRecipe = useCallback(async (id: string) => {
    if (!activePlanner) return;
    const result = await duplicateRecipe(activePlanner.id, id);
    if (result.error || !result.data) {
      setError(result.error || 'Failed to duplicate recipe');
    }
  }, [activePlanner]);

  const filteredAndSorted = useMemo(() => {
    let result = [...recipes];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q));
    }
    if (labelFilter) {
      result = result.filter(r => (r.labels || []).includes(labelFilter));
    }
    if (cuisineFilter) {
      result = result.filter(r => r.cuisineTag === cuisineFilter);
    }
    if (dietaryFilter) {
      result = result.filter(r => (r.dietaryFlags || []).includes(dietaryFilter));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'uses':
          return (b.timesUsed || 0) - (a.timesUsed || 0);
        case 'recent':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return result;
  }, [recipes, searchQuery, labelFilter, cuisineFilter, dietaryFilter, sortBy]);

  return {
    recipes: filteredAndSorted,
    allRecipes: recipes,
    error,
    searchQuery, setSearchQuery,
    labelFilter, setLabelFilter,
    cuisineFilter, setCuisineFilter,
    dietaryFilter, setDietaryFilter,
    sortBy, setSortBy,
    addRecipe,
    editRecipe,
    removeRecipe,
    copyRecipe,
    refreshRecipes: () => {}
  };
}
