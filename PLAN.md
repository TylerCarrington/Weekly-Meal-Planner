# Weekly Planner App — Phased Implementation Plan

## Vision
A digital weekly planner that mirrors the experience of a physical planner. The first feature is meal planning, with future phases adding calendar events, appointments, sports, habits, notes, and more — all organized around a weekly view.

---

## Phase 1 — Core Weekly Planner View
**Goal**: Build the weekly grid, week navigation, mobile layout, and dark mode. This is the foundation every future feature builds on. No features live inside the grid yet — only the structure.

### Deliverables
- Weekly grid: 7 rows (Mon–Sun), flexible column structure ready to receive future content types
- Week navigation: ← / → buttons and a Today button, with the current date range in the header
- Today's row is subtly highlighted
- Empty state placeholder in each day row
- Dark mode toggle — persists across sessions; all colors use theme tokens, never hardcoded
- Fully responsive layout — usable and readable on mobile, tablet, and desktop

### Verification Steps
1. The current week is shown on load with today highlighted
2. ← and → navigate weeks; the header date range updates
3. Today snaps back to the current week
4. The grid is empty and structurally ready for future content
5. Dark mode toggle works; preference is remembered after refresh
6. Layout is clean and usable on a 375px wide mobile screen

---

## Phase 2 — Meal Slots (Data Model & Storage Only)
**Goal**: Define the meal data model and all storage functions. No UI yet.

### Deliverables
- `types/meals.ts` — MealEntry, MealSlot, MealType (Breakfast, Lunch, Dinner, Other), WeeklyMealPlan types
- `storage/meals.ts` — getMealsForWeek, saveMeal, deleteMeal, updateMeal, duplicateMeal functions
- All functions handle errors gracefully and return typed results

### Verification Steps
1. Types file exists and is fully documented
2. Storage functions are independently testable
3. No UI code exists in this phase

---

## Phase 3 — Meal Slot UI
**Goal**: Render meal slots in the weekly grid and allow quick meal name entry.

### Deliverables
- Each day row shows 4 meal slots: Breakfast, Lunch, Dinner, Other
- Single-click activates an inline text input
- Enter or blur saves the meal name as a chip/pill
- × removes the meal; clicking a chip opens rename mode
- Each slot supports multiple meals
- Duplicate button on each chip — copies the meal to the same slot instantly
- A `useMeals` custom hook owns all meal state

### Verification Steps
1. Click a slot — input appears with immediate focus
2. Type and Enter — chip appears
3. Refresh — chip persists
4. Two meals in one slot — both chips visible
5. × removes the correct chip
6. Duplicate button creates an identical chip in the same slot

---

## Phase 4 — Meal Detail Panel (Data Model & Storage Only)
**Goal**: Extend the meal data model to support rich detail fields.

### Deliverables
- Extend `types/meals.ts` with: ingredients (with name and quantity), sourceUrl, notes, directions, labels, imageUrl, rating (1–5), prepTime (minutes), cookTime (minutes), totalTime (computed: prepTime + cookTime), servings, cuisineTag, dietaryFlags
- Extend `storage/meals.ts` with updateMealDetail and getMealDetail functions
- totalTime is always computed, never stored independently

### Verification Steps
1. All new fields are optional and typed
2. totalTime cannot be set directly — it is always derived
3. Existing Phase 3 meal storage functions still work unchanged

---

## Phase 5 — Meal Detail Panel UI
**Goal**: A slide-in panel for viewing and editing full meal details.

### Deliverables
- Clicking a meal chip opens a detail panel from the right
- Fields: Name, Ingredients (each with name + quantity), Source URL, Notes, Directions, Labels, Image URL, Star Rating (1–5, clickable), Prep Time, Cook Time, Total Time (auto-calculated, read-only), Servings, Cuisine, Dietary Flags
- Auto-saves on blur/change — no save button
- Chips with any detail data show a small indicator dot
- A `useMealDetail` hook owns panel state

