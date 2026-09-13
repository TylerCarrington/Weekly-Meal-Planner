/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Theme } from '../types';

export function useWeeklyTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('planner-theme-mode');
    if (saved === 'light' || saved === 'dark') return saved;
    // Default to light mode for the user's bright pastel request
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('planner-theme-mode', theme);
    localStorage.setItem('planner-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}
