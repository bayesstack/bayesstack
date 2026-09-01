import { describe, it, expect } from "vitest";
import { parseTenantFromHost, isValidTenantSlug, extractHostname } from "../parser";

describe("Tenant Host Parsing", () => {
  it("extracts tenant slug from local subdomains", () => {
    expect(parseTenantFromHost("ashoka.localhost")).toBe("ashoka");
    expect(parseTenantFromHost("coep.localhost:3000")).toBe("coep");
    expect(parseTenantFromHost("vjti.localhost:8000")).toBe("vjti");
  });

  it("extracts tenant slug from production subdomains", () => {
    expect(parseTenantFromHost("ashoka.bayesstack.com")).toBe("ashoka");
    expect(parseTenantFromHost("coep.bayesstack.com")).toBe("coep");
    expect(parseTenantFromHost("vjti.bayesstack.com:443")).toBe("vjti");
  });

  it("returns null for root domains and IP addresses", () => {
    expect(parseTenantFromHost("localhost")).toBeNull();
    expect(parseTenantFromHost("localhost:3000")).toBeNull();
    expect(parseTenantFromHost("127.0.0.1")).toBeNull();
    expect(parseTenantFromHost("127.0.0.1:8000")).toBeNull();
    expect(parseTenantFromHost("bayesstack.com")).toBeNull();
  });

  it("returns null for reserved subdomains", () => {
    expect(parseTenantFromHost("api.bayesstack.com")).toBeNull();
    expect(parseTenantFromHost("www.localhost")).toBeNull();
    expect(parseTenantFromHost("static.bayesstack.com")).toBeNull();
  });
});

describe("Tenant Slug Syntax Validation", () => {
  it("validates valid slugs", () => {
    expect(isValidTenantSlug("ashoka")).toBe(true);
    expect(isValidTenantSlug("coep-tech")).toBe(true);
    expect(isValidTenantSlug("vjti123")).toBe(true);
  });

  it("rejects invalid or reserved slugs", () => {
    expect(isValidTenantSlug("ashoka_univ")).toBe(false);
    expect(isValidTenantSlug("-ashoka")).toBe(false);
    expect(isValidTenantSlug("ashoka-")).toBe(false);
    expect(isValidTenantSlug("www")).toBe(false);
    expect(isValidTenantSlug("api")).toBe(false);
    expect(isValidTenantSlug("")).toBe(false);
  });
});

describe("Hostname Extractor", () => {
  it("strips ports correctly", () => {
    expect(extractHostname("ashoka.localhost:3000")).toBe("ashoka.localhost");
    expect(extractHostname("COEP.LOCALHOST:8000")).toBe("coep.localhost");
  });
});
