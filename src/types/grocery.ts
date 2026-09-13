/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a single item on the grocery list.
 */
export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  mealSource: string[]; // Names of meals this item comes from
  isManual: boolean;    // Tells if this was manually added
}

/**
 * Represents the persistent state of a week's grocery list.
 * Auto-generated items are not stored here (they are derived),
 * only manually added items, checked statuses, and removed auto-items.
 */
export interface GroceryListState {
  manualItems: GroceryItem[];
  checkedIds: string[];
  removedIds: string[]; // IDs of auto-generated items that the user chose to remove
}

export interface GroceryList {
  weekKey: string;
  items: GroceryItem[];
}