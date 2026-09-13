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
        let pList = await fetchUserPlanners();
        console.log("Fetched planners:", pList);
        
        if (pList.length === 0) {
          console.log("No planners found, creating default...");
          const newPlanner = await createPlanner('My Planner');
          pList = [newPlanner];
        }
        setPlanners(pList);
        
        const params = new URLSearchParams(window.location.search);
        const joinId = params.get('join');
        
        let targetPlanner: PlannerInfo | null = null;
        if (joinId && !pList.find(p => p.id === joinId)) {
          try {
            console.log("Attempting to join planner:", joinId);
            await joinPlannerApi(joinId);
            pList = await fetchUserPlanners();
            setPlanners(pList);
            targetPlanner = pList.find(p => p.id === joinId) || pList[0];
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch(e) {
            console.error("Failed to join via invite link", e);
            targetPlanner = pList[0];
          }
        } else {
          targetPlanner = pList.find(p => p.id === joinId) || pList[0];
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
      await joinPlannerApi(plannerId);
      const pList = await fetchUserPlanners();
      setPlanners(pList);
      setActivePlanner(pList.find(p => p.id === plannerId) || pList[0]);
      window.history.replaceState({}, document.title, window.location.pathname);
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
