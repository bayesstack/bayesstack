import React from "react";
import { Icon } from "@bayesstack/ui";
import { ErDiagramThemeTokens } from "./types";

interface ErDiagramToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: "detailed" | "compact";
  onViewModeChange: (mode: "detailed" | "compact") => void;
  schemaTablesCount: number;
  relationshipsCount: number;
  t: ErDiagramThemeTokens;
}

export function ErDiagramToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  schemaTablesCount,
  relationshipsCount,
  t,
}: ErDiagramToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 14px",
        backgroundColor: t.toolbarBg,
        borderBottom: `1px solid ${t.toolbarBorder}`,
        zIndex: 20,
        gap: "10px",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* Left Side: Search & View Mode */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Search Filter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: t.inputBg,
            border: `1px solid ${t.inputBorder}`,
            borderRadius: "6px",
            padding: "4px 8px",
          }}
        >
          <Icon name="Search" size={13} color={t.subtleText} />
          <input
            type="text"
            placeholder="Filter entities or columns..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: t.toolbarText,
              fontSize: "0.78rem",
              width: "180px",
            }}
          />
        </div>

        {/* View Mode Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: t.inputBg,
            borderRadius: "6px",
            border: `1px solid ${t.inputBorder}`,
            padding: "2px",
          }}
        >
          <button
            type="button"
            onClick={() => onViewModeChange("detailed")}
            style={{
              padding: "3px 10px",
              fontSize: "0.73rem",
              fontWeight: 600,
              borderRadius: "4px",
              border: "none",
              backgroundColor: viewMode === "detailed" ? "#0b6763" : "transparent",
              color: viewMode === "detailed" ? "#ffffff" : t.subtleText,
              cursor: "pointer",
            }}
          >
            Detailed
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("compact")}
            style={{
              padding: "3px 10px",
              fontSize: "0.73rem",
              fontWeight: 600,
              borderRadius: "4px",
              border: "none",
              backgroundColor: viewMode === "compact" ? "#0b6763" : "transparent",
              color: viewMode === "compact" ? "#ffffff" : t.subtleText,
              cursor: "pointer",
            }}
          >
            Compact
          </button>
        </div>
      </div>

      {/* Right Side: Schema Stats Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "#0b6763",
            backgroundColor: "#e4f2ef",
            border: "1px solid #bce3dc",
            padding: "3px 8px",
            borderRadius: "12px",
          }}
        >
          {schemaTablesCount} Entities · {relationshipsCount} Relationships
        </span>
      </div>
    </div>
  );
}
