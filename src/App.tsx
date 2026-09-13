/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header, AppTab } from './components/Header';
import { WeeklyGrid } from './components/WeeklyGrid';
import { MealDetailPanel } from './components/MealDetailPanel';
import { EventDetailPanel } from './components/EventDetailPanel';
import { GroceryListPanel } from './components/GroceryListPanel';
import { RecipeManager } from './components/recipes/RecipeManager';
import { MoveCopyMealModal } from './components/MoveCopyMealModal';
import { CopyWeekModal } from './components/CopyWeekModal';
import { usePlanner } from './contexts/PlannerContext';
import { useAuth } from './contexts/AuthContext';
import { useWeekNavigation } from './hooks/useWeekNavigation';
import { useWeeklyTheme } from './hooks/useWeeklyTheme';
import { useMeals } from './hooks/useMeals';
import { useEvents } from './hooks/useEvents';
import { useMealDetail } from './hooks/useMealDetail';
import { useGroceryList } from './hooks/useGroceryList';
import { getDaysInWeek, getWeekRangeHeader } from './utils/dateUtils';
import { CalendarEvent, EventCategory } from './types/events';
import { MealEntry } from './types/meals';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('planner');
  const [isGroceryOpen, setIsGroceryOpen] = useState(false);
  const [isCopyWeekOpen, setIsCopyWeekOpen] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [moveCopyTargetMeal, setMoveCopyTargetMeal] = useState<MealEntry | null>(null);
  
  const { user, loading: authLoading, signIn } = useAuth();
  const { planners, activePlanner, loading: plannerLoading, error: plannerError } = usePlanner();
  const { theme, toggleTheme } = useWeeklyTheme();
  const { currentDate, nextWeek, prevWeek, snapToToday } = useWeekNavigation();
  const { entries, recentRecipeIds, addMeal, addMealFromRecipe, editMealName, removeMeal, copyMeal, moveMeal, moveMealToDate, refreshMeals } = useMeals(currentDate);
  const { events, addEvent, editEvent, removeEvent, copyEvent, moveEvent, refreshEvents } = useEvents(currentDate);
  const { activeMealId, meal: activeMealDetail, openPanel, closePanel, updateDetail } = useMealDetail();
  
  const grocery = useGroceryList(currentDate, isGroceryOpen);

  if (authLoading || plannerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="ml-4 font-medium text-slate-600 dark:text-slate-400">
          {authLoading ? "Authenticating..." : "Loading your planners..."}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0f172a] p-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-indigo-500/20 shadow-xl">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">ChefPlanner</h1>
            <p className="text-slate-600 dark:text-slate-400">Plan your weekly meals together. Collaborate, cook, and enjoy.</p>
          </div>
          <button 
            onClick={signIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-95"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!activePlanner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0f172a] p-4 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {plannerError ? "Connection Error" : "Access Restricted"}
          </h1>
          <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-400">
            {plannerError || (planners.length === 0 
              ? "We couldn't find any planner for your account. Please wait or refresh." 
              : "Please select a planner to continue.")}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const days = getDaysInWeek(currentDate);
  const weekRange = getWeekRangeHeader(currentDate);

  const handleUpdateDetail = (updates: any) => {
    updateDetail(updates);
    refreshMeals();
    grocery.refreshList();
  };

  const handlePanelClose = () => {
    closePanel();
    refreshMeals();
    grocery.refreshList();
  };

  const handleAddMealFromRecipe = (recipeOrId: any, nameOrDateStr: string, dateStrOrType?: any, maybeType?: any) => {
    addMealFromRecipe(recipeOrId, nameOrDateStr, dateStrOrType, maybeType);
    setCurrentTab('planner');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50/60 via-sky-50/40 to-amber-50/50 font-sans transition-colors duration-300 dark:from-[#0f172a] dark:via-[#0f172a] dark:to-[#0f172a]">
      <Header
        title={weekRange}
        theme={theme}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onToggleTheme={toggleTheme}
        onPrevWeek={prevWeek}
        onNextWeek={nextWeek}
        onToday={snapToToday}
        onOpenGrocery={() => setIsGroceryOpen(true)}
        onCopyPreviousWeek={() => setIsCopyWeekOpen(true)}
      />
      
      {plannerError && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-8">
          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <span>{plannerError}</span>
          </div>
        </div>
      )}
      
      <main className="py-6 sm:py-12">
        {currentTab === 'planner' ? (
          <>
            <div className="mb-8 px-4 text-center sm:px-0 lg:hidden">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {weekRange}
              </h2>
            </div>
            <WeeklyGrid 
              days={days} 
              entries={entries}
              events={events}
              recentRecipeIds={recentRecipeIds}
              onAddMeal={addMeal}
              onAddMealFromRecipe={handleAddMealFromRecipe}
              onUpdateMeal={editMealName}
              onDeleteMeal={removeMeal}
              onDuplicateMeal={copyMeal}
              onOpenDetail={openPanel}
              onOpenMoveCopyModal={setMoveCopyTargetMeal}
              onMoveMeal={moveMeal}
              onMoveMealToDate={moveMealToDate}
              onAddEvent={addEvent}
              onDeleteEvent={removeEvent}
              onDuplicateEvent={copyEvent}
              onOpenEventDetail={setActiveEventId}
              onMoveEvent={moveEvent}
              onCopyPreviousWeek={() => setIsCopyWeekOpen(true)}
            />
          </>
        ) : (
          <RecipeManager onAddMealFromRecipe={handleAddMealFromRecipe} />
        )}
      </main>

      <CopyWeekModal
        isOpen={isCopyWeekOpen}
        targetDate={currentDate}
        onClose={() => setIsCopyWeekOpen(false)}
        onSuccess={() => {
          grocery.refreshList();
        }}
      />

      <MealDetailPanel 
        isOpen={!!activeMealId}
        meal={activeMealDetail}
        onClose={handlePanelClose}
        onUpdate={handleUpdateDetail}
        onDuplicate={copyMeal}
        onMove={moveMealToDate}
        onOpenMoveCopyModal={setMoveCopyTargetMeal}
      />

      <MoveCopyMealModal
        isOpen={Boolean(moveCopyTargetMeal)}
        meal={moveCopyTargetMeal}
        onClose={() => setMoveCopyTargetMeal(null)}
        onCopy={(id, targetDate, targetType) => copyMeal(id, targetDate, targetType)}
        onMove={(id, targetDate, targetType) => moveMealToDate(id, targetDate, targetType)}
      />

      <EventDetailPanel
        isOpen={!!activeEventId}
        event={activeEventId ? events.find(e => e.id === activeEventId) || null : null}
        onClose={() => setActiveEventId(null)}
        onUpdate={editEvent}
      />

      <GroceryListPanel 
        isOpen={isGroceryOpen}
        onClose={() => setIsGroceryOpen(false)}
        items={grocery.items}
        onToggleItem={grocery.toggleItem}
        onRemoveItem={grocery.removeItem}
        onAddManualItem={grocery.addManualItem}
        onClearChecked={grocery.clearChecked}
      />

      <footer className="mx-auto flex max-w-7xl items-center justify-between px-8 py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        <div className="flex gap-4">
          <span>Phase 12</span>
          <span>&bull;</span>
          <span>Calendar Events</span>
        </div>
        <div className="hidden gap-4 sm:flex">
          <span>Theme: Persistent</span>
          <span>Responsive: Enabled</span>
        </div>
      </footer>
    </div>
  );
}


