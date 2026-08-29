"use client";

import React from "react";
import { ToastProvider, ModalsProvider } from "@bayesstack/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ModalsProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ModalsProvider>
  );
}
