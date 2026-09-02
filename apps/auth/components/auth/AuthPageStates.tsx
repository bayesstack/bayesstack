import type { TenantInfo } from "@bayesstack/tenant";
import { Button } from "@bayesstack/ui";
import { getPlatformHomeUrl, getSuperAdminUrl } from "../../lib/auth-navigation";

interface LoadingStateProps {
  tenantSlug: string | null;
  statusMessage: string | null;
}

export function AuthLoadingState({ tenantSlug, statusMessage }: LoadingStateProps) {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0b6763", marginBottom: "0.5rem" }}>
          BayesStack Platform Gateway
        </div>
        <p style={{ color: "var(--bs-muted)", fontSize: "0.9rem" }}>
          {statusMessage || `Verifying session and institutional tenant for ${tenantSlug ? `'${tenantSlug}'` : "request"}...`}
        </p>
      </div>
    </div>
  );
}

interface TenantNotFoundStateProps {
  tenantSlug: string;
  error: string | null;
}

export function TenantNotFoundState({ tenantSlug, error }: TenantNotFoundStateProps) {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: "center", borderTop: "4px solid #e53e3e" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⚠️</div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#111827", marginBottom: "0.5rem" }}>
          Institutional Tenant Not Found
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.5, marginBottom: "1.5rem" }}>
          The institutional domain <strong>{tenantSlug}.bayesstack.com</strong> was not found or is currently inactive.
        </p>
        {error && <p className="auth-error-detail">{error}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Button variant="primary" onClick={() => { window.location.href = getPlatformHomeUrl(); }} style={{ width: "100%" }}>
            Return to BayesStack Platform Home
          </Button>
          <Button variant="outline" onClick={() => { window.location.href = getSuperAdminUrl(); }} style={{ width: "100%" }}>
            Platform SuperAdmin Portal
          </Button>
        </div>

        <div className="auth-state-footer">
          Error Code: TENANT_NOT_FOUND • Host: {typeof window !== "undefined" ? window.location.host : ""}
        </div>
      </div>
    </div>
  );
}

interface AuthHeaderProps {
  tenant: TenantInfo | null;
  isTenant: boolean;
}

export function AuthHeader({ tenant, isTenant }: AuthHeaderProps) {
  const tenantName = isTenant && tenant ? tenant.name : "Central Authentication Portal";

  return (
    <div className="auth-header">
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0b6763", fontFamily: "var(--bs-font-main)" }}>
          BayesStack
        </span>
        <span className="auth-tenant-badge">{isTenant && tenant ? tenant.slug : "Central"} Auth</span>
      </div>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--bs-ink)", marginBottom: "0.25rem" }}>{tenantName}</h1>
      <p style={{ fontSize: "0.875rem", color: "var(--bs-muted)" }}>
        {isTenant && tenant ? `Log in to access your ${tenant.name} portal` : "Sign in with your institutional or platform credentials"}
      </p>
    </div>
  );
}
