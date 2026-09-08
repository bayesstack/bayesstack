import React from "react";
import Link from "next/link";
import { PRIVACY_POLICY } from "../../lib/legal-content";

export const metadata = {
  title: "BayesStack | Privacy Policy",
  description: "Global privacy, GDPR, and FERPA compliance terms for BayesStack workspaces.",
};

export default function PrivacyPage() {
  const doc = PRIVACY_POLICY;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--auth-canvas)", padding: "3rem 1.5rem" }}>
      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid var(--auth-border)",
          padding: "3rem 2.5rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href="/"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--auth-brand)",
              textDecoration: "none",
            }}
          >
            ← Return to Sign In
          </Link>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              backgroundColor: "var(--auth-brand-soft)",
              color: "var(--auth-brand)",
            }}
          >
            {doc.badge}
          </span>
        </div>

        <header style={{ borderBottom: "1px solid var(--auth-border)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--auth-ink)",
              fontFamily: "var(--auth-font-display)",
              marginBottom: "0.5rem",
            }}
          >
            {doc.title}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--auth-ink-muted)" }}>
            {doc.version} • Last updated: {doc.lastUpdated}
          </p>
        </header>

        <div
          style={{
            padding: "1.25rem",
            backgroundColor: "var(--auth-canvas)",
            borderLeft: "3px solid var(--auth-brand)",
            borderRadius: "0 6px 6px 0",
            fontSize: "0.95rem",
            color: "var(--auth-ink)",
            lineHeight: 1.6,
            marginBottom: "2.5rem",
          }}
        >
          {doc.summary}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {doc.sections.map((section) => (
            <section key={section.id} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "var(--auth-ink)",
                  fontFamily: "var(--auth-font-display)",
                }}
              >
                {section.title}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {section.content.map((paragraph, idx) => (
                  <p
                    key={idx}
                    style={{
                      fontSize: "0.9rem",
                      color: "#334155",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
