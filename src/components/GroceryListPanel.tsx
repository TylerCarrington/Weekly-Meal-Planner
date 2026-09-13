import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, Plus, Check, Trash2, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { GroceryItem } from '../types/grocery';

interface GroceryListPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: GroceryItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddManualItem: (name: string, quantity: number, unit: string) => void;
  onClearChecked: () => void;
}

export function GroceryListPanel({
  isOpen,
  onClose,
  items,
  onToggleItem,
  onRemoveItem,
  onAddManualItem,
  onClearChecked,
}: GroceryListPanelProps) {
  const [addName, setAddName] = useState('');
  const [addQuantity, setAddQuantity] = useState('1');
  const [addUnit, setAddUnit] = useState('');

  // Prevent body scrolling when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Pressing Escape closes the panel
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    
    const qty = parseFloat(addQuantity);
    onAddManualItem(addName.trim(), isNaN(qty) ? 1 : qty, addUnit.trim());
    setAddName('');
    setAddQuantity('1');
    setAddUnit('');
  };

  if (!isOpen) return null;

  const hasChecked = items.some(item => item.checked);

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-slate-50 shadow-2xl transition-transform sm:w-[480px] dark:bg-[#0f172a]">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <ShoppingCart className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold">Grocery List</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleAddSubmit} className="mb-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add Item</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Item name..."
                required
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              />
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Qty"
                value={addQuantity}
                onChange={(e) => setAddQuantity(e.target.value)}
                className="w-20 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              />
              <input
                type="text"
                placeholder="Unit"
                value={addUnit}
                onChange={(e) => setAddUnit(e.target.value)}
                className="w-20 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              />
              <button 
                type="submit"
                className="flex shrink-0 items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </form>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
              <ShoppingCart className="mb-4 h-12 w-12 opacity-50" />
              <p>Your grocery list is empty.</p>
              <p className="mt-2 text-sm">Add ingredients to your meals or type above to add manually.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className={cn(
                    "group flex items-center justify-between rounded-lg border p-3 transition-colors",
                    item.checked 
                      ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" 
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
                  )}
                >
                  <div 
                    onClick={() => onToggleItem(item.id)}
                    className="flex flex-1 cursor-pointer items-center gap-4"
                  >
                    <div className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                      item.checked 
                        ? "border-indigo-500 bg-indigo-500 text-white" 
                        : "border-slate-300 text-transparent dark:border-slate-600"
                    )}>
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={cn(
                        "font-medium text-slate-800 transition-all dark:text-slate-200",
                        item.checked && "text-slate-400 line-through dark:text-slate-500"
                      )}>
                        {item.name}
                      </span>
                      {(item.quantity > 0 || item.unit) && (
                        <span className={cn(
                          "ml-2 text-sm text-slate-500 dark:text-slate-400",
                          item.checked && "text-slate-400 opacity-70 dark:text-slate-600"
                        )}>
                          {item.quantity > 0 && item.quantity} {item.unit}
                        </span>
                      )}
                      
                      {!item.isManual && item.mealSource.length > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          <Info className="h-3 w-3" />
                          <span>From: {item.mealSource.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="ml-4 rounded p-1.5 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 sm:opacity-100 dark:hover:bg-red-950/30"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {hasChecked && (
          <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={onClearChecked}
              className="w-full rounded-lg bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Clear Checked Items
            </button>
          </div>
        )}
      </div>
    </>
  );
}