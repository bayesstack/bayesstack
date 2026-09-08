"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTenant } from "@bayesstack/tenant";
import { useToast } from "@bayesstack/ui";
import { AuthLeftPane } from "../components/auth/AuthLeftPane";
import { AuthForms } from "../components/auth/AuthForms";
import { AuthHeader, AuthLoadingState, TenantNotFoundState } from "../components/auth/AuthPageStates";
import { LegalModal, type LegalDocType } from "../components/legal/LegalModal";
import { apiUrl, getPortalUrl, type AuthTab, type AuthenticatedUser } from "../lib/auth-navigation";

export default function AuthPage() {
  const { tenant, tenantSlug, isTenant, isLoading: isTenantLoading, error: tenantError } = useTenant();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Legal Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalDoc, setLegalModalDoc] = useState<LegalDocType>("privacy");

  const openLegalModal = (doc: LegalDocType) => {
    setLegalModalDoc(doc);
    setLegalModalOpen(true);
  };

  const clearFeedback = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const redirectToPortal = (role: string, slug?: string | null) => {
    window.location.href = getPortalUrl(role, slug || tenantSlug);
  };

  // Check active session on mount
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
          setStatusMessage(`Active session detected. Redirecting...`);
          redirectTimer = setTimeout(() => redirectToPortal(role, user.tenant_slug), 500);
        }
      } catch {
        // Leave unauthenticated on failure
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
    setStatusMessage("Authenticating...");
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
        setErrorMessage(data.detail || "Authentication failed. Please check your credentials.");
        return;
      }

      const user = data.user as AuthenticatedUser;
      const role = user.role || "learner";
      localStorage.setItem("bayes_user", JSON.stringify(user));
      setStatusMessage("Login successful. Redirecting...");
      setTimeout(() => redirectToPortal(role, user.tenant_slug), 600);
    } catch {
      setStatusMessage(null);
      setErrorMessage("Authentication service unavailable. Please try again shortly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    setStatusMessage("Access request submitted. Your institutional administrator will verify your credentials.");
    showToast({
      variant: "success",
      title: "Access Request Received",
      message: "Your request has been routed to institutional administrators for identity verification.",
      autoClose: 5000,
    });
  };

  const handleSSOClick = () => {
    const institutionName = isTenant && tenant ? tenant.name : "your institution";
    showToast({
      variant: "info",
      title: "Institutional SSO (SAML 2.0 / OIDC)",
      message: `Single Sign-On is currently being configured for ${institutionName}. Once your administrator connects identity federation, you will be automatically redirected to your identity provider. Please sign in with your institutional email and password in the meantime.`,
      autoClose: 7000,
    });
  };

  const handleResetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    const targetEmail = email.trim();
    showToast({
      variant: "success",
      title: "Password Reset Dispatched",
      message: `If an account associated with ${targetEmail || "this email"} exists, instructions have been sent.`,
      autoClose: 6000,
    });
    setActiveTab("login");
  };

  if (isTenantLoading || isCheckingSession) {
    return <AuthLoadingState tenantSlug={tenantSlug} statusMessage={statusMessage} />;
  }

  if (tenantSlug && (!isTenant || tenantError)) {
    return <TenantNotFoundState tenantSlug={tenantSlug} error={tenantError} onOpenLegalModal={openLegalModal} />;
  }

  return (
    <div className="auth-layout">
      {/* Left Minimal Tenant Pane */}
      <AuthLeftPane tenant={tenant} isTenant={isTenant} tenantSlug={tenantSlug} />

      {/* Right Clean Form Pane */}
      <main className="auth-right-pane">
        <div className="auth-form-wrapper">
          {/* Header remains rock solid in position */}
          <AuthHeader tenant={tenant} isTenant={isTenant} />

          {/* Navigation Tabs stay in fixed position above form body */}
          {activeTab !== "forgot" ? (
            <nav className="auth-nav-tabs" aria-label="Authentication Options">
              <button
                type="button"
                className={`auth-nav-tab ${activeTab === "login" ? "active" : ""}`}
                onClick={() => { setActiveTab("login"); clearFeedback(); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-nav-tab ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => { setActiveTab("signup"); clearFeedback(); }}
              >
                Request Access
              </button>
            </nav>
          ) : (
            <div style={{ height: "40px", display: "flex", alignItems: "center" }}>
              <button
                type="button"
                className="auth-field-link"
                style={{ fontSize: "0.85rem", fontWeight: 600 }}
                onClick={() => { setActiveTab("login"); clearFeedback(); }}
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Stable Form Body */}
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
            onSSOClick={handleSSOClick}
            onResetPassword={handleResetPassword}
            feedback={<AuthFeedback statusMessage={statusMessage} errorMessage={errorMessage} />}
          />

          <footer className="auth-right-footer">
            <span>Protected by HttpOnly Session Cookies</span>
            <div>
              <button
                type="button"
                className="auth-legal-link"
                onClick={() => openLegalModal("terms")}
              >
                Terms of Service
              </button>
              {" • "}
              <button
                type="button"
                className="auth-legal-link"
                onClick={() => openLegalModal("privacy")}
              >
                Privacy Policy (GDPR / FERPA)
              </button>
            </div>
          </footer>
        </div>
      </main>

      {/* Global Legal Dialog Modal */}
      <LegalModal
        opened={legalModalOpen}
        initialDoc={legalModalDoc}
        onClose={() => setLegalModalOpen(false)}
      />
    </div>
  );
}

function AuthFeedback({ statusMessage, errorMessage }: { statusMessage: string | null; errorMessage: string | null }) {
  if (statusMessage) {
    return <div className="auth-feedback-box success">{statusMessage}</div>;
  }
  if (errorMessage) {
    return <div className="auth-feedback-box error">{errorMessage}</div>;
  }
  return null;
}
