import React from "react";
import { Drawer, type DrawerProps } from "./Drawer";
import { Button } from "../../atoms/Buttons/Button";
import { Badge } from "../../atoms/Badges/Badge";
import "./Drawers.css";

export interface EditPanelProps extends Omit<DrawerProps, "footer"> {
  /**
   * Title header
   */
  title?: React.ReactNode;

  /**
   * Save button click handler
   */
  onSave?: () => void;

  /**
   * Save button loading spinner state
   * @default false
   */
  loading?: boolean;

  /**
   * Unsaved changes warning indicator badge
   * @default false
   */
  isDirty?: boolean;

  /**
   * Save button label text
   * @default 'Save Changes'
   */
  saveText?: string;

  /**
   * Cancel button label text
   * @default 'Cancel'
   */
  cancelText?: string;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: EditPanelClassNames;
}

export interface EditPanelClassNames {
  root?: string;
  body?: string;
  footer?: string;
}

export function EditPanel({
  open,
  onClose,
  title = "Edit Item",
  onSave,
  loading = false,
  isDirty = false,
  saveText = "Save Changes",
  cancelText = "Cancel",
  size = "md",
  children,
  className = "",
  classNames,
  ...props
}: EditPanelProps) {
  const headerTitle = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {typeof title === "string" ? <span>{title}</span> : title}
      {isDirty && (
        <Badge size="sm" variant="subtle" color="warning">
          Unsaved Changes
        </Badge>
      )}
    </div>
  );

  const footerActions = (
    <div className={["bs-edit-panel-footer", classNames?.footer].filter(Boolean).join(" ")}>
      <Button
        size="sm"
        variant="secondary"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        size="sm"
        variant="primary"
        onClick={onSave}
        loading={loading}
      >
        {saveText}
      </Button>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={headerTitle}
      footer={footerActions}
      size={size}
      className={["bs-edit-panel", className, classNames?.root].filter(Boolean).join(" ")}
      {...props}
    >
      <div className={["bs-edit-panel-body", classNames?.body].filter(Boolean).join(" ")}>{children}</div>
    </Drawer>
  );
}
