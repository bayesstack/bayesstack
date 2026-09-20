"use client";

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

type SidebarPreference = "expanded" | "collapsed";

const STORAGE_KEY = "bayesstack:learner:sidebar-preference";
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface LearnerShellState {
  sidebarPreference: SidebarPreference;
  setSidebarPreference: (preference: SidebarPreference) => void;
}

const LearnerShellStateContext = createContext<LearnerShellState | null>(null);

export function LearnerShellStateProvider({ children }: { children: React.ReactNode }) {
  // A new learner starts with labels visible. After a choice has been made, retain it.
  const [sidebarPreference, setSidebarPreferenceState] = useState<SidebarPreference>("expanded");
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  const setSidebarPreference = (preference: SidebarPreference) => {
    // Let React commit the visual state in one pass. Mutating the document
    // attribute first created an intermediate frame that looked like a remount.
    setSidebarPreferenceState(preference);
  };

  useClientLayoutEffect(() => {
    const storedPreference = window.localStorage.getItem(STORAGE_KEY);
    if (storedPreference === "collapsed" || storedPreference === "expanded") {
      setSidebarPreferenceState(storedPreference);
      document.documentElement.dataset.learnerSidebarPreference = storedPreference;
    }
    setPreferenceLoaded(true);
  }, []);

  useClientLayoutEffect(() => {
    if (!preferenceLoaded) return;
    // Keep the pre-hydration hint in sync, but only after React has committed
    // the matching sidebar state and before the browser paints.
    document.documentElement.dataset.learnerSidebarPreference = sidebarPreference;
  }, [preferenceLoaded, sidebarPreference]);

  useEffect(() => {
    if (preferenceLoaded) {
      window.localStorage.setItem(STORAGE_KEY, sidebarPreference);
    }
  }, [preferenceLoaded, sidebarPreference]);

  return (
    <LearnerShellStateContext.Provider value={{ sidebarPreference, setSidebarPreference }}>
      {children}
    </LearnerShellStateContext.Provider>
  );
}

export function useLearnerShellState() {
  const state = useContext(LearnerShellStateContext);
  if (!state) {
    throw new Error("useLearnerShellState must be used inside LearnerShellStateProvider.");
  }
  return state;
}
