"use client";

import React, { useState } from "react";
import { Modal, Button } from "@bayesstack/ui";
import { COMPANY_CONFIG } from "@bayesstack/assets";
import { PRIVACY_POLICY, TERMS_OF_SERVICE, type LegalDocument } from "../../lib/legal-content";

export type LegalDocType = "privacy" | "terms";

export interface LegalModalProps {
  opened: boolean;
  initialDoc?: LegalDocType;
  onClose: () => void;
}

export function LegalModal({ opened, initialDoc = "privacy", onClose }: LegalModalProps) {
  const [selectedDoc, setSelectedDoc] = useState<LegalDocType>(initialDoc);

  // Sync when initialDoc changes on reopen
  React.useEffect(() => {
    setSelectedDoc(initialDoc);
  }, [initialDoc]);

  const doc: LegalDocument = selectedDoc === "privacy" ? PRIVACY_POLICY : TERMS_OF_SERVICE;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--auth-ink)" }}>
            {doc.title}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              backgroundColor: "var(--auth-brand-soft)",
              color: "var(--auth-brand)",
              border: "1px solid rgba(11, 103, 99, 0.2)",
            }}
          >
            {doc.badge}
          </span>
        </div>
      }
      description={`${doc.version} • Last updated: ${doc.lastUpdated}`}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--auth-ink-muted)" }}>
            Inquiries: <strong style={{ color: "var(--auth-ink)" }}>{COMPANY_CONFIG.privacyEmail}</strong>
          </span>
          <Button variant="primary" onClick={onClose} size="sm">
            Close & Return
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Document Switcher Segmented Tabs */}
        <div
          style={{
            display: "inline-flex",
            padding: "0.25rem",
            backgroundColor: "var(--auth-canvas)",
            borderRadius: "8px",
            border: "1px solid var(--auth-border)",
            alignSelf: "flex-start",
            gap: "0.25rem",
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedDoc("privacy")}
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              backgroundColor: selectedDoc === "privacy" ? "#ffffff" : "transparent",
              color: selectedDoc === "privacy" ? "var(--auth-brand)" : "var(--auth-ink-muted)",
              boxShadow: selectedDoc === "privacy" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            Privacy Policy (GDPR / FERPA)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDoc("terms")}
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              backgroundColor: selectedDoc === "terms" ? "#ffffff" : "transparent",
              color: selectedDoc === "terms" ? "var(--auth-brand)" : "var(--auth-ink-muted)",
              boxShadow: selectedDoc === "terms" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            Terms of Service
          </button>
        </div>

        {/* Executive Summary */}
        <div
          style={{
            padding: "1rem 1.25rem",
            backgroundColor: "#f8fafc",
            borderLeft: "3px solid var(--auth-brand)",
            borderRadius: "0 6px 6px 0",
            fontSize: "0.875rem",
            color: "var(--auth-ink)",
            lineHeight: 1.6,
          }}
        >
          {doc.summary}
        </div>

        {/* Structured Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {doc.sections.map((section) => (
            <div key={section.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--auth-ink)",
                  fontFamily: "var(--auth-font-display)",
                }}
              >
                {section.title}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {section.content.map((paragraph, idx) => (
                  <p
                    key={idx}
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--auth-ink-muted)",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
