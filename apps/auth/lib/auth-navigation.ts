export type AuthTab = "login" | "signup" | "sso" | "forgot";

export interface AuthenticatedUser {
  email: string;
  full_name?: string | null;
  role?: string | null;
  tenant_slug?: string | null;
}

export const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function isLocalHost(host: string) {
  return host.endsWith(".localhost") || host === "localhost" || host === "127.0.0.1";
}

/**
 * Each portal runs independently in development but shares a domain layout in
 * production. Keeping that rule here prevents authentication flows from
 * gradually diverging as new portals are added.
 */
export function getPortalUrl(role: string, tenantSlug?: string | null): string {
  if (typeof window === "undefined") return "/";

  const { hostname, port } = window.location;
  const tenant = tenantSlug || "bayes";
  const usesNginx = !port || port === "80";

  if (isLocalHost(hostname)) {
    const localPort = {
      learner: "3001",
      faculty: "3002",
      admin: "3003",
      superadmin: "3005",
    }[role] || "3001";

    if (role === "superadmin") {
      return usesNginx ? "http://super.localhost" : `http://super.localhost:${localPort}`;
    }

    const path = { learner: "learner", faculty: "faculty", admin: "admin" }[role] || "learner";
    return usesNginx
      ? `http://${tenant}.localhost/${path}`
      : `http://${tenant}.localhost:${localPort}`;
  }

  const hostnameParts = hostname.split(".");
  const baseDomain = hostnameParts.length > 2 ? hostnameParts.slice(-2).join(".") : hostname;
  const portal = { learner: "learner", faculty: "faculty", admin: "admin", superadmin: "super" }[role];
  return portal ? `https://${portal}.${baseDomain}` : `https://${tenant}.${baseDomain}`;
}

export function getPlatformHomeUrl() {
  if (typeof window === "undefined") return "/";
  return isLocalHost(window.location.hostname) ? "http://localhost" : "https://bayesstack.com";
}

export function getSuperAdminUrl() {
  if (typeof window === "undefined") return "/";
  return isLocalHost(window.location.hostname)
    ? "http://super.localhost:3005"
    : "https://super.bayesstack.com";
}
