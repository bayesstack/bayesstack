import React, { type ReactNode } from "react";
import { Icon } from "../Icons";
import "./Inputs.css";

export interface InputLabelSlots {
  root?: string;
}

export interface InputLabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  style?: React.CSSProperties;
  className?: string;
  classNames?: InputLabelSlots;
}

export const InputLabel: React.FC<InputLabelProps> = ({
  children,
  htmlFor,
  required = false,
  className = "",
  classNames,
  style,
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={[
        "bs-input-label",
        required && "bs-input-label--required",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </label>
  );
};

export interface InputDescriptionSlots {
  root?: string;
}

export interface InputDescriptionProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  classNames?: InputDescriptionSlots;
}

export const InputDescription: React.FC<InputDescriptionProps> = ({
  children,
  className = "",
  classNames,
  style,
}) => {
  return (
    <div
      className={["bs-input-description", className, classNames?.root].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
};

export interface InputErrorSlots {
  root?: string;
  icon?: string;
  text?: string;
}

export interface InputErrorProps {
  children: ReactNode;
  icon?: boolean;
  style?: React.CSSProperties;
  className?: string;
  classNames?: InputErrorSlots;
}

export const InputError: React.FC<InputErrorProps> = ({
  children,
  icon = true,
  className = "",
  classNames,
  style,
}) => {
  if (!children) return null;
  return (
    <div
      className={["bs-input-error", className, classNames?.root].filter(Boolean).join(" ")}
      style={style}
    >
      {icon && <Icon name="AlertCircle" size={14} className={classNames?.icon} />}
      <span className={classNames?.text}>{children}</span>
    </div>
  );
};

export interface InputHelpSlots {
  root?: string;
  icon?: string;
}

export interface InputHelpProps {
  tooltip?: string;
  style?: React.CSSProperties;
  className?: string;
  classNames?: InputHelpSlots;
}

export const InputHelp: React.FC<InputHelpProps> = ({
  tooltip,
  className = "",
  classNames,
  style,
}) => {
  return (
    <span
      className={["bs-input-help", className, classNames?.root].filter(Boolean).join(" ")}
      title={tooltip}
      style={style}
    >
      <Icon name="HelpCircle" size={14} className={classNames?.icon} />
    </span>
  );
};
