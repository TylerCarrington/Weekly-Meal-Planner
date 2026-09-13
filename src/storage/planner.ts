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
  const batch = writeBatch(db);
  const inviteRef = doc(db, 'planners', plannerId, 'invites', targetEmail);
  batch.set(inviteRef, {
    role,
    createdAt: Date.now()
  });
  await batch.commit();
}

export async function checkInvitesAndJoin() {
  if (!auth.currentUser || !auth.currentUser.email) return;
  
  // We can't really query across planners for invites because we didn't allow collectionGroup('invites')
  // We'll need the user to provide the planner ID they are joining.
}

export async function joinPlanner(plannerId: string) {
  if (!auth.currentUser || !auth.currentUser.email) throw new Error('Not logged in');
  
  // Verify invite
  const inviteRef = doc(db, 'planners', plannerId, 'invites', auth.currentUser.email);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) {
    throw new Error('No invite found for this email on this planner');
  }
  
  const inviteData = inviteSnap.data();
  const plannerRef = doc(db, 'planners', plannerId);
  const plannerSnap = await getDoc(plannerRef);
  if (!plannerSnap.exists()) throw new Error('Planner not found');
  
  const plannerName = plannerSnap.data().name;
  
  const batch = writeBatch(db);
  
  // create member
  const memberRef = doc(db, 'planners', plannerId, 'members', auth.currentUser.uid);
  batch.set(memberRef, {
    email: auth.currentUser.email,
    role: inviteData.role,
    joinedAt: Date.now()
  });
  
  // add to userPlanners
  const userPlannerRef = doc(db, 'userPlanners', auth.currentUser.uid);
  const upDoc = await getDoc(userPlannerRef);
  
  const plannerInfo: PlannerInfo = { id: plannerId, name: plannerName, role: inviteData.role };
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
  
  // delete invite
  batch.delete(inviteRef);
  
  await batch.commit();
}


