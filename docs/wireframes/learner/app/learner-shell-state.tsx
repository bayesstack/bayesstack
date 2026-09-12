"use client";

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

export type SidebarPreference = "expanded" | "collapsed";

const SIDEBAR_PREFERENCE_KEY = "bayesstack:learner-sidebar-preference";
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface LearnerShellState {
  sidebarPreference: SidebarPreference;
  setSidebarPreference: (preference: SidebarPreference) => void;
}

const LearnerShellStateContext = createContext<LearnerShellState | null>(null);

export function LearnerShellStateProvider({ children }: { children: React.ReactNode }) {
  const [sidebarPreference, setSidebarPreference] = useState<SidebarPreference>("expanded");

  useClientLayoutEffect(() => {
    const savedPreference = window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY);
    if (savedPreference === "collapsed" || savedPreference === "expanded") {
      setSidebarPreference(savedPreference);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, sidebarPreference);
  }, [sidebarPreference]);

  return (
    <LearnerShellStateContext.Provider value={{ sidebarPreference, setSidebarPreference }}>
      {children}
    </LearnerShellStateContext.Provider>
  );
}

export function useLearnerShellState() {
  const state = useContext(LearnerShellStateContext);
  if (!state) throw new Error("useLearnerShellState must be used inside LearnerShellStateProvider");
  return state;
}
