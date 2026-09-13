/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalendarEvent, WeeklyEventPlan } from '../types/events';
import { StorageResult } from './meals';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export async function saveEvent(plannerId: string, event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<StorageResult<CalendarEvent>> {
  try {
    const id = generateId();
    const newEvent: CalendarEvent = { 
      ...event, 
      id,
      createdAt: Date.now()
    };
    const docRef = doc(db, `planners/${plannerId}/events`, id);
    const { id: _, ...cleaned } = newEvent as any;
    
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) delete cleaned[key];
    });

    await setDoc(docRef, cleaned);
    return { data: newEvent, error: null };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, `planners/${plannerId}/events`);
    return { data: null, error: err.message || 'Failed to save event' };
  }
}

export async function updateEvent(plannerId: string, id: string, updates: Partial<Omit<CalendarEvent, 'id'>>): Promise<StorageResult<CalendarEvent>> {
  try {
    const docRef = doc(db, `planners/${plannerId}/events`, id);
    const cleaned = { ...updates } as any;
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) delete cleaned[key];
    });

    await updateDoc(docRef, cleaned);
    
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Not found');
    return { data: { id, ...snap.data() } as CalendarEvent, error: null };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.UPDATE, `planners/${plannerId}/events/${id}`);
    return { data: null, error: err.message || 'Failed to update event' };
  }
}

export async function deleteEvent(plannerId: string, id: string): Promise<StorageResult<boolean>> {
  try {
    const docRef = doc(db, `planners/${plannerId}/events`, id);
    await deleteDoc(docRef);
    return { data: true, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to delete event' };
  }
}

export async function duplicateEvent(plannerId: string, id: string, targetDateStr?: string): Promise<StorageResult<CalendarEvent>> {
  try {
    const docRef = doc(db, `planners/${plannerId}/events`, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Event not found');
    
    const sourceData = snap.data() as any;
    const newId = generateId();
    const newEvent: CalendarEvent = {
        ...sourceData,
        id: newId,
        date: targetDateStr || sourceData.date,
        createdAt: sourceData.createdAt || Date.now(),
    };
    
    if (!targetDateStr) {
       newEvent.title = `${newEvent.title} (Copy)`;
    }

    const { id: _, ...cleaned } = newEvent as any;
    await setDoc(doc(db, `planners/${plannerId}/events`, newId), cleaned);
    return { data: newEvent, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to duplicate event' };
  }
}