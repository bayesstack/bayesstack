import React, { forwardRef } from "react";
import { Avatar } from "../Badges/Avatar";
import { IconButton } from "../Buttons/IconButton";
import { Icon } from "../Icons/Icon";
import "./Display.css";

export interface ChatUser {
  name: string;
  avatar?: string;
  role?: string;
}

export interface ChatMessageSlots {
  /** Outer chat message row container slot */
  root?: string;
  /** Avatar container slot */
  avatar?: string;
  /** Inner content container slot */
  container?: string;
  /** Sender header wrapper slot */
  header?: string;
  /** Author name text slot */
  author?: string;
  /** Author role badge slot */
  roleBadge?: string;
  /** Message bubble element slot */
  bubble?: string;
  /** Image attachment box slot */
  image?: string;
  /** Main message text content slot */
  text?: string;
  /** Timestamp text slot */
  timestamp?: string;
  /** Floating WhatsApp-style actions container slot */
  actions?: string;
  /** Select checkmark badge slot */
  selectBadge?: string;
}

export interface ChatMessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content" | "onCopy"> {
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

  /**
   * Callback fired on Reply action click
   */
  onReply?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Callback fired on Star action click
   */
  onStar?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Callback fired on Pin action click
   */
  onPin?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Callback fired on Copy action click
   */
  onCopy?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Callback fired on Delete action click
   */
  onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Custom action buttons element override
   */
  actions?: React.ReactNode;

  /**
   * Additional CSS class name string for outer root element
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: ChatMessageSlots;
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
      onReply,
      onStar,
      onPin,
      onCopy,
      onDelete,
      actions,
      onDoubleClick,
      className = "",
      classNames,
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

    // Double-clicking a message bubble toggles message selection mode.
    // We clear native browser text selections here to prevent the ugly default highlight tint 
    // from covering the message text while still keeping text selectable via normal drag.
    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
      onDoubleClick?.(e);
    };

    // Prevents action clicks inside the floating toolbar (reply, star, delete, etc.)
    // from bubbling up to row-level double-click or drag handlers.
    const wrapActionHandler = (handler?: (e: React.MouseEvent<HTMLButtonElement>) => void) => {
      return (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        handler?.(e);
      };
    };

    return (
      <div
        ref={ref}
        className={[
          "bs-chat-message-row",
          isOwn ? "bs-chat-message-row--own" : "",
          selected ? "bs-chat-message-row--selected" : "",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        onDoubleClick={handleDoubleClick}
        style={style}
        {...props}
      >
        {/* Selection Indicator Checkmark Badge */}
        {selected && (
          <div className={["bs-chat-message-select-badge", classNames?.selectBadge].filter(Boolean).join(" ")}>
            <Icon name="CheckCircle" size={18} color="#0B6763" />
          </div>
        )}

        {/* Avatar (Left side for received messages) */}
        {!isOwn && showAvatar && (
          <div className={["bs-chat-message-avatar", classNames?.avatar].filter(Boolean).join(" ")}>
            <Avatar
              src={user?.avatar}
              name={user?.name || "User"}
              size="sm"
            />
          </div>
        )}

        {/* Bubble Content Box */}
        <div className={["bs-chat-message-container", classNames?.container].filter(Boolean).join(" ")}>
          {/* Sender Header */}
          {!isOwn && showUserName && user?.name && (
            <div className={["bs-chat-message-header", classNames?.header].filter(Boolean).join(" ")}>
              <span className={["bs-chat-message-author", classNames?.author].filter(Boolean).join(" ")}>
                {user.name}
              </span>
              {user.role && (
                <span className={["bs-chat-message-role-badge", classNames?.roleBadge].filter(Boolean).join(" ")}>
                  {user.role}
                </span>
              )}
            </div>
          )}

          {/* Bubble Body */}
          <div
            className={[
              "bs-chat-message-bubble",
              isOwn ? "bs-chat-message-bubble--own" : "",
              classNames?.bubble,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Image Attachment */}
            {imageAttachment && (
              <div className={["bs-chat-message-image", classNames?.image].filter(Boolean).join(" ")}>
                <img src={imageAttachment} alt="Attachment" />
              </div>
            )}

            {/* Main Text Content */}
            {content && (
              <div className={["bs-chat-message-text", classNames?.text].filter(Boolean).join(" ")}>
                {content}
              </div>
            )}

            {/* Time Stamp */}
            {formattedTime && (
              <span className={["bs-chat-message-time", classNames?.timestamp].filter(Boolean).join(" ")}>
                {formattedTime}
              </span>
            )}
          </div>
        </div>

        {/* 
          Floating action toolbar (inspired by WhatsApp select mode).
          Auto-opens on select to keep the default conversation view uncluttered.
        */}
        {selected && (
          <div className={["bs-chat-message-actions", classNames?.actions].filter(Boolean).join(" ")}>
            {actions ? (
              actions
            ) : (
              <>
                <IconButton
                  name="Undo"
                  label="Reply to message"
                  size="xs"
                  variant="transparent"
                  onClick={wrapActionHandler(onReply)}
                />
                <IconButton
                  name="Star"
                  label="Star message"
                  size="xs"
                  variant="transparent"
                  onClick={wrapActionHandler(onStar)}
                />
                <IconButton
                  name="Pin"
                  label="Pin message"
                  size="xs"
                  variant="transparent"
                  onClick={wrapActionHandler(onPin)}
                />
                <IconButton
                  name="Copy"
                  label="Copy message text"
                  size="xs"
                  variant="transparent"
                  onClick={wrapActionHandler(onCopy)}
                />
                <IconButton
                  name="Trash"
                  label="Delete message"
                  size="xs"
                  variant="transparent"
                  onClick={wrapActionHandler(onDelete)}
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";
