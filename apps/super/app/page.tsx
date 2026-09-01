"use client";

import React, { useState } from "react";
import { Button, Badge, TextInput } from "@bayesstack/ui";

interface SuperUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  tenant_slug: string;
  tenant_name: string;
}

type NavSection = "database" | "library";

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState("admin@bayesstack.com");
  const [password, setPassword] = useState("admin123");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<SuperUser | null>(null);

  // Navigation and Layout State
  const [activeSection, setActiveSection] = useState<NavSection>("database");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/auth/super-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.detail || "Authentication failed.");
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setCurrentUser(data.user);
    } catch (err: any) {
      // Fallback for local dev if backend API is offline
      if (email === "admin@bayesstack.com" && password === "admin123") {
        setIsAuthenticated(true);
        setCurrentUser({
          id: "user-superadmin",
          email: "admin@bayesstack.com",
          full_name: "BayesStack Platform SuperAdmin",
          role: "superadmin",
          tenant_slug: "bayes",
          tenant_name: "Bayes Institute",
        });
      } else {
        setLoginError("Unable to connect to authentication server. Check if API is running.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setEmail("admin@bayesstack.com");
    setPassword("admin123");
    setLoginError(null);
  };

  // --------------------------------------------------------------------------
  // 1. Unauthenticated Login Screen
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--bs-canvas, #f1f8f6)",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "white",
            borderRadius: "16px",
            padding: "2.5rem 2rem",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
            border: "1px solid var(--bs-line, #d7e8e4)",
          }}
        >
          {/* Logo Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "#0b6763",
                  fontFamily: "var(--bs-font-main)",
                }}
              >
                BayesStack
              </span>
              <Badge variant="solid" size="sm" style={{ background: "#084c49" }}>
                🔒 SuperAdmin
              </Badge>
            </div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--bs-ink, #123333)" }}>
              Platform SuperAdmin Portal
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--bs-muted, #4a6360)", marginTop: "0.25rem" }}>
              Enterprise Master Control Plane
            </p>
          </div>

          {/* Error Notice */}
          {loginError && (
            <div
              style={{
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
                borderRadius: "8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              ⚠️ {loginError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bs-ink)" }}>
                SuperAdmin Email
              </label>
              <TextInput
                type="email"
                placeholder="admin@bayesstack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bs-ink)" }}>
                Master Access Key
              </label>
              <TextInput
                type="password"
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              style={{ width: "100%", marginTop: "0.5rem", background: "#0b6763" }}
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "🔒 Authenticate SuperAdmin"}
            </Button>
          </form>

          {/* Credentials Hint */}
          <div
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background: "var(--bs-canvas)",
              border: "1px solid var(--bs-line)",
              fontSize: "0.8rem",
              color: "var(--bs-muted)",
            }}
          >
            🔑 <strong>Development Credentials:</strong><br />
            Email: <code>admin@bayesstack.com</code><br />
            Password: <code>admin123</code>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. Authenticated SaaS Enterprise Layout with Collapsible Side Nav
  // --------------------------------------------------------------------------
  const sidebarWidth = isSidebarCollapsed ? "72px" : "260px";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bs-canvas, #f1f8f6)" }}>
      {/* =================================================----------------- */}
      {/* COLLAPSIBLE SIDEBAR NAV BAR                                       */}
      {/* =================================================================- */}
      <aside
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          background: "#084c49", // Dark teal enterprise side nav
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.08)",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 100,
          overflow: "hidden",
        }}
      >
        {/* TOP: Brand Logo & Collapse Toggle */}
        <div>
          <div
            style={{
              padding: isSidebarCollapsed ? "1.25rem 0.75rem" : "1.25rem 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: isSidebarCollapsed ? "center" : "space-between",
              borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            {!isSidebarCollapsed && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    fontFamily: "var(--bs-font-main)",
                    color: "#ffffff",
                  }}
                >
                  BayesStack
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#a3e635", // Accent green
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginTop: "0.1rem",
                  }}
                >
                  SuperAdmin Portal
                </span>
              </div>
            )}

            {isSidebarCollapsed && (
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "#0b6763",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "#a3e635",
                }}
              >
                BS
              </div>
            )}

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "6px",
                width: "28px",
                height: "28px",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
            >
              {isSidebarCollapsed ? "»" : "«"}
            </button>
          </div>

          {/* MIDDLE: Navigation Options (Database & Learning Library) */}
          <nav style={{ padding: "1.25rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {/* 1. Database Navigation Item */}
            <button
              onClick={() => setActiveSection("database")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                padding: isSidebarCollapsed ? "0.75rem 0" : "0.75rem 1rem",
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                borderRadius: "10px",
                border: "none",
                background: activeSection === "database" ? "#0b6763" : "transparent",
                color: activeSection === "database" ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
                fontWeight: activeSection === "database" ? 700 : 500,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
                boxShadow: activeSection === "database" ? "0 2px 8px rgba(0, 0, 0, 0.15)" : "none",
              }}
              onMouseEnter={(e) => {
                if (activeSection !== "database") e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                if (activeSection !== "database") e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>🗄️</span>
              {!isSidebarCollapsed && <span>Database</span>}
            </button>

            {/* 2. Learning Library Navigation Item */}
            <button
              onClick={() => setActiveSection("library")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                padding: isSidebarCollapsed ? "0.75rem 0" : "0.75rem 1rem",
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                borderRadius: "10px",
                border: "none",
                background: activeSection === "library" ? "#0b6763" : "transparent",
                color: activeSection === "library" ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
                fontWeight: activeSection === "library" ? 700 : 500,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
                boxShadow: activeSection === "library" ? "0 2px 8px rgba(0, 0, 0, 0.15)" : "none",
              }}
              onMouseEnter={(e) => {
                if (activeSection !== "library") e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                if (activeSection !== "library") e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>📚</span>
              {!isSidebarCollapsed && <span>Learning Library</span>}
            </button>
          </nav>
        </div>

        {/* BOTTOM: Logged In Account Details & Logout */}
        <div
          style={{
            padding: "1rem 0.75rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            background: "rgba(0, 0, 0, 0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isSidebarCollapsed ? "center" : "space-between",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", overflow: "hidden" }}>
              {/* User Avatar */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                  borderRadius: "50%",
                  background: "#0b6763",
                  border: "2px solid #a3e635",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "white",
                }}
              >
                SA
              </div>

              {/* User Details (Visible when expanded) */}
              {!isSidebarCollapsed && (
                <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "white",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {currentUser?.full_name || "SuperAdmin"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255, 255, 255, 0.65)",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {currentUser?.email || email}
                  </span>
                </div>
              )}
            </div>

            {/* Logout Button */}
            {!isSidebarCollapsed ? (
              <button
                onClick={handleLogout}
                title="Logout"
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#fca5a5",
                  borderRadius: "6px",
                  padding: "0.35rem 0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.35)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)")}
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogout}
                title="Logout"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fca5a5",
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: "0.2rem",
                }}
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* =================================================================- */}
      {/* MAIN SCREEN CANVAS (EMBEDDED SAP ENTERPRISE READY WORKSPACE)      */}
      {/* =================================================================- */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {/* Top Workspace Header */}
        <header
          style={{
            height: "64px",
            background: "white",
            borderBottom: "1px solid var(--bs-line, #d7e8e4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2rem",
            position: "sticky",
            top: 0,
            zIndex: 90,
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--bs-ink)" }}>
              {activeSection === "database" ? "Database Management" : "Learning Library"}
            </h1>
            <span style={{ fontSize: "0.75rem", color: "var(--bs-muted)" }}>
              SuperAdmin Control Plane • {activeSection === "database" ? "Relational Data & Tenants" : "Global Master Templates"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Badge variant="solid" style={{ background: "#0b6763", padding: "0.3rem 0.75rem", fontSize: "0.78rem" }}>
              Enterprise SaaS Mode
            </Badge>
          </div>
        </header>

        {/* Completely Clean Workspace Screen */}
        <div style={{ padding: "2.5rem", flex: 1 }}>
          <div
            style={{
              width: "100%",
              height: "calc(100vh - 180px)",
              minHeight: "450px",
              background: "white",
              borderRadius: "16px",
              border: "2px dashed var(--bs-line, #d7e8e4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "var(--bs-brand-soft, #e4f2ef)",
                color: "#0b6763",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                marginBottom: "1.25rem",
              }}
            >
              {activeSection === "database" ? "🗄️" : "📚"}
            </div>

            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--bs-ink)", marginBottom: "0.5rem" }}>
              {activeSection === "database" ? "Database Control Plane Canvas" : "Learning Library Workspace Canvas"}
            </h2>

            <p style={{ maxWidth: "520px", fontSize: "0.9rem", color: "var(--bs-muted)", lineHeight: 1.5 }}>
              Workspace canvas initialized for high-density SAP-level enterprise SaaS management controls, live database inspections, and global learning library orchestrations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
