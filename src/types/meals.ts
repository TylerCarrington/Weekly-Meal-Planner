/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Defines the standard slots available for meal planning each day.
 */
export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Other = 'Other',
}

/**
 * Defines a single ingredient within a meal.
 */
export interface Ingredient {
  name: string;
  quantity: string;
}

/**
 * Represents a single meal scheduled in the planner.
 */
export interface MealEntry {
  id: string;
  name: string;
  /** The target date in YYYY-MM-DD format */
  date: string;
  /** The designated slot for the meal (e.g., Breakfast) */
  type: MealType;
  /** Positional order for drag-and-drop within the same slot */
  order: number;
  
  /** Indicates if this meal is linked to an external standard recipe */
  recipeId?: string;
  createdAt?: number;

  // Phase 4: Rich detail fields
  ingredients?: Ingredient[];
  sourceUrl?: string;
  notes?: string;
  directions?: string;
  labels?: string[];
  imageUrl?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  prepTime?: number; // In minutes
  cookTime?: number; // In minutes
  servings?: number;
  cuisineTag?: string;
  dietaryFlags?: string[];

  /** Computed total time (prepTime + cookTime). Never stored independently. */
  readonly totalTime?: number;
}

/**
 * A grouping of meals for a specific slot on a specific day.
 */
export interface MealSlot {
  type: MealType;
  meals: MealEntry[];
}

/**
 * Represents all meals planned for a given week.
 */
export interface WeeklyMealPlan {
  /** The week identifier, represented as the YYYY-MM-DD of its starting Sunday */
  weekKey: string;
  /** Flat array of all meal entries in this week, easily filtered by date/type for rendering */
  entries: MealEntry[];
}

export type CopyWeekMode = 'append' | 'replace';

export interface WeekSummaryPreview {
  prevWeekStartStr: string;
  prevWeekEndStr: string;
  targetWeekStartStr: string;
  targetWeekEndStr: string;
  sourceMealsCount: number;
  targetMealsCount: number;
  sourceMeals: Array<{ id: string; name: string; date: string; type: MealType }>;
}
