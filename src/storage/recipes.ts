/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Recipe } from '../types/recipes';
import { updateMeal } from './meals';
import { WeeklyMealPlan, MealEntry } from '../types/meals';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, query, where, orderBy } from 'firebase/firestore';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function withComputed(recipe: Omit<Recipe, 'totalTime'>): Recipe {
  const prep = recipe.prepTime || 0;
  const cook = recipe.cookTime || 0;
  const computedTotal = prep + cook;
  return {
    ...recipe,
    ...(computedTotal > 0 ? { totalTime: computedTotal } : {})
  };
}

function cleanForStorage(recipe: Partial<Recipe>): Omit<Recipe, 'totalTime'> {
  const clone = { ...recipe };
  delete (clone as any).totalTime;
  delete (clone as any).id;
  return clone as any;
}

import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export async function getRecipes(plannerId: string): Promise<{ data?: Recipe[]; error?: string }> {
  try {
    const q = collection(db, `planners/${plannerId}/recipes`);
    const snap = await getDocs(q);
    const recipes = snap.docs.map(d => withComputed({ id: d.id, ...d.data() } as Recipe));
    return { data: recipes };
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, `planners/${plannerId}/recipes`);
    return { error: 'Failed to load recipes' };
  }
}

export async function saveRecipe(
  plannerId: string,
  recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'timesUsed' | 'totalTime'>
): Promise<{ data?: Recipe; error?: string }> {
  try {
    const now = Date.now();
    const id = generateId();
    const newRecipeData: Omit<Recipe, 'totalTime'> = {
      ...recipeData,
      id,
      createdAt: now,
      updatedAt: now,
      timesUsed: 0,
    };
    
    const docRef = doc(db, `planners/${plannerId}/recipes`, id);
    await setDoc(docRef, cleanForStorage(newRecipeData));
    
    return { data: withComputed(newRecipeData) };
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, `planners/${plannerId}/recipes`);
    return { error: 'Failed to save recipe' };
  }
}

export async function updateRecipe(
  plannerId: string,
  id: string,
  updates: Partial<Omit<Recipe, 'id' | 'createdAt' | 'totalTime'>>
): Promise<{ data?: Recipe; error?: string }> {
  try {
    const docRef = doc(db, `planners/${plannerId}/recipes`, id);
    const cleaned = cleanForStorage({ ...updates, updatedAt: Date.now() });
    await updateDoc(docRef, cleaned);
    
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Not found');

    const finalizedRecipe = withComputed({ id, ...snap.data() } as Recipe);

    if (updates.name) {
      // Very basic batch update. If there are >500 meals, this would fail, but it's fine for now.
      const q = query(collection(db, `planners/${plannerId}/meals`), where('recipeId', '==', id));
      const mealSnaps = await getDocs(q);
      const batch = writeBatch(db);
      mealSnaps.docs.forEach(d => {
        batch.update(d.ref, { name: updates.name });
      });
      await batch.commit();
    }
    
    return { data: finalizedRecipe };
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `planners/${plannerId}/recipes/${id}`);
    return { error: 'Failed to update recipe' };
  }
}

export async function deleteRecipe(plannerId: string, id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, `planners/${plannerId}/recipes`, id));
    return { success: true };
  } catch (e) {
    console.error('Failed to delete recipe:', e);
    return { error: 'Failed to delete recipe' };
  }
}

export async function duplicateRecipe(plannerId: string, id: string): Promise<{ data?: Recipe; error?: string }> {
  try {
    const docRef = doc(db, `planners/${plannerId}/recipes`, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { error: 'Original recipe not found' };

    const { id: _oldId, createdAt, updatedAt, timesUsed, totalTime, name, ...rest } = snap.data() as Recipe;
    
    return saveRecipe(plannerId, {
      ...rest,
      name: `${name} (Copy)`
    });
  } catch (e) {
    console.error('Failed to duplicate recipe:', e);
    return { error: 'Failed to duplicate recipe' };
  }
}

export async function linkRecipeToMeal(plannerId: string, mealId: string, recipeId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const result = await updateMeal(plannerId, mealId, { recipeId });
    if (result.error) return { error: result.error };
    
    const recipeRef = doc(db, `planners/${plannerId}/recipes`, recipeId);
    const snap = await getDoc(recipeRef);
    if (snap.exists()) {
      await updateDoc(recipeRef, { timesUsed: (snap.data().timesUsed || 0) + 1 });
    }
    
    return { success: true };
  } catch (e) {
    console.error('Failed to link recipe:', e);
    return { error: 'Failed to link recipe' };
  }
}

export type RecipeUsageItem = MealEntry;

export async function getRecipeUsageHistory(plannerId: string, recipeId: string): Promise<{ data?: RecipeUsageItem[]; error?: string }> {
  try {
    const q = query(
      collection(db, `planners/${plannerId}/meals`),
      where('recipeId', '==', recipeId)
    );
    const snaps = await getDocs(q);
    const history = snaps.docs.map(d => ({ id: d.id, ...d.data() } as RecipeUsageItem));
    
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { data: history };
  } catch (e) {
    console.error('Failed to get structural recipe history:', e);
    return { error: 'Failed to load usage history' };
  }
}

