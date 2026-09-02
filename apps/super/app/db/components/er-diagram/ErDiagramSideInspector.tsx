import React from "react";
import { Icon, type DbTable } from "@bayesstack/ui";
import { Relationship, ErDiagramThemeTokens } from "./types";

interface ErDiagramSideInspectorProps {
  activeTable: DbTable;
  relationships: Relationship[];
  onClose: () => void;
  t: ErDiagramThemeTokens;
}

export function ErDiagramSideInspector({
  activeTable,
  relationships,
  onClose,
  t,
}: ErDiagramSideInspectorProps) {
  const connectedRels = relationships.filter(
    (r) => r.fromTable === activeTable.name || r.toTable === activeTable.name
  );

  return (
    <div
      style={{
        width: "320px",
        backgroundColor: t.inspectorBg,
        borderLeft: `1px solid ${t.inspectorBorder}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 25,
        boxShadow: "-4px 0 16px rgba(15, 23, 42, 0.08)",
      }}
    >
      {/* Inspector Header */}
      <div
        style={{
          padding: "14px 16px",
          backgroundColor: t.inspectorHeaderBg,
          borderBottom: `1px solid ${t.inspectorBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon name={activeTable.icon || "Database"} size={18} color="#0b6763" />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: t.toolbarText }}>
              {activeTable.name}
            </div>
            <div style={{ fontSize: "0.725rem", color: t.subtleText }}>
              Schema: {activeTable.schema}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: t.subtleText, cursor: "pointer", padding: "4px" }}
        >
          <Icon name="Close" size={16} />
        </button>
      </div>

      {/* Inspector Body Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Quick Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ padding: "10px", backgroundColor: t.inspectorCardBg, borderRadius: "6px", border: `1px solid ${t.inspectorCardBorder}` }}>
            <div style={{ fontSize: "0.7rem", color: t.subtleText }}>Total Columns</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0b6763" }}>{activeTable.columns?.length || 0}</div>
          </div>
          <div style={{ padding: "10px", backgroundColor: t.inspectorCardBg, borderRadius: "6px", border: `1px solid ${t.inspectorCardBorder}` }}>
            <div style={{ fontSize: "0.7rem", color: t.subtleText }}>Record Count</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#15803d" }}>{activeTable.rowCount ?? 0}</div>
          </div>
        </div>

        {/* Inbound & Outbound Relationships */}
        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: t.toolbarText, marginBottom: "8px" }}>
            Connected Relationships
          </div>
          {connectedRels.length === 0 ? (
            <div style={{ fontSize: "0.78rem", color: t.subtleText, fontStyle: "italic" }}>
              No foreign key relationships detected for this entity.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {connectedRels.map((rel, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "8px 10px",
                    backgroundColor: t.inspectorCardBg,
                    borderRadius: "6px",
                    border: `1px solid ${t.inspectorCardBorder}`,
                    fontSize: "0.78rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ color: rel.fromTable === activeTable.name ? "#0b6763" : "#15803d", fontWeight: 600 }}>
                      {rel.fromTable === activeTable.name ? `FK: ${rel.fromCol}` : `Referenced By: ${rel.fromTable}`}
                    </span>
                  </div>
                  <span style={{ color: t.subtleText }}>
                    → {rel.toTable}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column Specification Table */}
        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: t.toolbarText, marginBottom: "8px" }}>
            Schema Columns
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {(activeTable.columns || []).map((col) => (
              <div
                key={col.name}
                style={{
                  padding: "6px 10px",
                  backgroundColor: t.inspectorCardBg,
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: col.primaryKey ? "#92400e" : t.colName, fontWeight: col.primaryKey ? 600 : 400 }}>
                  {col.name}
                </span>
                <span style={{ color: t.subtleText, fontFamily: "monospace" }}>
                  {col.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
