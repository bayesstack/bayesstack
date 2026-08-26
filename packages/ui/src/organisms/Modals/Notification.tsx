import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Modals.css";

export type NotificationVariant = "info" | "success" | "warning" | "danger";

export interface NotificationItem {
  id: string;
  title?: React.ReactNode;
  message: React.ReactNode;
  variant?: NotificationVariant;
  autoClose?: number | false;
  icon?: IconName | React.ReactNode;
}

export interface NotificationProps extends NotificationItem {
  onClose: (id: string) => void;
}

export function Notification({
  id,
  title,
  message,
  variant = "info",
  icon,
  onClose,
}: NotificationProps) {
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
    <div className={`bs-notification bs-notification--${variant}`} role="alert">
      <div className="bs-notification-icon">
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

      <div className="bs-notification-body">
        {title && <h5 className="bs-notification-title">{title}</h5>}
        <div className="bs-notification-message">{message}</div>
      </div>

      <IconButton
        name="Close"
        label="Dismiss notification"
        size="xs"
        variant="transparent"
        onClick={() => onClose(id)}
      />
    </div>
  );
}

/* Notification Context & Provider */
interface NotificationContextType {
  showNotification: (item: Omit<NotificationItem, "id">) => string;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotification hook must be used within a NotificationProvider"
    );
  }
  return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (item: Omit<NotificationItem, "id">) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newNotif: NotificationItem = { id, ...item };

      setNotifications((prev) => [...prev, newNotif]);

      const autoCloseMs = item.autoClose !== undefined ? item.autoClose : 4000;
      if (autoCloseMs !== false) {
        setTimeout(() => {
          hideNotification(id);
        }, autoCloseMs);
      }

      return id;
    },
    [hideNotification]
  );

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="bs-notification-container">
            {notifications.map((notif) => (
              <Notification
                key={notif.id}
                {...notif}
                onClose={hideNotification}
              />
            ))}
          </div>,
          document.body
        )}
    </NotificationContext.Provider>
  );
}
