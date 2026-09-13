/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getMealDetail } from './meals';
import { GroceryItem, GroceryListState } from '../types/grocery';
import { db } from '../lib/firebase';
import { collection, doc, query, where, getDocs, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export function parseIngredientQuantity(quantityStr: string): { amount: number; unit: string } {
  if (!quantityStr) {
    return { amount: 0, unit: '' };
  }
  
  const normalized = quantityStr.trim();
  const fractionMatch = normalized.match(/^(\d+[\s-]+\d+\/\d+|\d+\/\d+|\d*\.?\d+)\s*(.*)$/);
  
  if (!fractionMatch) {
    return { amount: 0, unit: normalized };
  }
  
  const numStr = fractionMatch[1];
  const unit = fractionMatch[2].trim();
  
  let amount = 0;
  if (numStr.includes('/')) {
    const parts = numStr.split(/[\s-]+/);
    if (parts.length === 2) {
      const whole = parseFloat(parts[0]);
      const [n, d] = parts[1].split('/');
      amount = whole + (parseFloat(n) / parseFloat(d));
    } else {
      const [n, d] = parts[0].split('/');
      amount = parseFloat(n) / parseFloat(d);
    }
  } else {
    amount = parseFloat(numStr);
  }
  
  return { amount: isNaN(amount) ? 0 : amount, unit };
}

async function getGroceryState(plannerId: string, weekKey: string): Promise<GroceryListState> {
  const docRef = doc(db, `planners/${plannerId}/groceryStates`, weekKey);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as GroceryListState;
  }
  return { manualItems: [], checkedIds: [], removedIds: [] };
}

import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

async function saveGroceryState(plannerId: string, weekKey: string, state: GroceryListState) {
  try {
    const docRef = doc(db, `planners/${plannerId}/groceryStates`, weekKey);
    await setDoc(docRef, state);
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `planners/${plannerId}/groceryStates/${weekKey}`);
    throw err;
  }
}

export async function buildGroceryListFromWeek(plannerId: string, weekKey: string, startStr: string, endStr: string): Promise<GroceryItem[]> {
  const state = await getGroceryState(plannerId, weekKey);
  
  const autoMap = new Map<string, GroceryItem>();
  
  const q = query(
    collection(db, `planners/${plannerId}/meals`),
    where('date', '>=', startStr),
    where('date', '<=', endStr)
  );
  
  const snap = await getDocs(q);
  
  for (const doc of snap.docs) {
    const rawMeal = doc.data();
    const detailRes = await getMealDetail(plannerId, doc.id);
    const meal = detailRes.data || rawMeal;

    if (meal.ingredients && meal.ingredients.length > 0) {
      for (const ing of meal.ingredients) {
        if (!ing.name.trim()) continue;

        const parsed = parseIngredientQuantity(ing.quantity);
        const nameLower = ing.name.trim().toLowerCase();
        const unitLower = parsed.unit.toLowerCase();
        
        const autoId = `auto_${nameLower}_${unitLower}`;
        
        if (state.removedIds.includes(autoId)) {
          continue;
        }
        
        if (autoMap.has(autoId)) {
          const existing = autoMap.get(autoId)!;
          existing.quantity += parsed.amount;
          if (!existing.mealSource.includes(meal.name)) {
            existing.mealSource.push(meal.name);
          }
        } else {
          autoMap.set(autoId, {
            id: autoId,
            name: ing.name.trim(),
            quantity: parsed.amount,
            unit: parsed.unit,
            checked: state.checkedIds.includes(autoId),
            mealSource: [meal.name],
            isManual: false
          });
        }
      }
    }
  }
  
  const autoItems = Array.from(autoMap.values());
  const manualItems = state.manualItems.map(m => ({
    ...m,
    checked: state.checkedIds.includes(m.id)
  }));
  
  return [...autoItems, ...manualItems];
}

export async function saveManualItem(plannerId: string, weekKey: string, name: string, quantity: number, unit: string): Promise<void> {
  const state = await getGroceryState(plannerId, weekKey);
  const newItem: GroceryItem = {
    id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    quantity,
    unit,
    checked: false,
    mealSource: [],
    isManual: true
  };
  state.manualItems.push(newItem);
  await saveGroceryState(plannerId, weekKey, state);
}

export async function toggleItemChecked(plannerId: string, weekKey: string, itemId: string) {
  const state = await getGroceryState(plannerId, weekKey);
  const idx = state.checkedIds.indexOf(itemId);
  if (idx >= 0) {
    state.checkedIds.splice(idx, 1);
  } else {
    state.checkedIds.push(itemId);
  }
  await saveGroceryState(plannerId, weekKey, state);
}

export async function removeItem(plannerId: string, weekKey: string, itemId: string) {
  const state = await getGroceryState(plannerId, weekKey);
  if (itemId.startsWith('manual_')) {
    state.manualItems = state.manualItems.filter(m => m.id !== itemId);
  } else {
    if (!state.removedIds.includes(itemId)) {
      state.removedIds.push(itemId);
    }
  }
  state.checkedIds = state.checkedIds.filter(id => id !== itemId);
  await saveGroceryState(plannerId, weekKey, state);
}

export async function clearCheckedItems(plannerId: string, weekKey: string) {
  const state = await getGroceryState(plannerId, weekKey);
  state.manualItems = state.manualItems.filter(m => !state.checkedIds.includes(m.id));
  
  for (const id of state.checkedIds) {
    if (id.startsWith('auto_')) {
      if (!state.removedIds.includes(id)) {
        state.removedIds.push(id);
      }
    }
  }
  state.checkedIds = [];
  await saveGroceryState(plannerId, weekKey, state);
}
