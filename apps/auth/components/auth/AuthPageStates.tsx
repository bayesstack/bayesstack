"use client";

import React, { useState } from "react";
import type { TenantInfo } from "@bayesstack/tenant";
import { Button } from "@bayesstack/ui";
import { PRODUCT_NAME, COMPANY_CONFIG } from "@bayesstack/assets";
import { LegalModal, type LegalDocType } from "../legal/LegalModal";
import { getPlatformHomeUrl } from "../../lib/auth-navigation";

interface LoadingStateProps {
  tenantSlug: string | null;
  statusMessage: string | null;
}

export function AuthLoadingState({ tenantSlug, statusMessage }: LoadingStateProps) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--auth-canvas)", padding: "2rem" }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        background: "var(--auth-surface)",
        border: "1px solid var(--auth-border)",
        borderRadius: 12,
        padding: "2.5rem 2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}>
        <div style={{
          width: 28,
          height: 28,
          border: "2px solid var(--auth-border)",
          borderTopColor: "var(--auth-brand)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />

        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--auth-ink)", marginBottom: "0.25rem" }}>
            Verifying Session
          </h2>
          <p style={{ color: "var(--auth-ink-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            {statusMessage || `Resolving tenant context for ${tenantSlug ? `'${tenantSlug}'` : "request"}...`}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TenantNotFoundStateProps {
  tenantSlug: string;
  error: string | null;
  onOpenLegalModal?: (doc: LegalDocType) => void;
}

export function TenantNotFoundState({ tenantSlug, onOpenLegalModal }: TenantNotFoundStateProps) {
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>("terms");

  const openLegal = (doc: LegalDocType) => {
    if (onOpenLegalModal) {
      onOpenLegalModal(doc);
    } else {
      setLegalDoc(doc);
      setLegalOpen(true);
    }
  };

  const handleReturnHome = () => {
    window.location.href = getPlatformHomeUrl();
  };

  const handleContactPartnerships = () => {
    window.location.href = `mailto:${COMPANY_CONFIG.supportEmail}?subject=Institutional%20Onboarding%20Inquiry%20(${encodeURIComponent(tenantSlug)})`;
  };

  return (
    <div className="auth-layout">
      {/* Left Editorial & Brand Pane */}
      <aside className="auth-left-pane" aria-label="BayesStack Platform Workspace">
        <div className="auth-left-header">
          <span className="auth-left-brand">
            {PRODUCT_NAME}
          </span>
        </div>

        <div className="auth-left-main">
          <blockquote className="auth-left-quote">
            &ldquo;Bridging the distance between institutional vision and active computational learning.&rdquo;
          </blockquote>
          <p className="auth-left-subquote">
            {PRODUCT_NAME} provides isolated, domain-specific workspaces and AI studios for accredited higher-education universities and research institutions worldwide.
          </p>
        </div>

        <div className="auth-left-footer">
          <span>{PRODUCT_NAME} Platform</span>
          <span>Global Institutional Network</span>
        </div>
      </aside>

      {/* Right Clean Action Pane */}
      <main className="auth-right-pane">
        <div className="auth-form-wrapper" style={{ gap: "1.5rem" }}>
          {/* Header */}
          <header className="auth-form-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span className="auth-pill-badge neutral">
                <span className="auth-pill-dot" />
                Workspace Directory
              </span>
            </div>
            <h2>Institution Not Found</h2>
            <p>
              We couldn&apos;t locate an active campus workspace associated with <strong>&ldquo;{tenantSlug}&rdquo;</strong>.
            </p>
          </header>

          {/* Sleek Enterprise Guidance Card */}
          <div className="auth-guidance-card">
            <div className="auth-guidance-item">
              <div className="auth-guidance-bullet" />
              <div>
                <strong style={{ color: "var(--auth-ink)", display: "block", fontSize: "0.85rem", marginBottom: "0.15rem" }}>
                  Students & Educators
                </strong>
                <span style={{ fontSize: "0.82rem", color: "var(--auth-ink-muted)", lineHeight: 1.45 }}>
                  Verify that your browser address matches the exact institutional subdomain provided by your registrar or course syllabus.
                </span>
              </div>
            </div>

            <div className="auth-guidance-item">
              <div className="auth-guidance-bullet" />
              <div>
                <strong style={{ color: "var(--auth-ink)", display: "block", fontSize: "0.85rem", marginBottom: "0.15rem" }}>
                  Academic Administrators
                </strong>
                <span style={{ fontSize: "0.82rem", color: "var(--auth-ink-muted)", lineHeight: 1.45 }}>
                  Interested in bringing {PRODUCT_NAME} to your campus? Request enterprise onboarding to provision dedicated compute clusters and studios.
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <Button
              variant="primary"
              fullWidth
              onClick={handleReturnHome}
            >
              Return to Platform Home
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              onClick={handleContactPartnerships}
            >
              Request Campus Onboarding
            </Button>
          </div>


          {/* Footer with Legal Links */}
          <footer className="auth-right-footer">
            <span>Protected by HttpOnly Session Cookies</span>
            <div>
              <button
                type="button"
                className="auth-legal-link"
                onClick={() => openLegal("terms")}
              >
                Terms of Service
              </button>
              {" • "}
              <button
                type="button"
                className="auth-legal-link"
                onClick={() => openLegal("privacy")}
              >
                Privacy Policy (GDPR / FERPA)
              </button>
            </div>
          </footer>
        </div>
      </main>

      {/* Embedded Legal Modal if opened locally */}
      {!onOpenLegalModal && (
        <LegalModal
          opened={legalOpen}
          initialDoc={legalDoc}
          onClose={() => setLegalOpen(false)}
        />
      )}
    </div>
  );
}

interface AuthHeaderProps {
  tenant: TenantInfo | null;
  isTenant: boolean;
}

export function AuthHeader({ tenant, isTenant }: AuthHeaderProps) {
  const institutionName = isTenant && tenant ? tenant.name : "Platform Sign In";

  return (
    <header className="auth-form-header">
      <h2>{institutionName}</h2>
      <p>
        {isTenant && tenant
          ? `Enter your credentials to access your ${tenant.name} workspace.`
          : "Sign in with your institutional or platform credentials."}
      </p>
    </header>
  );
}
