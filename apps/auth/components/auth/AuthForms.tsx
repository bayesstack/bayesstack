import type { FormEventHandler, ReactNode } from "react";
import type { TenantInfo } from "@bayesstack/tenant";
import { Button, TextInput } from "@bayesstack/ui";
import type { AuthTab } from "../../lib/auth-navigation";

export interface AuthFormsProps {
  activeTab: AuthTab;
  email: string;
  password: string;
  fullName: string;
  isSubmitting: boolean;
  tenant: TenantInfo | null;
  isTenant: boolean;
  onTabChange: (tab: AuthTab) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onFullNameChange: (fullName: string) => void;
  onLogin: FormEventHandler<HTMLFormElement>;
  onSignup: FormEventHandler<HTMLFormElement>;
  onUnavailableFlow: FormEventHandler<HTMLFormElement | HTMLButtonElement>;
  feedback?: ReactNode;
}

const tabs: Array<{ id: AuthTab; label: string }> = [
  { id: "login", label: "Login" },
  { id: "signup", label: "Sign Up" },
  { id: "sso", label: "SSO Portal" },
  { id: "forgot", label: "Reset" },
];

export function AuthForms({
  activeTab, email, password, fullName, isSubmitting, tenant, isTenant,
  onTabChange, onEmailChange, onPasswordChange, onFullNameChange, onLogin, onSignup, onUnavailableFlow, feedback,
}: AuthFormsProps) {
  const organizationName = isTenant && tenant ? tenant.name : "BayesStack";
  const emailDomain = isTenant && tenant ? tenant.slug : "bayesstack";

  return (
    <>
      <div className="auth-tabs" role="tablist" aria-label="Authentication options">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`auth-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {feedback}

      {activeTab === "login" && (
        <form onSubmit={onLogin} className="auth-form">
          <AuthField label="Email Address">
            <TextInput type="email" placeholder={`user@${emailDomain}.edu`} value={email} onChange={(event) => onEmailChange(event.target.value)} required />
          </AuthField>
          <AuthField label="Password">
            <TextInput type="password" placeholder="••••••••••••" value={password} onChange={(event) => onPasswordChange(event.target.value)} required />
          </AuthField>
          <Button type="submit" variant="primary" loading={isSubmitting} style={{ width: "100%", marginTop: "0.5rem" }}>
            Sign In to {organizationName}
          </Button>
        </form>
      )}

      {activeTab === "signup" && (
        <form onSubmit={onSignup} className="auth-form">
          <AuthField label="Full Name">
            <TextInput type="text" placeholder="Alex Morgan" value={fullName} onChange={(event) => onFullNameChange(event.target.value)} required />
          </AuthField>
          <AuthField label="Email Address">
            <TextInput type="email" placeholder={`alex@${emailDomain}.edu`} value={email} onChange={(event) => onEmailChange(event.target.value)} required />
          </AuthField>
          <AuthField label="Password">
            <TextInput type="password" placeholder="Create a strong password" value={password} onChange={(event) => onPasswordChange(event.target.value)} required />
          </AuthField>
          <Button type="submit" variant="primary" style={{ width: "100%", marginTop: "0.5rem" }}>
            Sign Up for {organizationName}
          </Button>
        </form>
      )}

      {activeTab === "sso" && (
        <div className="auth-form">
          <p className="auth-description">Authenticate through {isTenant && tenant ? tenant.name : "your institution"}&apos;s single sign-on gateway.</p>
          <Button type="button" variant="outline" onClick={onUnavailableFlow} style={{ width: "100%" }}>
            🔒 Continue with {isTenant && tenant ? `${tenant.name} SSO` : "Institutional SSO"}
          </Button>
        </div>
      )}

      {activeTab === "forgot" && (
        <form onSubmit={onUnavailableFlow} className="auth-form">
          <AuthField label="Account Email">
            <TextInput type="email" placeholder="alex@university.edu" value={email} onChange={(event) => onEmailChange(event.target.value)} required />
          </AuthField>
          <Button type="submit" variant="primary" style={{ width: "100%" }}>Send Reset Instructions</Button>
        </form>
      )}
    </>
  );
}

function AuthField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
