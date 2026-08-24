import React, { type ButtonHTMLAttributes, type ReactNode } from "react";

import "./Button.css";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "type"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  ...props
}: ButtonProps) {
  const className = [
    "bs-button",
    `bs-button--${variant}`,
    `bs-button--${size}`,
  ].join(" ");

  return (
    <button className={className} type={type} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
