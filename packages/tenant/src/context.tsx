"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { parseTenantFromHost } from "./parser";
import { fetchTenantConfig, TenantInfo, TenantConfigResponse } from "./api";

export interface TenantContextState {
  tenantSlug: string | null;
  tenant: TenantInfo | null;
  isTenant: boolean;
  isLoading: boolean;
  error: string | null;
  refetchTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextState>({
  tenantSlug: null,
  tenant: null,
  isTenant: false,
  isLoading: true,
  error: null,
  refetchTenant: async () => {},
});

export interface TenantProviderProps {
  children: React.ReactNode;
  initialTenantSlug?: string | null;
  apiUrl?: string;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({
  children,
  initialTenantSlug = null,
  apiUrl = "http://localhost:8000",
}) => {
  const [tenantSlug, setTenantSlug] = useState<string | null>(initialTenantSlug);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [isTenant, setIsTenant] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenant = async () => {
    setIsLoading(true);
    setError(null);

    let host = "";
    if (typeof window !== "undefined") {
      host = window.location.host;
    }

    const slug = parseTenantFromHost(host);
    setTenantSlug(slug);

    if (!slug) {
      setIsTenant(false);
      setTenant(null);
      setIsLoading(false);
      return;
    }

    const config: TenantConfigResponse = await fetchTenantConfig(apiUrl, host);
    if (config.is_tenant && config.tenant) {
      setIsTenant(true);
      setTenant(config.tenant);
    } else {
      setIsTenant(false);
      setTenant(null);
      if (config.detail) {
        setError(config.detail);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTenant();
  }, [apiUrl]);

  return (
    <TenantContext.Provider
      value={{
        tenantSlug,
        tenant,
        isTenant,
        isLoading,
        error,
        refetchTenant: loadTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextState => {
  return useContext(TenantContext);
};
