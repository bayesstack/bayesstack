"use client";

import React, { useState } from "react";
import { useTenant } from "@bayesstack/tenant";
import { Button, Badge, TextInput } from "@bayesstack/ui";

type AuthTab = "signup" | "login" | "sso" | "forgot";

export default function AuthPage() {
  const { tenant, tenantSlug, isTenant, isLoading, error } = useTenant();
  const [activeTab, setActiveTab] = useState<AuthTab>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"learner" | "faculty" | "admin">("learner");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "signup") {
      setStatusMessage(`Account created successfully for ${fullName || "User"} (${role}) at ${isTenant && tenant ? tenant.name : "BayesStack"}.`);
    } else if (activeTab === "login") {
      setStatusMessage(`Authenticating for ${isTenant && tenant ? tenant.name : "BayesStack Central"}...`);
    } else if (activeTab === "sso") {
      setStatusMessage(`Redirecting to ${isTenant && tenant ? tenant.name : "University"} SAML/OAuth2 Identity Provider...`);
    } else if (activeTab === "forgot") {
      setStatusMessage(`Password reset link dispatched to ${email || "your email"}.`);
    }
  };

  // 1. Loading state while resolving tenant from backend
  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0b6763", marginBottom: "0.5rem" }}>
            BayesStack Platform Gateway
          </div>
          <p style={{ color: "var(--bs-muted)", fontSize: "0.9rem" }}>
            Checking institutional tenant record for {tenantSlug ? `'${tenantSlug}'` : "request"}...
          </p>
        </div>
      </div>
    );
  }

  // 2. Tenant Not Found state (e.g. unknown.localhost)
  if (tenantSlug && (!isTenant || error)) {
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

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Button
              variant="primary"
              onClick={() => {
                if (typeof window !== "undefined") {
                  const isLocal = window.location.hostname.endsWith(".localhost") || window.location.hostname === "localhost";
                  window.location.href = isLocal ? "http://localhost" : "https://bayesstack.com";
                }
              }}
              style={{ width: "100%" }}
            >
              Return to BayesStack Platform Home
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== "undefined") {
                  const isLocal = window.location.hostname.endsWith(".localhost") || window.location.hostname === "localhost";
                  window.location.href = isLocal ? "http://super.localhost" : "https://super.bayesstack.com";
                }
              }}
              style={{ width: "100%" }}
            >
              Platform SuperAdmin Portal
            </Button>
          </div>

          <div style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--bs-muted)", borderTop: "1px solid var(--bs-line)", paddingTop: "0.75rem" }}>
            Error Code: TENANT_NOT_FOUND • Host: {typeof window !== "undefined" ? window.location.host : ""}
          </div>
        </div>
      </div>
    );
  }

  // 3. Valid Tenant / Authenticated Form State
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0b6763", fontFamily: "var(--bs-font-main)" }}>
              BayesStack
            </span>
            <Badge variant="solid" size="sm">
              {isTenant && tenant ? tenant.slug : "Central"} Auth
            </Badge>
          </div>

          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--bs-ink)", marginBottom: "0.25rem" }}>
            {isTenant && tenant ? tenant.name : "Central Authentication Portal"}
          </h1>

          <p style={{ fontSize: "0.875rem", color: "var(--bs-muted)" }}>
            {isTenant && tenant
              ? `Sign up or log in to access your ${tenant.name} portal`
              : "Sign in with your institutional or platform credentials"}
          </p>
        </div>

        {/* Auth Tabs */}
        <div className="auth-tabs">
          <div
            className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => { setActiveTab("signup"); setStatusMessage(null); }}
          >
            Sign Up
          </div>
          <div
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => { setActiveTab("login"); setStatusMessage(null); }}
          >
            Login
          </div>
          <div
            className={`auth-tab ${activeTab === "sso" ? "active" : ""}`}
            onClick={() => { setActiveTab("sso"); setStatusMessage(null); }}
          >
            SSO Portal
          </div>
          <div
            className={`auth-tab ${activeTab === "forgot" ? "active" : ""}`}
            onClick={() => { setActiveTab("forgot"); setStatusMessage(null); }}
          >
            Reset
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div style={{
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            borderRadius: "8px",
            background: "var(--bs-brand-soft)",
            border: "1px solid var(--bs-line)",
            color: "var(--bs-brand-teal)",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}>
            {statusMessage}
          </div>
        )}

        {/* Signup Form */}
        {activeTab === "signup" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bs-ink)" }}>Full Name</label>
              <TextInput
                type="text"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bs-ink)" }}>Email Address</label>
              <TextInput
                type="email"
                placeholder={`alex@${isTenant && tenant ? tenant.slug : "bayesstack"}.edu`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bs-ink)" }}>Password</label>
              <TextInput
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bs-ink)" }}>Portal Role</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["learner", "faculty", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "6px",
                      border: role === r ? "2px solid #0b6763" : "1px solid var(--bs-line)",
                      background: role === r ? "var(--bs-brand-soft)" : "white",
                      color: role === r ? "#0b6763" : "var(--bs-muted)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" style={{ width: "100%", marginTop: "0.5rem" }}>
              Sign Up for {isTenant && tenant ? tenant.name : "BayesStack"}
            </Button>
          </form>
        )}

        {/* Login Form */}
        {activeTab === "login" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bs-ink)" }}>Email Address</label>
              <TextInput
                type="email"
                placeholder={`alex@${isTenant && tenant ? tenant.slug : "bayesstack"}.edu`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bs-ink)" }}>Password</label>
              <TextInput
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="primary" style={{ width: "100%", marginTop: "0.5rem" }}>
              Sign In to {isTenant && tenant ? tenant.name : "BayesStack"}
            </Button>
          </form>
        )}

        {/* Institutional SSO Tab */}
        {activeTab === "sso" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--bs-muted)", lineHeight: 1.4 }}>
              Authenticate directly via {isTenant && tenant ? tenant.name : "your institution"}'s official Single Sign-On (SAML 2.0 / Shibboleth / OIDC) gateway.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit}
              style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
            >
              🔒 Continue with {isTenant && tenant ? `${tenant.name} SSO` : "Institutional SSO"}
            </Button>
          </div>
        )}

        {/* Password Reset Tab */}
        {activeTab === "forgot" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bs-ink)" }}>Account Email</label>
              <TextInput
                type="email"
                placeholder="alex@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="primary" style={{ width: "100%" }}>
              Send Reset Instructions
            </Button>
          </form>
        )}

        <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--bs-line)", textAlign: "center", fontSize: "0.75rem", color: "var(--bs-muted)" }}>
          {isTenant && tenant ? `${tenant.name} (${tenant.domain || `${tenant.slug}.bayesstack.com`})` : "BayesStack Central"} • Secured by Session Cookie
        </div>
      </div>
    </div>
  );
}
