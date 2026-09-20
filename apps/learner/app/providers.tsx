"use client";

import React from "react";
import { ToastProvider, ModalsProvider } from "@bayesstack/ui";
import { TenantProvider } from "@bayesstack/tenant";
import { LearnerShellStateProvider } from "./components/shell/state";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <ModalsProvider>
        <ToastProvider>
          <LearnerShellStateProvider>{children}</LearnerShellStateProvider>
        </ToastProvider>
      </ModalsProvider>
    </TenantProvider>
  );
}
