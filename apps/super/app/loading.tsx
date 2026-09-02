"use client";

import React from "react";
import { LoadingBar, Skeleton } from "@bayesstack/ui";

export default function SingleMinimalWorkspaceLoading() {
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "var(--bs-canvas, #f8fafc)", overflow: "hidden" }}>
      {/* Top Transition Progress Bar */}
      <LoadingBar height={3} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, borderRadius: 0 }} />

      {/* Minimal Header Skeleton */}
      <div style={{ height: "48px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Skeleton.Input size="sm" style={{ width: "160px" }} active />
        <Skeleton.Button size="sm" style={{ width: "100px" }} active />
      </div>

      {/* Single Minimal Workspace Content Skeleton */}
      <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <Skeleton title={{ width: "25%" }} paragraph={{ rows: 3, width: ["95%", "80%", "65%"] }} active />
      </div>
    </div>
  );
}
