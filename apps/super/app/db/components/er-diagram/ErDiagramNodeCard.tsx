import React from "react";
import { Icon, type DbTable } from "@bayesstack/ui";
import { NodeBounds, Relationship, ErDiagramThemeTokens } from "./types";

interface ErDiagramNodeCardProps {
  table: DbTable;
  pos: NodeBounds;
  isSelected: boolean;
  isHovered: boolean;
  isDragging: boolean;
  viewMode: "detailed" | "compact";
  hoveredColKey: string | null;
  relationships: Relationship[];
  isPanningCanvas: boolean;
  t: ErDiagramThemeTokens;
  onSelectTable: (tableId: string | null) => void;
  onHoverTable: (tableName: string | null) => void;
  onHoverCol: (colKey: string | null) => void;
  onCardMouseDown: (e: React.MouseEvent, tableName: string) => void;
}

export function ErDiagramNodeCard({
  table,
  pos,
  isSelected,
  isHovered,
  isDragging,
  viewMode,
  hoveredColKey,
  relationships,
  isPanningCanvas,
  t,
  onSelectTable,
  onHoverTable,
  onHoverCol,
  onCardMouseDown,
}: ErDiagramNodeCardProps) {
  const tableRel = relationships.filter(
    (r) => r.fromTable === table.name || r.toTable === table.name
  );

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectTable(isSelected ? null : table.id);
      }}
      onMouseEnter={() => onHoverTable(table.name)}
      onMouseLeave={() => onHoverTable(null)}
      style={{
        position: "absolute",
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${pos.width}px`,
        backgroundColor: t.cardBg,
        borderRadius: "10px",
        border: isDragging
          ? `2px dashed ${t.cardBorderSelected}`
          : isSelected
          ? `2px solid ${t.cardBorderSelected}`
          : isHovered
          ? `1px solid ${t.cardBorderHover}`
          : `1px solid ${t.cardBorder}`,
        boxShadow: isDragging
          ? "0 12px 30px rgba(15, 23, 42, 0.15)"
          : isSelected
          ? t.cardShadowSelected
          : isHovered
          ? t.cardShadow
          : t.cardShadow,
        overflow: "hidden",
        cursor: "pointer",
        transition: isDragging || isPanningCanvas ? "none" : "border 0.15s ease, box-shadow 0.15s ease",
        zIndex: isDragging ? 30 : isSelected ? 15 : isHovered ? 12 : 10,
      }}
    >
      {/* Card Header (Drag Handle) */}
      <div
        onMouseDown={(e) => onCardMouseDown(e, table.name)}
        style={{
          padding: "10px 14px",
          backgroundColor: isSelected
            ? t.cardHeaderSelectedBg
            : isHovered
            ? "#f1f5f9"
            : t.cardHeaderBg,
          borderBottom: `1px solid ${t.cardBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon name={table.icon || "Database"} size={16} color="#0b6763" />
          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: t.cardTitle }}>
            {table.name}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.7rem", color: t.subtleText, backgroundColor: t.inputBg, padding: "2px 6px", borderRadius: "4px" }}>
            {table.columns?.length || 0} cols
          </span>
        </div>
      </div>

      {/* Columns List */}
      {viewMode === "detailed" && (
        <div style={{ padding: "6px 0", display: "flex", flexDirection: "column" }}>
          {(table.columns || []).map((col) => {
            const isFk = col.name.endsWith("_id") && !col.primaryKey;
            const colKey = `${table.name}.${col.name}`;
            const isColHovered = hoveredColKey === colKey;

            return (
              <div
                key={col.name}
                onMouseEnter={() => onHoverCol(colKey)}
                onMouseLeave={() => onHoverCol(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "5px 14px",
                  fontSize: "0.78rem",
                  backgroundColor: isColHovered ? t.colRowHover : "transparent",
                  borderBottom: `1px solid ${t.colRowBorder}`,
                  transition: "background 0.1s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {col.primaryKey && (
                    <span style={{ backgroundColor: t.pkBg, color: t.pkColor, fontWeight: 800, fontSize: "0.6rem", padding: "1px 4px", borderRadius: "3px" }}>
                      PK
                    </span>
                  )}
                  {isFk && (
                    <span style={{ backgroundColor: t.fkBg, color: t.fkColor, fontWeight: 800, fontSize: "0.6rem", padding: "1px 4px", borderRadius: "3px" }}>
                      FK
                    </span>
                  )}
                  <span style={{ color: col.primaryKey ? "#92400e" : isFk ? "#0369a1" : t.colName, fontWeight: col.primaryKey ? 600 : 400 }}>
                    {col.name}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "0.7rem", color: t.colType, fontFamily: "monospace" }}>
                    {col.type}
                  </span>
                  {col.nullable && (
                    <span style={{ fontSize: "0.65rem", color: t.subtleText }} title="Nullable">?</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Card Footer Relations Bar */}
      {tableRel.length > 0 && (
        <div style={{ padding: "6px 14px", backgroundColor: "#f8fafc", borderTop: `1px solid ${t.cardBorder}`, fontSize: "0.7rem", color: t.subtleText, display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontWeight: 600, color: t.subtleText }}>Refs:</span>
          {tableRel.map((r, i) => (
            <span key={i} style={{ color: r.fromTable === table.name ? "#0b6763" : "#15803d", fontWeight: 500 }}>
              {r.fromTable === table.name ? `→ ${r.toTable}` : `← ${r.fromTable}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
