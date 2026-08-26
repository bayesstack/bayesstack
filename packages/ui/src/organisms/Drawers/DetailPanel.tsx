import React, { useState } from "react";
import { Drawer, type DrawerProps } from "./Drawer";
import { Avatar } from "../../atoms/Badges/Avatar";
import { Badge } from "../../atoms/Badges/Badge";
import { Tabs } from "../../molecules/Navigation/Tabs";
import { Button } from "../../atoms/Buttons/Button";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Drawers.css";

export interface DetailFieldItem {
  label: string;
  value: React.ReactNode;
  span?: number;
}

export interface DetailPanelTab {
  key: string;
  label: string;
  content: React.ReactNode;
}

export interface DetailPanelProps extends Omit<DrawerProps, "title"> {
  /**
   * Entity title name
   */
  entityName: string;

  /**
   * Subtitle category or entity ID
   */
  entitySubtitle?: string;

  /**
   * Entity avatar preview image or initials
   */
  entityAvatar?: string;

  /**
   * Entity status badge label
   */
  entityStatus?: string;

  /**
   * Status badge color variant
   */
  entityStatusColor?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";

  /**
   * Key-value metadata summary fields array
   */
  fields?: DetailFieldItem[];

  /**
   * Tabbed detail views
   */
  tabs?: DetailPanelTab[];

  /**
   * Edit action button click handler
   */
  onEdit?: () => void;
}

export function DetailPanel({
  open,
  onClose,
  entityName,
  entitySubtitle,
  entityAvatar,
  entityStatus,
  entityStatusColor = "neutral",
  fields = [],
  tabs = [],
  onEdit,
  size = "lg",
  children,
  className = "",
  ...props
}: DetailPanelProps) {
  const [activeTabKey, setActiveTabKey] = useState(tabs[0]?.key || "");

  const activeTabContent = tabs.find((t) => t.key === activeTabKey)?.content;

  const headerTitle = (
    <div className="bs-detail-panel-entity-header">
      <Avatar name={entityName} src={entityAvatar} size="md" />
      <div className="bs-detail-panel-entity-info">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3 className="bs-detail-panel-entity-name">{entityName}</h3>
          {entityStatus && (
            <Badge size="sm" variant="subtle" color={entityStatusColor}>
              {entityStatus}
            </Badge>
          )}
        </div>
        {entitySubtitle && (
          <span className="bs-detail-panel-entity-subtitle">{entitySubtitle}</span>
        )}
      </div>
    </div>
  );

  const extraActions = (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {onEdit && (
        <Button size="xs" variant="secondary" onClick={onEdit}>
          Edit Entity
        </Button>
      )}
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={headerTitle}
      extra={extraActions}
      size={size}
      className={["bs-detail-panel", className].filter(Boolean).join(" ")}
      {...props}
    >
      {/* Metadata Fields Grid */}
      {fields.length > 0 && (
        <div className="bs-detail-panel-fields-grid">
          {fields.map((field, idx) => (
            <div key={idx} className="bs-detail-panel-field-item">
              <span className="bs-detail-panel-field-label">{field.label}</span>
              <div className="bs-detail-panel-field-value">{field.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs Navigation */}
      {tabs.length > 0 && (
        <div className="bs-detail-panel-tabs-section">
          <Tabs
            items={tabs.map((t) => ({ value: t.key, label: t.label }))}
            value={activeTabKey}
            onValueChange={(val) => setActiveTabKey(val)}
            variant="line"
            size="sm"
          />
          <div className="bs-detail-panel-tab-content">{activeTabContent}</div>
        </div>
      )}

      {children}
    </Drawer>
  );
}
