/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MealEntry } from '../types/meals';

/**
 * Checks if a meal contains any rich details to determine
 * whether its chip should display the detail indicator dot.
 */
export function hasRichDetails(meal: MealEntry): boolean {
  return Boolean(
    (meal.ingredients && meal.ingredients.length > 0) ||
    meal.sourceUrl ||
    meal.notes ||
    meal.directions ||
    (meal.labels && meal.labels.length > 0) ||
    meal.imageUrl ||
    meal.rating ||
    meal.prepTime ||
    meal.cookTime ||
    meal.servings ||
    meal.cuisineTag ||
    (meal.dietaryFlags && meal.dietaryFlags.length > 0)
  );
}
