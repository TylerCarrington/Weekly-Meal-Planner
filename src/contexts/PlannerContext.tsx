import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchUserPlanners, createPlanner, PlannerInfo, joinPlanner as joinPlannerApi } from '../storage/planner';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

export interface PlannerMember {
  uid: string;
  email: string;
  role: string;
}

interface PlannerContextType {
  planners: PlannerInfo[];
  activePlanner: PlannerInfo | null;
  setActivePlanner: (planner: PlannerInfo) => void;
  loading: boolean;
  error: string | null;
  joinPlanner: (plannerId: string) => Promise<void>;
  members: PlannerMember[];
}

const PlannerContext = createContext<PlannerContextType>({
  planners: [],
  activePlanner: null,
  setActivePlanner: () => {},
  loading: true,
  error: null,
  joinPlanner: async () => {},
  members: [],
});

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [planners, setPlanners] = useState<PlannerInfo[]>([]);
  const [activePlanner, setActivePlanner] = useState<PlannerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<PlannerMember[]>([]);

  useEffect(() => {
    if (!user) {
      setPlanners([]);
      setActivePlanner(null);
      setLoading(false);
      setError(null);
      return;
    }

    async function init() {
      console.log("Initializing planners for user:", user?.uid);
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(window.location.search);
        const joinId = params.get('join');

        let pList = await fetchUserPlanners();
        let targetPlanner: PlannerInfo | null = null;

        if (joinId) {
          try {
            console.log("Attempting to join planner:", joinId);
            const joinedInfo = await joinPlannerApi(joinId);
            pList = await fetchUserPlanners();
            targetPlanner = pList.find(p => p.id === joinId) || joinedInfo;
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
          } catch (e: any) {
            console.error("Failed to join via invite link", e);
            setError(`Could not join shared planner: ${e.message || 'Invalid link or access denied'}`);
          }
        }

        if (pList.length === 0) {
          console.log("No planners found, creating default...");
          const newPlanner = await createPlanner('My Planner');
          pList = [newPlanner];
        }

        setPlanners(pList);

        if (!targetPlanner) {
          if (joinId) {
            targetPlanner = pList.find(p => p.id === joinId) || pList[0];
          } else {
            targetPlanner = pList[0];
          }
        }

        console.log("Setting active planner:", targetPlanner);
        setActivePlanner(targetPlanner);
      } catch (e: any) {
        console.error('Failed to init planners', e);
        setError(e.message || 'Failed to initialize meal planners. Please check your connection or permissions.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [user]);

  useEffect(() => {
    if (!activePlanner) {
      setMembers([]);
      return;
    }

    const q = query(collection(db, `planners/${activePlanner.id}/members`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const snapMembers: PlannerMember[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        snapMembers.push({
          uid: doc.id,
          email: data.email || '',
          role: data.role || 'viewer'
        });
      });
      setMembers(snapMembers);
    });

    return () => unsubscribe();
  }, [activePlanner]);

  const joinPlanner = async (plannerId: string) => {
    try {
      const joined = await joinPlannerApi(plannerId);
      const pList = await fetchUserPlanners();
      setPlanners(pList);
      setActivePlanner(pList.find(p => p.id === plannerId) || joined || pList[0]);
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (e: any) {
      setError(e.message || 'Failed to join planner');
      throw e;
    }
  };

  return (
    <PlannerContext.Provider value={{ planners, activePlanner, setActivePlanner, loading, error, joinPlanner, members }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  return useContext(PlannerContext);
}
