/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { addWeeks, subWeeks } from 'date-fns';
import { useState } from 'react';

export function useWeekNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextWeek = () => setCurrentDate((prev) => addWeeks(prev, 1));
  const prevWeek = () => setCurrentDate((prev) => subWeeks(prev, 1));
  const snapToToday = () => setCurrentDate(new Date());

  return {
    currentDate,
    nextWeek,
    prevWeek,
    snapToToday,
  };
}
