"use client";

import React from "react";
import type { TenantInfo } from "@bayesstack/tenant";

interface AuthLeftPaneProps {
  tenant: TenantInfo | null;
  isTenant: boolean;
  tenantSlug: string | null;
}

export function AuthLeftPane({ tenant, isTenant }: AuthLeftPaneProps) {
  const institutionName = isTenant && tenant ? tenant.name : "Bayes Institute";

  return (
    <aside className="auth-left-pane" aria-label="Institution Workspace Portal">
      <div className="auth-left-header">
        <span className="auth-left-brand">
          {institutionName}
        </span>
      </div>

      <div className="auth-left-main">
        <blockquote className="auth-left-quote">
          &ldquo;To question what is known, teach what matters most, and build what endures.&rdquo;
        </blockquote>
        <p className="auth-left-subquote">
          A shared academic workspace for students, faculty, and administrators at {institutionName}.
        </p>
      </div>

      <div className="auth-left-footer">
        <span>{institutionName}</span>
        <span>Academic & Research Workspace</span>
      </div>
    </aside>
  );
}
