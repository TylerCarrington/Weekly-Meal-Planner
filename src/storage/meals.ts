/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MealEntry, MealType, WeeklyMealPlan, CopyWeekMode, WeekSummaryPreview } from '../types/meals';
import { getWeekKey, WEEK_STARTS_ON } from '../utils/dateUtils';
import { db } from '../lib/firebase';
import { collection, doc, query, where, getDocs, getDoc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { parseISO, addDays, subWeeks, format, startOfWeek, endOfWeek } from 'date-fns';

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

export async function duplicateMeal(
  plannerId: string, 
  id: string, 
  targetDateStr?: string, 
  targetType?: MealType
): Promise<StorageResult<MealEntry>> {
  try {
    const docRef = doc(db, `planners/${plannerId}/meals`, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Meal to duplicate not found');
    const existing = snap.data() as Omit<MealEntry, 'id'>;

    const destDate = targetDateStr || existing.date;
    const destType = targetType || existing.type;

    const q = query(
      collection(db, `planners/${plannerId}/meals`),
      where('date', '==', destDate),
      where('type', '==', destType)
    );
    const slotSnaps = await getDocs(q);
    const maxOrder = slotSnaps.docs.length > 0 ? Math.max(...slotSnaps.docs.map(d => d.data().order || 0)) : 0;

    const newId = generateId();
    const newMeal = {
      ...existing,
      id: newId,
      date: destDate,
      type: destType,
      order: maxOrder + 1,
      createdAt: Date.now(),
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

export async function moveMealToSlot(
  plannerId: string,
  id: string,
  targetDateStr: string,
  targetType?: MealType
): Promise<StorageResult<MealEntry>> {
  const updates: Partial<MealEntry> = { date: targetDateStr };
  if (targetType) {
    updates.type = targetType;
  }
  return updateMeal(plannerId, id, updates);
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

export async function getPreviousWeekSummary(
  plannerId: string,
  targetWeekDate: Date
): Promise<StorageResult<WeekSummaryPreview>> {
  try {
    const targetStart = startOfWeek(targetWeekDate, { weekStartsOn: WEEK_STARTS_ON });
    const targetEnd = endOfWeek(targetWeekDate, { weekStartsOn: WEEK_STARTS_ON });
    const formattedTargetStart = format(targetStart, 'yyyy-MM-dd');
    const formattedTargetEnd = format(targetEnd, 'yyyy-MM-dd');

    const prevStart = subWeeks(targetStart, 1);
    const prevEnd = addDays(prevStart, 6);
    const formattedPrevStart = format(prevStart, 'yyyy-MM-dd');
    const formattedPrevEnd = format(prevEnd, 'yyyy-MM-dd');

    const prevQuery = query(
      collection(db, `planners/${plannerId}/meals`),
      where('date', '>=', formattedPrevStart),
      where('date', '<=', formattedPrevEnd)
    );
    const prevSnap = await getDocs(prevQuery);

    const targetQuery = query(
      collection(db, `planners/${plannerId}/meals`),
      where('date', '>=', formattedTargetStart),
      where('date', '<=', formattedTargetEnd)
    );
    const targetSnap = await getDocs(targetQuery);

    const sourceMeals = prevSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || '',
        date: data.date || '',
        type: data.type as MealType,
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    return {
      data: {
        prevWeekStartStr: formattedPrevStart,
        prevWeekEndStr: formattedPrevEnd,
        targetWeekStartStr: formattedTargetStart,
        targetWeekEndStr: formattedTargetEnd,
        sourceMealsCount: prevSnap.size,
        targetMealsCount: targetSnap.size,
        sourceMeals,
      },
      error: null,
    };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, `planners/${plannerId}/meals`);
    return { data: null, error: err.message || 'Failed to get previous week summary' };
  }
}

export async function copyPreviousWeekMeals(
  plannerId: string,
  targetWeekDate: Date,
  mode: CopyWeekMode = 'append'
): Promise<StorageResult<{ copiedCount: number }>> {
  try {
    const targetStart = startOfWeek(targetWeekDate, { weekStartsOn: WEEK_STARTS_ON });
    const targetEnd = endOfWeek(targetWeekDate, { weekStartsOn: WEEK_STARTS_ON });
    const targetStartStr = format(targetStart, 'yyyy-MM-dd');
    const targetEndStr = format(targetEnd, 'yyyy-MM-dd');

    const prevStart = subWeeks(targetStart, 1);
    const prevEnd = addDays(prevStart, 6);
    const prevStartStr = format(prevStart, 'yyyy-MM-dd');
    const prevEndStr = format(prevEnd, 'yyyy-MM-dd');

    const prevQuery = query(
      collection(db, `planners/${plannerId}/meals`),
      where('date', '>=', prevStartStr),
      where('date', '<=', prevEndStr)
    );
    const prevSnap = await getDocs(prevQuery);

    if (prevSnap.empty) {
      return { data: { copiedCount: 0 }, error: 'No meals found in the previous week to copy.' };
    }

    const batch = writeBatch(db);

    if (mode === 'replace') {
      const targetQuery = query(
        collection(db, `planners/${plannerId}/meals`),
        where('date', '>=', targetStartStr),
        where('date', '<=', targetEndStr)
      );
      const targetSnap = await getDocs(targetQuery);
      for (const targetDoc of targetSnap.docs) {
        batch.delete(targetDoc.ref);
        batch.delete(doc(db, `planners/${plannerId}/mealDetails`, targetDoc.id));
      }
    }

    for (const mealDoc of prevSnap.docs) {
      const oldMeal = mealDoc.data() as MealEntry;
      const oldMealId = mealDoc.id;

      const oldDate = parseISO(oldMeal.date);
      const newDate = addDays(oldDate, 7);
      const newDateStr = format(newDate, 'yyyy-MM-dd');

      const newId = generateId();
      const newMeal: any = {
        ...oldMeal,
        id: newId,
        date: newDateStr,
        createdAt: Date.now(),
      };

      const cleaned = cleanForStorage(newMeal);
      const newDocRef = doc(db, `planners/${plannerId}/meals`, newId);
      batch.set(newDocRef, cleaned);

      const detailDocRef = doc(db, `planners/${plannerId}/mealDetails`, oldMealId);
      const detailSnap = await getDoc(detailDocRef);
      if (detailSnap.exists()) {
        const newDetailRef = doc(db, `planners/${plannerId}/mealDetails`, newId);
        batch.set(newDetailRef, detailSnap.data());
      }
    }

    await batch.commit();

    return { data: { copiedCount: prevSnap.size }, error: null };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, `planners/${plannerId}/meals`);
    return { data: null, error: err.message || 'Failed to copy previous week meals' };
  }
}

