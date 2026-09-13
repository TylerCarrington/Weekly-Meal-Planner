import { useState, useCallback, useEffect } from 'react';
import { CalendarEvent, EventCategory } from '../types/events';
import { saveEvent, updateEvent, deleteEvent, duplicateEvent } from '../storage/events';
import { getWeekKey, WEEK_STARTS_ON } from '../utils/dateUtils';
import { usePlanner } from '../contexts/PlannerContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export function useEvents(currentDate: Date | string) {
  const { activePlanner } = usePlanner();
  const [entries, setEntries] = useState<CalendarEvent[]>([]);
  const weekKey = getWeekKey(currentDate);

  useEffect(() => {
    if (!activePlanner) return;

    // Use viewDate based logic if currentDate is a string or Date
    const viewDate = typeof currentDate === 'string' ? new Date(currentDate) : currentDate;
    const start = startOfWeek(viewDate, { weekStartsOn: WEEK_STARTS_ON });
    const end = endOfWeek(viewDate, { weekStartsOn: WEEK_STARTS_ON });
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    const q = query(
      collection(db, `planners/${activePlanner.id}/events`),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
      setEntries(dbEntries);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `planners/${activePlanner.id}/events`);
    });

    return () => unsubscribe();
  }, [currentDate, activePlanner]);

  const addEvent = useCallback(async (dateStr: string, title: string, category: EventCategory = 'Custom') => {
    if (!activePlanner) return;
    await saveEvent(activePlanner.id, {
      date: dateStr,
      title,
      category,
    });
  }, [activePlanner]);

  const editEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    if (!activePlanner) return;
    await updateEvent(activePlanner.id, id, updates);
  }, [activePlanner]);

  const removeEvent = useCallback(async (id: string) => {
    if (!activePlanner) return;
    await deleteEvent(activePlanner.id, id);
  }, [activePlanner]);

  const copyEvent = useCallback(async (id: string, targetDateStr?: string) => {
    if (!activePlanner) return;
    await duplicateEvent(activePlanner.id, id, targetDateStr);
  }, [activePlanner]);

  const moveEvent = useCallback(async (activeId: string, overId: string) => {
    if (!activePlanner) return;
    const event = entries.find((e) => e.id === activeId);
    if (!event) return;

    if (overId.startsWith('day_')) {
      const newDate = overId.replace('day_', '');
      if (event.date !== newDate) {
        await updateEvent(activePlanner.id, activeId, { date: newDate });
      }
    } else if (overId.startsWith('event_')) {
      const overEventId = overId.replace('event_', '');
      const overEvent = entries.find((e) => e.id === overEventId);
      if (overEvent && overEvent.date !== event.date) {
        await updateEvent(activePlanner.id, activeId, { date: overEvent.date });
      }
    }
  }, [entries, activePlanner]);

  const refreshEvents = useCallback(() => {}, []);

  return {
    events: entries,
    addEvent,
    editEvent,
    removeEvent,
    copyEvent,
    moveEvent,
    refreshEvents,
  };
}
