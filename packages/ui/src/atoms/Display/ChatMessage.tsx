import React, { forwardRef } from "react";
import { Avatar } from "../Badges/Avatar";
import "./Display.css";

export interface ChatUser {
  name: string;
  avatar?: string;
  role?: string;
}

export interface ChatMessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /**
   * Text message content or custom JSX element
   */
  content: React.ReactNode;

  /**
   * Sender user object
   */
  user?: ChatUser;

  /**
   * Message time string or Date object (e.g. '09:42 AM')
   */
  timestamp?: string | Date;

  /**
   * Is sent by active user (right aligned, primary bubble)
   * @default false
   */
  isOwn?: boolean;

  /**
   * Shows sender avatar
   * @default true
   */
  showAvatar?: boolean;

  /**
   * Shows sender user name header
   * @default true
   */
  showUserName?: boolean;

  /**
   * Optional image attachment preview URL
   */
  imageAttachment?: string;

  /**
   * Highlighted message state
   * @default false
   */
  selected?: boolean;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      content,
      user,
      timestamp,
      isOwn = false,
      showAvatar = true,
      showUserName = true,
      imageAttachment,
      selected = false,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const formattedTime = React.useMemo(() => {
      if (!timestamp) return "";
      if (typeof timestamp === "string") return timestamp;
      return timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }, [timestamp]);

    return (
      <div
        ref={ref}
        className={[
          "bs-chat-message-row",
          isOwn ? "bs-chat-message-row--own" : "",
          selected ? "bs-chat-message-row--selected" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {/* Avatar (Left side for received messages) */}
        {!isOwn && showAvatar && (
          <div className="bs-chat-message-avatar">
            <Avatar
              src={user?.avatar}
              name={user?.name || "User"}
              size="sm"
            />
          </div>
        )}

        {/* Bubble Content Box */}
        <div className="bs-chat-message-container">
          {/* Sender Header */}
          {!isOwn && showUserName && user?.name && (
            <div className="bs-chat-message-header">
              <span className="bs-chat-message-author">{user.name}</span>
              {user.role && (
                <span className="bs-chat-message-role-badge">{user.role}</span>
              )}
            </div>
          )}

          {/* Bubble Body */}
          <div
            className={[
              "bs-chat-message-bubble",
              isOwn ? "bs-chat-message-bubble--own" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Image Attachment */}
            {imageAttachment && (
              <div className="bs-chat-message-image">
                <img src={imageAttachment} alt="Attachment" />
              </div>
            )}

            {/* Main Text Content */}
            {content && <div className="bs-chat-message-text">{content}</div>}

            {/* Time Stamp */}
            {formattedTime && (
              <span className="bs-chat-message-time">{formattedTime}</span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";
