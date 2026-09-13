import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface PlannerInfo {
  id: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
}

import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export async function fetchUserPlanners(): Promise<PlannerInfo[]> {
  if (!auth.currentUser) return [];
  const pDoc = await getDoc(doc(db, 'userPlanners', auth.currentUser.uid));
  if (!pDoc.exists()) return [];
  const data = pDoc.data();
  const planners = data.planners || {};
  return Object.values(planners) as PlannerInfo[];
}

export async function createPlanner(name: string): Promise<PlannerInfo> {
  if (!auth.currentUser) throw new Error('Not logged in');
  
  try {
    const batch = writeBatch(db);
    
    const plannerRef = doc(collection(db, 'planners'));
    batch.set(plannerRef, {
      name,
      ownerId: auth.currentUser.uid,
      createdAt: Date.now(),
    });
    
    const memberRef = doc(plannerRef, 'members', auth.currentUser.uid);
    batch.set(memberRef, {
      email: auth.currentUser.email,
      role: 'owner',
      joinedAt: Date.now(),
    });
    
    const userPlannerRef = doc(db, 'userPlanners', auth.currentUser.uid);
    const upDoc = await getDoc(userPlannerRef);
    
    const plannerInfo: PlannerInfo = { id: plannerRef.id, name, role: 'owner' };
    
    if (upDoc.exists()) {
      batch.update(userPlannerRef, {
        [`planners.${plannerRef.id}`]: plannerInfo
      });
    } else {
      batch.set(userPlannerRef, {
        planners: {
          [plannerRef.id]: plannerInfo
        }
      });
    }
    
    await batch.commit();
    return plannerInfo;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, 'planners');
    throw err;
  }
}

export async function sharePlanner(plannerId: string, targetEmail: string, role: 'editor' | 'viewer') {
  if (!auth.currentUser) throw new Error('Not logged in');
  const cleanEmail = targetEmail.trim().toLowerCase();
  if (!cleanEmail) throw new Error('Please enter a valid email address');

  const batch = writeBatch(db);
  const inviteRef = doc(db, 'planners', plannerId, 'invites', cleanEmail);
  batch.set(inviteRef, {
    role,
    createdAt: Date.now()
  });
  await batch.commit();
}

export async function checkInvitesAndJoin() {
  if (!auth.currentUser || !auth.currentUser.email) return;
}

export async function joinPlanner(plannerId: string): Promise<PlannerInfo> {
  if (!auth.currentUser) throw new Error('Please sign in to join this planner');

  const userEmail = auth.currentUser.email || '';
  const cleanEmail = userEmail.trim().toLowerCase();

  // 1. Fetch planner to verify it exists and get title
  const plannerRef = doc(db, 'planners', plannerId);
  const plannerSnap = await getDoc(plannerRef);
  if (!plannerSnap.exists()) {
    throw new Error('Planner not found or has been deleted');
  }

  const plannerData = plannerSnap.data();
  const plannerName = plannerData.name || 'Shared Planner';

  // 2. Check for an explicit invite to honor assigned role (viewer or editor)
  let role: 'owner' | 'editor' | 'viewer' = 'editor';
  let inviteDocToDelete: any = null;

  if (cleanEmail) {
    try {
      const lowerInviteRef = doc(db, 'planners', plannerId, 'invites', cleanEmail);
      const lowerSnap = await getDoc(lowerInviteRef);
      if (lowerSnap.exists()) {
        role = (lowerSnap.data().role as any) || 'editor';
        inviteDocToDelete = lowerInviteRef;
      } else if (userEmail && userEmail !== cleanEmail) {
        const rawInviteRef = doc(db, 'planners', plannerId, 'invites', userEmail);
        const rawSnap = await getDoc(rawInviteRef);
        if (rawSnap.exists()) {
          role = (rawSnap.data().role as any) || 'editor';
          inviteDocToDelete = rawInviteRef;
        }
      }
    } catch (e) {
      console.warn('Unable to check invite document, defaulting to editor:', e);
    }
  }

  // If the user happens to be the owner, keep owner role
  if (plannerData.ownerId === auth.currentUser.uid) {
    role = 'owner';
  }

  const batch = writeBatch(db);

  // 3. Create or update member document
  const memberRef = doc(db, 'planners', plannerId, 'members', auth.currentUser.uid);
  batch.set(memberRef, {
    email: userEmail,
    role,
    joinedAt: Date.now()
  });

  // 4. Update userPlanners record
  const userPlannerRef = doc(db, 'userPlanners', auth.currentUser.uid);
  const upDoc = await getDoc(userPlannerRef);

  const plannerInfo: PlannerInfo = { id: plannerId, name: plannerName, role };
  if (upDoc.exists()) {
    batch.update(userPlannerRef, {
      [`planners.${plannerId}`]: plannerInfo
    });
  } else {
    batch.set(userPlannerRef, {
      planners: {
        [plannerId]: plannerInfo
      }
    });
  }

  // 5. Clean up consumed invite document if one was found
  if (inviteDocToDelete) {
    batch.delete(inviteDocToDelete);
  }

  await batch.commit();
  return plannerInfo;
}


