/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ingredient } from './meals';

/**
 * Represents a reusable recipe, completely detached from the weekly meal plan.
 * Contains identical rich fields as MealEntry, plus lifecycle metadata.
 */
export interface Recipe {
  id: string;
  name: string;

  // Rich fields mirrored from MealDetail concepts
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

  // Recipe-specific lifecycle metadata
  createdAt: number;
  updatedAt: number;
  timesUsed: number;
}
