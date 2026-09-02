"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, TextInput, InputLabel, Logo } from "@bayesstack/ui";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@bayesstack.com");
  const [password, setPassword] = useState("admin123");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // If already authenticated, redirect to /db
    if (typeof window !== "undefined" && localStorage.getItem("bayes_super_authenticated") === "true") {
      router.push("/db");
    }
  }, [router]);

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

      localStorage.setItem("bayes_super_authenticated", "true");
      localStorage.setItem("bayes_super_user", JSON.stringify(data.user));
      router.push("/db");
    } catch (err: any) {
      // Fallback for local dev if backend API is offline
      if (email === "admin@bayesstack.com" && password === "admin123") {
        const fallbackUser = {
          id: "user-superadmin",
          email: "admin@bayesstack.com",
          full_name: "BayesStack SuperAdmin",
          role: "superadmin",
          tenant_slug: "bayes",
          tenant_name: "Bayes Institute",
        };
        localStorage.setItem("bayes_super_authenticated", "true");
        localStorage.setItem("bayes_super_user", JSON.stringify(fallbackUser));
        router.push("/db");
      } else {
        setLoginError("Unable to connect to authentication server. Check if API is running.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "var(--bs-canvas, #f8fafc)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid var(--bs-line, #e2e8f0)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
          padding: "2.5rem 2rem",
        }}
      >
        {/* Logo Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.75rem", textAlign: "center" }}>
          <Logo
            variant="full"
            size="lg"
            title="BayesStack"
            badge="SuperAdmin"
            logoSrc="/assets/brand/logo-mark.svg"
          />
        </div>

        {loginError && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <InputLabel htmlFor="superadmin-email" required>
              SuperAdmin Email
            </InputLabel>
            <TextInput
              id="superadmin-email"
              type="email"
              placeholder="admin@bayesstack.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <InputLabel htmlFor="superadmin-password" required>
              Master Access Key
            </InputLabel>
            <TextInput
              id="superadmin-password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" fullWidth loading={isLoading} style={{ marginTop: "0.5rem" }}>
            Authenticate SuperAdmin Session
          </Button>
        </form>

        <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "var(--bs-muted)", textAlign: "center" }}>
          Restricted System • BayesStack Enterprise Core Control Plane
        </p>
      </div>
    </div>
  );
}
