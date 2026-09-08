"use client";

import React, { useState, type FormEventHandler, type ReactNode } from "react";
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
  onSSOClick: () => void;
  onResetPassword: FormEventHandler<HTMLFormElement>;
  feedback?: ReactNode;
}

export function AuthForms({
  activeTab,
  email,
  password,
  fullName,
  isSubmitting,
  tenant,
  isTenant,
  onTabChange,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onLogin,
  onSignup,
  onSSOClick,
  onResetPassword,
  feedback,
}: AuthFormsProps) {
  const [rememberMe, setRememberMe] = useState(true);

  const emailDomain = isTenant && tenant ? `${tenant.slug}.com` : "bayes.com";

  return (
    <div className="auth-form-body">
      {/* Inline Feedback Alerts */}
      {feedback}

      {/* 1. SIGN IN FORM */}
      {activeTab === "login" && (
        <form onSubmit={onLogin} className="auth-form-fields">
          <div className="auth-field">
            <label htmlFor="auth-email" className="auth-field-label">Institutional Email</label>
            <TextInput
              id="auth-email"
              type="email"
              placeholder={`user@${emailDomain}`}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <div className="auth-field-label-row">
              <label htmlFor="auth-password" className="auth-field-label">Password</label>
              <button
                type="button"
                className="auth-field-link"
                onClick={() => onTabChange("forgot")}
              >
                Forgot password?
              </button>
            </div>
            <TextInput
              id="auth-password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="auth-checkbox-row">
            <input
              id="remember-me"
              type="checkbox"
              className="auth-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" style={{ cursor: "pointer" }}>
              Remember this device
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            fullWidth
            style={{ marginTop: "0.25rem" }}
          >
            Sign In
          </Button>

          <div className="auth-divider-line">
            <span>or</span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onSSOClick}
            fullWidth
          >
            Continue with Institutional SSO
          </Button>
        </form>
      )}

      {/* 2. REQUEST ACCESS / SIGN UP FORM */}
      {activeTab === "signup" && (
        <form onSubmit={onSignup} className="auth-form-fields">
          <div className="auth-field">
            <label htmlFor="signup-name" className="auth-field-label">Full Name</label>
            <TextInput
              id="signup-name"
              type="text"
              placeholder="Prof. Alan Bayes"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email" className="auth-field-label">Institutional Email</label>
            <TextInput
              id="signup-email"
              type="email"
              placeholder={`user@${emailDomain}`}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password" className="auth-field-label">Password</label>
            <TextInput
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            style={{ marginTop: "0.25rem" }}
          >
            Submit Access Request
          </Button>
        </form>
      )}

      {/* 3. PASSWORD RESET FORM */}
      {activeTab === "forgot" && (
        <form onSubmit={onResetPassword} className="auth-form-fields">
          <p style={{ fontSize: "0.875rem", color: "var(--auth-ink-muted)", lineHeight: 1.5 }}>
            Enter your institutional email address to receive password reset instructions.
          </p>

          <div className="auth-field">
            <label htmlFor="recovery-email" className="auth-field-label">Institutional Email</label>
            <TextInput
              id="recovery-email"
              type="email"
              placeholder={`user@${emailDomain}`}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            style={{ marginTop: "0.25rem" }}
          >
            Send Reset Instructions
          </Button>

          <Button
            type="button"
            variant="link"
            onClick={() => onTabChange("login")}
            fullWidth
          >
            ← Back to Sign In
          </Button>
        </form>
      )}
    </div>
  );
}