### Verification Steps
1. Click chip — panel slides in
2. All fields editable and auto-saving
3. Labels render as colored tags
4. Image URL shows thumbnail
5. Star rating is clickable and saves correctly
6. Total Time updates automatically when Prep or Cook Time changes
7. Close and reopen — all data intact
8. Chip shows indicator dot when details exist

---

## Phase 6 — Drag and Drop for Meals
**Goal**: Allow meals to be reordered and moved between slots by dragging.

### Deliverables
- Meal chips are draggable within and between meal slots and day rows
- Dropping a chip onto a different slot moves it there
- Dropping onto the same slot reorders among that slot's chips
- Drag state is visually clear — dragged chip shows reduced opacity; valid drop targets highlight
- Works on both mouse and touch (mobile)
- All moves persist to storage immediately

### Verification Steps
1. Drag a chip to a different day's slot — it moves and persists after refresh
2. Drag within the same slot — order changes and persists
3. Visual feedback is clear during drag
4. Works on a touch screen
5. Detail data travels with the chip when moved

---

## Phase 7 — Recipe Manager (Data Model & Storage Only)
**Goal**: Define the recipe data model and storage, separate from the weekly plan.

### Deliverables
- `types/recipes.ts` — Recipe type (same rich fields as MealDetail, plus createdAt, updatedAt, timesUsed)
- `storage/recipes.ts` — getRecipes, saveRecipe, updateRecipe, deleteRecipe, linkRecipeToMeal, getRecipeUsageHistory
- Recipes are linked to meal slots by reference (ID), not copied
- duplicateRecipe function included

### Verification Steps
1. Recipe type is fully documented
2. linkRecipeToMeal stores only the recipe ID in the meal slot
3. No UI code in this phase

---

## Phase 8 — Recipe Manager UI
**Goal**: A recipe library screen where users manage and reuse recipes.

### Deliverables
- Recipes section in app navigation
- Add/edit/delete/duplicate recipes
- Search by name; filter by label, cuisine, dietary flag
- Sort by: Recently Added, Alphabetical, Rating, Times Used
- "Add to Week" assigns a recipe to a day/slot by reference
- Editing a recipe name updates it everywhere it appears in the planner
- Meal rotation warning: subtle indicator if the same recipe appears within the past 2 weeks
- A `useRecipes` hook owns all recipe state

### Verification Steps
1. Add 3 recipes with different labels — all appear in the list
2. Search and filter work instantly
3. Add to Week — recipe chip appears on the planner
4. Edit recipe name — planner chip updates
5. Duplicate a recipe — a copy appears in the list
6. Use a recipe two weeks in a row — a rotation warning appears

---

## Phase 9 — Grocery List (Data Model & Storage Only)
**Goal**: Define the grocery list data model and aggregation logic.

### Deliverables
- `types/grocery.ts` — GroceryItem (name, quantity, unit, checked, mealSource) and GroceryList types
- `storage/grocery.ts` — buildGroceryListFromWeek, saveManualItem, toggleItemChecked, removeItem, clearCheckedItems
- Ingredient quantities from multiple meals sharing the same ingredient name and unit are summed
- Manual items are stored separately from auto-generated items but display together

### Verification Steps
1. buildGroceryListFromWeek correctly aggregates all meal ingredients for a given week
2. Two meals sharing an ingredient and unit — quantities are summed into one line
3. Different units for the same ingredient name are kept as separate lines
4. Manual items persist independently of meal data
5. No UI code in this phase

---

## Phase 10 — Grocery List UI
**Goal**: A fast, tap-friendly grocery list panel for use while shopping.

### Deliverables
- Grocery List panel accessible from the weekly view header
- Auto-populates from the current week's meal ingredients
- Each item has a large tap target checkbox — checked items visually strike through
- Manual add field at the top — type and Enter to add
- Remove button on each item
- "Clear Checked" button removes all checked items at once
- Checked state persists — refreshing the page preserves what you've ticked off
- A `useGroceryList` hook owns all state

