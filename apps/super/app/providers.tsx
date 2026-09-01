"use client";

import React from "react";
import { TenantProvider } from "@bayesstack/tenant";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider apiUrl={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}>
      {children}
    </TenantProvider>
  );
}
