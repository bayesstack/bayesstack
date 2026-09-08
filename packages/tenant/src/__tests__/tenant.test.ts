import { describe, it, expect } from "vitest";
import { parseTenantFromHost, isValidTenantSlug, extractHostname } from "../parser";

describe("Tenant Host Parsing", () => {
  it("extracts tenant slug from local subdomains", () => {
    expect(parseTenantFromHost("bayes.localhost")).toBe("bayes");
    expect(parseTenantFromHost("bayes.localhost:3000")).toBe("bayes");
    expect(parseTenantFromHost("sample-org.localhost:8000")).toBe("sample-org");
  });

  it("extracts tenant slug from production subdomains", () => {
    expect(parseTenantFromHost("bayes.bayesstack.com")).toBe("bayes");
    expect(parseTenantFromHost("bayes.bayesstack.com:443")).toBe("bayes");
    expect(parseTenantFromHost("sample-org.bayesstack.com")).toBe("sample-org");
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
    expect(isValidTenantSlug("bayes")).toBe(true);
    expect(isValidTenantSlug("bayes-tech")).toBe(true);
    expect(isValidTenantSlug("bayes123")).toBe(true);
  });

  it("rejects invalid or reserved slugs", () => {
    expect(isValidTenantSlug("bayes_univ")).toBe(false);
    expect(isValidTenantSlug("-bayes")).toBe(false);
    expect(isValidTenantSlug("bayes-")).toBe(false);
    expect(isValidTenantSlug("www")).toBe(false);
    expect(isValidTenantSlug("api")).toBe(false);
    expect(isValidTenantSlug("")).toBe(false);
  });
});

describe("Hostname Extractor", () => {
  it("strips ports correctly", () => {
    expect(extractHostname("bayes.localhost:3000")).toBe("bayes.localhost");
    expect(extractHostname("BAYES.LOCALHOST:8000")).toBe("bayes.localhost");
  });
});