### Verification Steps
1. Add meals with ingredients — grocery list auto-populates
2. Two meals sharing an ingredient and unit — quantity is summed into one line
3. Tap checkbox — item strikes through; state persists after refresh
4. Add a manual item — appears in the list and persists
5. Remove an item — it disappears immediately
6. Clear Checked removes only checked items

---

## Phase 11 — Calendar Events (Data Model & Storage Only)
**Goal**: Define a general calendar event model that can coexist with meals in the weekly grid.

### Deliverables
- `types/events.ts` — CalendarEvent type with: title, startTime, endTime, location, notes, category (Appointment, Sports, Special Event, Custom), colorLabel
- `storage/events.ts` — getEventsForWeek, saveEvent, updateEvent, deleteEvent, duplicateEvent
- Events and meals use the same week-key format for consistent lookup

### Verification Steps
1. Event type supports all categories
2. Events and meals use the same week-key format
3. No UI in this phase

---

## Phase 12 — Calendar Events UI
**Goal**: Render events in the weekly grid alongside meals.

### Deliverables
- Each day row can display both meals and events
- Quick-add event input per day row
- Events display as distinct blocks from meal chips (different shape/color treatment)
- Click an event to open a detail panel
- Category sets the event's color label
- Events are draggable between days (same drag system as meals)
- A `useEvents` hook owns all event state

### Verification Steps
1. Add an event to a day — it appears distinctly from meal chips
2. Events and meals coexist cleanly in the same row
3. Click event — detail panel opens with all fields editable
4. Category change updates the event's color
5. Drag an event to a different day — it moves and persists

---

## Phase 13 — Sharing & Real-Time Sync
**Goal**: Share the full planner (meals + events) with other Google users.

### Deliverables
- Share button in the planner header
- Enter a Google email to grant access
- All planner data is shared (meals, events, grocery list)
- Changes reflect for all users within ~2–3 seconds
- Collaborator initials shown in the header
- Optional View vs. Edit permission levels

### Verification Steps
1. Share dialog accepts a Google email
2. Second account sees the same planner
3. Edit from Account A — Account B sees it within 3 seconds
4. Both accounts' initials appear in the header

---

## Phase 14 — Power Planner Features
**Goal**: Add features that make this feel like a complete physical planner replacement.

### Deliverables
- **Habit Tracker** — daily checkboxes for recurring habits in the weekly view
- **Weekly Notes** — free-text notes area per week (goals, reflections, to-dos)
- **Copy Week** — duplicate any week's meals and events to another week
- **Templates** — save a week as a named template; apply to any empty week
- **Print / PDF Export** — clean, planner-style print view

### Verification Steps
1. Habits persist per day and reset each new week
2. Weekly notes are unique per week and persist
3. Copy Week duplicates all data to the target week
4. Templates apply to empty weeks without overwriting existing data
5. Print view is clean and planner-style

---

## Build Order

| Phase | Feature | Effort | Dependency |
|---|---|---|---|
| 1 | Weekly Grid + Dark Mode + Mobile | Low | None |
| 2 | Meal Data Model | Low | Phase 1 |
| 3 | Meal Slot UI | Medium | Phase 2 |
| 4 | Meal Detail Data Model | Low | Phase 3 |
| 5 | Meal Detail UI | Medium | Phase 4 |
| 6 | Drag and Drop | Medium | Phase 5 |
| 7 | Recipe Data Model | Low | Phase 6 |
| 8 | Recipe Manager UI | Medium | Phase 7 |
| 9 | Grocery List Data Model | Low | Phase 8 |
| 10 | Grocery List UI | Medium | Phase 9 |
| 11 | Events Data Model | Low | Phase 1 |
| 12 | Events UI | Medium | Phase 11 |
| 13 | Sharing & Sync | High | Phase 10 + 12 |
| 14 | Power Features | Medium | All above |
