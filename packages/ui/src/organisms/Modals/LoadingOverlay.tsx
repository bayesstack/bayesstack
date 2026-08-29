import React from "react";
import { ProgressRing } from "../../atoms/Loading/ProgressRing";
import "./Modals.css";

export interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls visibility of overlay
   * @default true
   */
  visible?: boolean;

  /**
   * Fullscreen fixed overlay mode vs relative container mode
   * @default false
   */
  fullScreen?: boolean;

  /**
   * Optional loading status message label text
   */
  message?: React.ReactNode;

  /**
   * Spinner ring size ('sm' | 'md' | 'lg')
   * @default 'md'
   */
  spinnerSize?: "sm" | "md" | "lg";

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: LoadingOverlayClassNames;
}

export interface LoadingOverlayClassNames {
  root?: string;
  content?: string;
  message?: string;
}

/**
 * LoadingOverlay renders an semi-transparent blocking spinner mask over parent DOM containers
 * or the entire viewport (`fullScreen`) during asynchronous fetch operations or submission states.
 */
export function LoadingOverlay({
  visible = true,
  fullScreen = false,
  message,
  spinnerSize = "md",
  className = "",
  classNames,
  style,
  ...props
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={[
        "bs-loading-overlay",
        fullScreen ? "bs-loading-overlay--fullscreen" : "",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      <div className={["bs-loading-overlay-content", classNames?.content].filter(Boolean).join(" ")}>
        <ProgressRing size={spinnerSize} />
        {message && (
          <span className={["bs-loading-overlay-message", classNames?.message].filter(Boolean).join(" ")}>{message}</span>
        )}
      </div>
    </div>
  );
}
