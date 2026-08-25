import React, { type ReactNode } from "react";
import { Icon } from "../Icons";
import "./Inputs.css";

export interface InputLabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const InputLabel: React.FC<InputLabelProps> = ({
  children,
  htmlFor,
  required = false,
  className = "",
  style,
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={[
        "bs-input-label",
        required && "bs-input-label--required",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </label>
  );
};

export interface InputDescriptionProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const InputDescription: React.FC<InputDescriptionProps> = ({
  children,
  className = "",
  style,
}) => {
  return (
    <div
      className={["bs-input-description", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
};

export interface InputErrorProps {
  children: ReactNode;
  icon?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const InputError: React.FC<InputErrorProps> = ({
  children,
  icon = true,
  className = "",
  style,
}) => {
  if (!children) return null;
  return (
    <div
      className={["bs-input-error", className].filter(Boolean).join(" ")}
      style={style}
    >
      {icon && <Icon name="AlertCircle" size={14} />}
      <span>{children}</span>
    </div>
  );
};

export interface InputHelpProps {
  tooltip?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const InputHelp: React.FC<InputHelpProps> = ({
  tooltip,
  className = "",
  style,
}) => {
  return (
    <span
      className={["bs-input-help", className].filter(Boolean).join(" ")}
      title={tooltip}
      style={style}
    >
      <Icon name="HelpCircle" size={14} />
    </span>
  );
};
