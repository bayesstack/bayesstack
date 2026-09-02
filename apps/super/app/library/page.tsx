"use client";

import React from "react";
import { Badge, Ribbon } from "@bayesstack/ui";
import { SuperAdminLayout } from "../../components/SuperAdminLayout";
import { learningLibraryRibbonTabs } from "../../config/ribbons";

export default function LearningLibraryPage() {
  const ribbonHeader = (
    <Ribbon
      key="ribbon-library"
      tabs={learningLibraryRibbonTabs}
      defaultActiveTabId="templates"
      extra={
        <Badge variant="subtle" size="sm">
          Learning Library
        </Badge>
      }
    />
  );

  return (
    <SuperAdminLayout ribbon={ribbonHeader}>
      <div
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          textAlign: "center",
          borderTop: "1px solid var(--bs-line, #e2e8f0)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "var(--bs-color-bg-subtle, #f1f5f9)",
            color: "var(--bs-color-teal-primary, #0b6763)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            marginBottom: "1.25rem",
          }}
        >
          📚
        </div>

        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--bs-ink)", marginBottom: "0.5rem" }}>
          Learning Library Workspace Canvas
        </h2>

        <p style={{ maxWidth: "520px", fontSize: "0.9rem", color: "var(--bs-muted)", lineHeight: 1.5 }}>
          Global master templates, media storage, assessments, and tenant content subscription catalog.
        </p>
      </div>
    </SuperAdminLayout>
  );
}
