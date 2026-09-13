/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MealEntry, MealType, WeeklyMealPlan } from '../types/meals';
import { getWeekKey } from '../utils/dateUtils';
import { db } from '../lib/firebase';
import { collection, doc, query, where, getDocs, getDoc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export interface StorageResult<T> {
  data: T | null;
  error: string | null;
}

function withComputed(meal: any): MealEntry {
  const result = { ...meal };
  Object.defineProperty(result, 'totalTime', {
    get() {
      if (this.prepTime === undefined && this.cookTime === undefined) {
        return undefined;
      }
      return (Number(this.prepTime) || 0) + (Number(this.cookTime) || 0);
    },
    enumerable: true,
  });
  return result as MealEntry;
}

import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

function cleanForStorage(meal: Partial<MealEntry>): any {
  const clone = { ...meal } as any;
  delete clone.totalTime;
  delete clone.id;
  Object.keys(clone).forEach(key => {
    if (clone[key] === undefined) delete clone[key];
  });
  return clone;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export async function saveMeal(plannerId: string, meal: Omit<MealEntry, 'id' | 'totalTime' | 'createdAt'>): Promise<StorageResult<MealEntry>> {
  try {
    const id = generateId();
    const newMeal = { ...meal, id, createdAt: Date.now() };
    const docRef = doc(db, `planners/${plannerId}/meals`, id);
    const cleaned = cleanForStorage(newMeal);

    console.log("Saving meal to Firestore:", { path: docRef.path, payload: cleaned });

    await setDoc(docRef, cleaned);

    console.log("Firestore setDoc successful for meal:", id);
    return { data: withComputed(newMeal), error: null };
  } catch (err: any) {
    console.error("Firestore Error in saveMeal (caught):", err);
    handleFirestoreError(err, OperationType.CREATE, `planners/${plannerId}/meals`);
    return { data: null, error: err.message || 'Failed to save meal' };
  }
}

export async function updateMeal(plannerId: string, id: string, updates: Partial<Omit<MealEntry, 'totalTime'>>): Promise<StorageResult<MealEntry>> {
  try {
    const docRef = doc(db, `planners/${plannerId}/meals`, id);
    const cleanup = cleanForStorage(updates);
    if (Object.keys(cleanup).length > 0) {
      await updateDoc(docRef, cleanup);
    }
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Meal not found');
    return { data: withComputed({ id, ...snap.data() }), error: null };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.UPDATE, `planners/${plannerId}/meals/${id}`);
    return { data: null, error: err.message || 'Failed to update meal' };
  }
}

export async function deleteMeal(plannerId: string, id: string): Promise<StorageResult<boolean>> {
  try {
    const docRef = doc(db, `planners/${plannerId}/meals`, id);
    await deleteDoc(docRef);
    return { data: true, error: null };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.DELETE, `planners/${plannerId}/meals/${id}`);
    return { data: null, error: err.message || 'Failed to delete meal' };
  }
}

export async function duplicateMeal(plannerId: string, id: string): Promise<StorageResult<MealEntry>> {
  try {
    const docRef = doc(db, `planners/${plannerId}/meals`, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Meal to duplicate not found');
    const existing = snap.data() as Omit<MealEntry, 'id'>;

    const q = query(
      collection(db, `planners/${plannerId}/meals`),
      where('date', '==', existing.date),
      where('type', '==', existing.type)
    );
    const slotSnaps = await getDocs(q);
    const maxOrder = slotSnaps.docs.length > 0 ? Math.max(...slotSnaps.docs.map(d => d.data().order || 0)) : 0;

    const newId = generateId();
    const newMeal = {
      ...existing,
      id: newId,
      order: maxOrder + 1,
      createdAt: existing.createdAt || Date.now(),
    };
    
    const newDocRef = doc(db, `planners/${plannerId}/meals`, newId);
    await setDoc(newDocRef, cleanForStorage(newMeal));
    
    // duplicate meal Details too if they exist!
    const detailDocRef = doc(db, `planners/${plannerId}/mealDetails`, id);
    const detailSnap = await getDoc(detailDocRef);
    if (detailSnap.exists()) {
      await setDoc(doc(db, `planners/${plannerId}/mealDetails`, newId), detailSnap.data());
    }

    return { data: withComputed(newMeal), error: null };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, `planners/${plannerId}/meals`);
    return { data: null, error: err.message || 'Failed to duplicate meal' };
  }
}

export async function getMealDetail(plannerId: string, id: string): Promise<StorageResult<MealEntry>> {
  try {
    const mealDoc = await getDoc(doc(db, `planners/${plannerId}/meals`, id));
    if (!mealDoc.exists()) throw new Error('Meal not found');
    let meal = { id, ...mealDoc.data() } as MealEntry;

    // Check mealDetails
    const detailDoc = await getDoc(doc(db, `planners/${plannerId}/mealDetails`, id));
    if (detailDoc.exists()) {
      meal = { ...meal, ...detailDoc.data() };
    }

    // Auto-resolve abstract reference
    if (meal.recipeId) {
      const recipeDoc = await getDoc(doc(db, `planners/${plannerId}/recipes`, meal.recipeId));
      if (recipeDoc.exists()) {
        meal = { ...recipeDoc.data(), ...meal }; // meal structurally preserves
      }
    }

    return { data: withComputed(meal), error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to get meal detail' };
  }
}

export type MealDetailFields = Partial<Omit<MealEntry, 'id' | 'date' | 'type' | 'order' | 'totalTime'>>;

export async function updateMealDetail(plannerId: string, id: string, details: MealDetailFields): Promise<StorageResult<MealEntry>> {
  try {
    const detailDocRef = doc(db, `planners/${plannerId}/mealDetails`, id);
    const snap = await getDoc(detailDocRef);
    const cleaned = cleanForStorage(details);
    if (!snap.exists()) {
      await setDoc(detailDocRef, cleaned);
    } else {
      await updateDoc(detailDocRef, cleaned);
    }
    
    // verify base meal object!
    const baseSnap = await getDoc(doc(db, `planners/${plannerId}/meals`, id));
    if (!baseSnap.exists()) throw new Error("Base meal missing");
    
    const combined = { id, ...baseSnap.data(), ...cleaned } as MealEntry;
    return { data: withComputed(combined), error: null };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.UPDATE, `planners/${plannerId}/mealDetails/${id}`);
    return { data: null, error: err.message || 'Failed to update meal details' };
  }
}

