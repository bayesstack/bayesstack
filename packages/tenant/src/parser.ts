export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "static",
  "assets",
  "cdn",
  "mail",
  "system-admin",
]);

export const DEFAULT_BASE_DOMAINS = ["localhost", "bayesstack.com"];

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function isIpAddress(host: string): boolean {
  if (!host) return false;
  // Simple check for IPv4 or IPv6 brackets
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4Regex.test(host) || host.startsWith("[") || host.includes(":");
}

export function isValidTenantSlug(slug: string): boolean {
  if (!slug || slug.length > 63) return false;
  const lower = slug.toLowerCase();
  if (RESERVED_SUBDOMAINS.has(lower)) return false;
  return SLUG_REGEX.test(lower);
}

export function extractHostname(rawHost: string): string {
  if (!rawHost) return "";
  let host = rawHost.trim().split(",")[0].trim();
  if (host.includes(":")) {
    if (host.startsWith("[") && host.includes("]")) {
      host = host.split("]")[0] + "]";
    } else {
      host = host.split(":")[0];
    }
  }
  return host.toLowerCase();
}

export function parseTenantFromHost(
  rawHost: string,
  baseDomains: string[] = DEFAULT_BASE_DOMAINS
): string | null {
  const hostname = extractHostname(rawHost);
  if (!hostname || isIpAddress(hostname)) {
    return null;
  }

  const allowedBases = baseDomains.map((b) => b.toLowerCase().trim()).filter(Boolean);

  for (const base of allowedBases) {
    if (hostname === base) {
      return null;
    }

    const suffix = `.${base}`;
    if (hostname.endsWith(suffix)) {
      const prefix = hostname.slice(0, -suffix.length);
      const subdomain = prefix.includes(".") ? prefix.split(".").pop() || prefix : prefix;
      if (RESERVED_SUBDOMAINS.has(subdomain.toLowerCase())) {
        return null;
      }
      return subdomain.toLowerCase();
    }
  }

  return null;
}
