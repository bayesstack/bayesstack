export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  domain?: string | null;
  is_active: boolean;
  branding?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TenantConfigResponse {
  is_tenant: boolean;
  tenant: TenantInfo | null;
  branding?: string | null;
  message?: string;
  allowed_base_domains?: string[];
  error_code?: string;
  detail?: string;
}

export async function fetchTenantConfig(
  apiUrl: string = "http://localhost:8000",
  customHost?: string
): Promise<TenantConfigResponse> {
  const headers: Record<string, string> = {};
  if (customHost) {
    headers["X-Forwarded-Host"] = customHost;
  } else if (typeof window !== "undefined" && window.location.host) {
    headers["X-Forwarded-Host"] = window.location.host;
  }

  try {
    const res = await fetch(`${apiUrl}/api/tenant-config`, {
      method: "GET",
      headers,
    });
    const data: TenantConfigResponse = await res.json();
    return data;
  } catch (err) {
    return {
      is_tenant: false,
      tenant: null,
      error_code: "NETWORK_ERROR",
      detail: err instanceof Error ? err.message : "Failed to connect to tenant configuration endpoint",
    };
  }
}
