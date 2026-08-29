import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Modals.css";

export type ToastVariant = "info" | "success" | "warning" | "danger";

export interface ToastItem {
  id: string;
  title?: React.ReactNode;
  message: React.ReactNode;
  variant?: ToastVariant;
  autoClose?: number | false;
  icon?: IconName | React.ReactNode;
}

export interface ToastProps extends ToastItem {
  onClose: (id: string) => void;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: ToastClassNames;
}

export interface ToastClassNames {
  root?: string;
  icon?: string;
  body?: string;
  title?: string;
  message?: string;
}

export function Toast({
  id,
  title,
  message,
  variant = "info",
  icon,
  onClose,
  className = "",
  classNames,
}: ToastProps) {
  const getIconName = (): IconName => {
    switch (variant) {
      case "success":
        return "Check";
      case "danger":
        return "Close";
      case "warning":
        return "AlertCircle";
      default:
        return "Info";
    }
  };

  return (
    <div
      className={[
        "bs-toast",
        `bs-toast--${variant}`,
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      role="alert"
    >
      <div className={["bs-toast-icon", classNames?.icon].filter(Boolean).join(" ")}>
        {icon ? (
          typeof icon === "string" ? (
            <Icon name={icon as IconName} size={18} />
          ) : (
            icon
          )
        ) : (
          <Icon name={getIconName()} size={18} />
        )}
      </div>

      <div className={["bs-toast-body", classNames?.body].filter(Boolean).join(" ")}>
        {title && <h5 className={["bs-toast-title", classNames?.title].filter(Boolean).join(" ")}>{title}</h5>}
        <div className={["bs-toast-message", classNames?.message].filter(Boolean).join(" ")}>{message}</div>
      </div>

      <IconButton
        name="Close"
        label="Dismiss toast"
        size="xs"
        variant="transparent"
        onClick={() => onClose(id)}
      />
    </div>
  );
}

/* Toast Context & Provider */
interface ToastContextType {
  showToast: (item: Omit<ToastItem, "id">) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error(
      "useToast hook must be used within a ToastProvider"
    );
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showToast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { id, ...item };

      setToasts((prev) => [...prev, newToast]);

      const autoCloseMs = item.autoClose !== undefined ? item.autoClose : 4000;
      if (autoCloseMs !== false) {
        setTimeout(() => {
          hideToast(id);
        }, autoCloseMs);
      }

      return id;
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="bs-toast-container">
            {toasts.map((t) => (
              <Toast
                key={t.id}
                {...t}
                onClose={hideToast}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
