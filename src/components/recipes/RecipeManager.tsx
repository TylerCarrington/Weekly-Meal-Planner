import React, { useState } from 'react';
import { Search, Plus, Filter, ChefHat } from 'lucide-react';
import { useRecipes, RecipeSortMethod } from '../../hooks/useRecipes';
import { RecipeCard } from './RecipeCard';
import { Recipe } from '../../types/recipes';
import { AddToWeekModal } from './AddToWeekModal';
import { MealDetailPanel } from '../MealDetailPanel';
import { MealType } from '../../types/meals';

interface RecipeManagerProps {
  onAddMealFromRecipe: (recipeId: string, name: string, dateStr: string, type: MealType) => void;
}

export function RecipeManager({ onAddMealFromRecipe }: RecipeManagerProps) {
  const { 
    recipes, 
    allRecipes,
    addRecipe, 
    editRecipe, 
    removeRecipe, 
    copyRecipe,
    searchQuery, setSearchQuery,
    labelFilter, setLabelFilter,
    cuisineFilter, setCuisineFilter,
    dietaryFilter, setDietaryFilter,
    sortBy, setSortBy
  } = useRecipes();

  const [activeRecipeForEdit, setActiveRecipeForEdit] = useState<Recipe | null>(null);
  const [activeRecipeForWeek, setActiveRecipeForWeek] = useState<Recipe | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Dynamic distinct lists extracted physically natively from available recipes globally to power the dropdowns cleanly automatically without strict arrays externally natively
  const allLabels = Array.from(new Set(allRecipes.flatMap(r => r.labels || []))).sort();
  const allCuisines = Array.from(new Set(allRecipes.map(r => r.cuisineTag).filter(Boolean) as string[])).sort();
  const allDietary = Array.from(new Set(allRecipes.flatMap(r => r.dietaryFlags || []))).sort();

  const handleCreateNew = () => {
    const created = addRecipe('New Recipe');
    if (created) {
      setActiveRecipeForEdit(created);
    }
  };

  const handleUpdateActiveRecipe = (updates: any) => {
    if (activeRecipeForEdit) {
      editRecipe(activeRecipeForEdit.id, updates);
      setActiveRecipeForEdit({ ...activeRecipeForEdit, ...updates } as Recipe);
    }
  };

  const confirmAddToWeek = (recipeId: string, name: string, dateStr: string, type: MealType) => {
    onAddMealFromRecipe(recipeId, name, dateStr, type);
    setActiveRecipeForWeek(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
      {/* Header & Main Controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Recipe Library</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and reuse your favorite recipes anywhere within your planner.</p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:from-violet-700 hover:to-indigo-700 active:scale-95 transition-all dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <Plus className="h-5 w-5" /> New Recipe
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-purple-100/90 bg-white/90 p-4 shadow-2xs sm:flex-row sm:items-center sm:gap-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-purple-200/70 bg-purple-50/30 py-2 pl-9 pr-4 text-sm font-medium text-slate-900 outline-none focus:border-violet-500 focus:bg-white focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 rounded-xl border border-purple-200/80 bg-purple-50/70 px-3.5 py-2 text-sm font-semibold text-purple-900 shadow-2xs hover:bg-purple-100/80 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Filter className="h-4 w-4" /> Filters
            {Boolean(labelFilter || cuisineFilter || dietaryFilter) && (
              <span className="flex h-2 w-2 rounded-full bg-violet-600" />
            )}
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as RecipeSortMethod)}
            className="rounded-xl border border-purple-200/80 bg-purple-50/70 px-3 py-2 text-sm font-semibold text-purple-900 shadow-2xs outline-none hover:bg-purple-100/80 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="recent">Recently Added</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="rating">Top Rated</option>
            <option value="uses">Times Used</option>
          </select>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-purple-100 bg-purple-50/60 p-4 sm:grid-cols-3 dark:border-indigo-500/20 dark:bg-indigo-500/5">
          <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)} className="rounded-xl border border-purple-200/80 bg-white p-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <option value="">All Labels</option>
            {allLabels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)} className="rounded-xl border border-purple-200/80 bg-white p-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <option value="">All Cuisines</option>
            {allCuisines.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={dietaryFilter} onChange={(e) => setDietaryFilter(e.target.value)} className="rounded-xl border border-purple-200/80 bg-white p-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <option value="">All Dietary Flags</option>
            {allDietary.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}

      {/* Recipe Grid */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={setActiveRecipeForEdit}
              onDelete={removeRecipe}
              onDuplicate={copyRecipe}
              onAddToWeek={setActiveRecipeForWeek}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-24 text-slate-500 dark:border-slate-800">
          <ChefHat className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-medium text-slate-900 dark:text-slate-300">No recipes found</p>
          <p className="text-sm">Adjust your filters or add a new recipe.</p>
        </div>
      )}

      {/* Editor Modal Reuse (duck-typing through explicit unforced cast seamlessly effectively allowing complete subcomponent parity flawlessly instantly logically natively reliably) */}
      <MealDetailPanel 
        isOpen={!!activeRecipeForEdit}
        meal={activeRecipeForEdit as any}
        onClose={() => setActiveRecipeForEdit(null)}
        onUpdate={handleUpdateActiveRecipe}
      />

      {activeRecipeForWeek && (
        <AddToWeekModal
          recipe={activeRecipeForWeek}
          onClose={() => setActiveRecipeForWeek(null)}
          onConfirm={confirmAddToWeek}
        />
      )}
    </div>
  );
}