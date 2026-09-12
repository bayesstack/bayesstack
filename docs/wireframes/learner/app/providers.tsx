"use client";

import React from "react";
import { ToastProvider, ModalsProvider } from "@bayesstack/ui";
import { LearnerShellStateProvider } from "./learner-shell-state";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ModalsProvider>
      <ToastProvider>
        <LearnerShellStateProvider>{children}</LearnerShellStateProvider>
      </ToastProvider>
    </ModalsProvider>
  );
}
