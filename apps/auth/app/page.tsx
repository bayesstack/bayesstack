"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTenant } from "@bayesstack/tenant";
import { AuthForms, type AuthFormsProps } from "../components/auth/AuthForms";
import { AuthHeader, AuthLoadingState, TenantNotFoundState } from "../components/auth/AuthPageStates";
import { apiUrl, getPortalUrl, type AuthTab, type AuthenticatedUser } from "../lib/auth-navigation";

export default function AuthPage() {
  const { tenant, tenantSlug, isTenant, isLoading: isTenantLoading, error: tenantError } = useTenant();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const clearFeedback = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const redirectToPortal = (role: string, slug?: string | null) => {
    window.location.href = getPortalUrl(role, slug || tenantSlug);
  };

  useEffect(() => {
    let isMounted = true;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const checkActiveSession = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();

        if (response.ok && data.authenticated && data.user && isMounted) {
          const user = data.user as AuthenticatedUser;
          const role = user.role || "learner";
          setStatusMessage(`Active session detected for ${user.full_name || user.email}. Redirecting...`);
          redirectTimer = setTimeout(() => redirectToPortal(role, user.tenant_slug), 600);
        }
      } catch {
        // An unavailable API must leave the user unauthenticated; it is never
        // safe to infer identity from fields entered into a client-side form.
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    };

    void checkActiveSession();
    return () => {
      isMounted = false;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [tenantSlug]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    setStatusMessage("Authenticating credentials...");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(null);
        setErrorMessage(data.detail || "Authentication failed. Check your email and password.");
        return;
      }

      const user = data.user as AuthenticatedUser;
      const role = user.role || "learner";
      localStorage.setItem("bayes_auth_token", "authenticated");
      localStorage.setItem("bayes_user", JSON.stringify(user));
      setStatusMessage(`Welcome back, ${user.full_name || user.email}. Redirecting to your portal...`);
      setTimeout(() => redirectToPortal(role, user.tenant_slug), 800);
    } catch {
      setStatusMessage(null);
      setErrorMessage("Authentication service is unavailable. Please try again shortly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    setStatusMessage("Self-service sign-up is not available yet. Contact your institution administrator for an account.");
  };

  const handleUnavailableFlow = (event: FormEvent<HTMLFormElement | HTMLButtonElement>) => {
    event.preventDefault();
    clearFeedback();
    setStatusMessage(
      activeTab === "sso"
        ? "Institutional SSO is not configured yet. Use your account password or contact your administrator."
        : "Password reset is not configured yet. Contact your institution administrator for help.",
    );
  };

  if (isTenantLoading || isCheckingSession) {
    return <AuthLoadingState tenantSlug={tenantSlug} statusMessage={statusMessage} />;
  }

  if (tenantSlug && (!isTenant || tenantError)) {
    return <TenantNotFoundState tenantSlug={tenantSlug} error={tenantError} />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <AuthHeader tenant={tenant} isTenant={isTenant} />
        <AuthForms
          activeTab={activeTab}
          email={email}
          password={password}
          fullName={fullName}
          isSubmitting={isSubmitting}
          tenant={tenant}
          isTenant={isTenant}
          onTabChange={(tab) => { setActiveTab(tab); clearFeedback(); }}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onFullNameChange={setFullName}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onUnavailableFlow={handleUnavailableFlow}
          feedback={<AuthFeedback statusMessage={statusMessage} errorMessage={errorMessage} />}
        />
        <div className="auth-footer">
          {isTenant && tenant ? `${tenant.name} (${tenant.domain || `${tenant.slug}.bayesstack.com`})` : "BayesStack Central"} • Secured by Session Cookie
        </div>
      </div>
    </div>
  );
}

function AuthFeedback({ statusMessage, errorMessage }: { statusMessage: string | null; errorMessage: string | null }) {
  if (statusMessage) return <div className="auth-status">{statusMessage}</div>;
  if (errorMessage) return <div className="auth-error">{errorMessage}</div>;
  return null;
}
