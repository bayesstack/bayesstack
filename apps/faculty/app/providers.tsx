"use client";

import React from "react";
import { ToastProvider, ModalsProvider } from "@bayesstack/ui";
import { TenantProvider } from "@bayesstack/tenant";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <ModalsProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ModalsProvider>
    </TenantProvider>
  );
}
