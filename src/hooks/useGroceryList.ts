import { useState, useCallback, useEffect } from 'react';
import { GroceryItem } from '../types/grocery';
import { buildGroceryListFromWeek, saveManualItem, toggleItemChecked, removeItem, clearCheckedItems } from '../storage/grocery';
import { getWeekKey, WEEK_STARTS_ON } from '../utils/dateUtils';
import { usePlanner } from '../contexts/PlannerContext';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export function useGroceryList(date: Date, isOpen: boolean) {
  const { activePlanner } = usePlanner();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const weekKey = getWeekKey(date);

  const start = startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
  const startStr = format(start, 'yyyy-MM-dd');
  const endStr = format(end, 'yyyy-MM-dd');

  const refreshList = useCallback(async () => {
    if (isOpen && activePlanner) {
      const list = await buildGroceryListFromWeek(activePlanner.id, weekKey, startStr, endStr);
      setItems(list);
    }
  }, [weekKey, isOpen, activePlanner, startStr, endStr]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const triggerRefresh = useCallback(() => {
    refreshList();
  }, [refreshList]);

  const addManualItem = useCallback(async (name: string, quantity: number, unit: string) => {
    if (!activePlanner) return;
    await saveManualItem(activePlanner.id, weekKey, name, quantity, unit);
    refreshList();
  }, [weekKey, refreshList, activePlanner]);

  const toggleItem = useCallback(async (id: string) => {
    if (!activePlanner) return;
    await toggleItemChecked(activePlanner.id, weekKey, id);
    refreshList();
  }, [weekKey, refreshList, activePlanner]);

  const remove = useCallback(async (id: string) => {
    if (!activePlanner) return;
    await removeItem(activePlanner.id, weekKey, id);
    refreshList();
  }, [weekKey, refreshList, activePlanner]);

  const clearChecked = useCallback(async () => {
    if (!activePlanner) return;
    await clearCheckedItems(activePlanner.id, weekKey);
    refreshList();
  }, [weekKey, refreshList, activePlanner]);

  return { 
    items, 
    addManualItem, 
    toggleItem, 
    removeItem: remove, 
    clearChecked,
    refreshList: triggerRefresh
  };
}
