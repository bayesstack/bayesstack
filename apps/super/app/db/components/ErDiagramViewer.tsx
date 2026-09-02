"use client";

import React, { useState, useMemo } from "react";
import { Icon, Badge, type DbTable } from "@bayesstack/ui";

export function ErDiagramViewer({ tables }: { tables: DbTable[] }) {
  const [search, setSearch] = useState<string>("");
  const [zoom, setZoom] = useState<number>(100);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [hoveredColKey, setHoveredColKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
  const [linesMode, setLinesMode] = useState<"smart" | "all" | "none">("smart");

  // Filter schema tables (excluding sql console tabs)
  const schemaTables = useMemo(() => {
    return tables.filter(
      (t) => t.schema !== "sql" && t.schema !== "er_diagram" && !t.id.startsWith("query-editor")
    );
  }, [tables]);

  const filteredTables = useMemo(() => {
    return schemaTables.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [schemaTables, search]);

  // Compute 2D Grid positions for entity nodes
  const tablePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; width: number; height: number }> = {};
    const CARD_WIDTH = 300;
    const GAP_X = 80;
    const GAP_Y = 60;
    const COLS_PER_ROW = 3;

    schemaTables.forEach((table, index) => {
      const colIndex = index % COLS_PER_ROW;
      const rowIndex = Math.floor(index / COLS_PER_ROW);

      const colCount = table.columns?.length || 0;
      const estimatedHeight = viewMode === "detailed" ? 50 + colCount * 28 + 36 : 80;

      positions[table.name] = {
        x: 40 + colIndex * (CARD_WIDTH + GAP_X),
        y: 40 + rowIndex * (360 + GAP_Y),
        width: CARD_WIDTH,
        height: estimatedHeight,
      };
    });

    return positions;
  }, [schemaTables, viewMode]);

  // Helper to calculate relationships & exact connector anchor points
  const relationships = useMemo(() => {
    const rels: Array<{
      id: string;
      fromTable: string;
      fromCol: string;
      fromColIndex: number;
      toTable: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }> = [];

    schemaTables.forEach((sourceTable) => {
      const sourcePos = tablePositions[sourceTable.name];
      if (!sourcePos) return;

      (sourceTable.columns || []).forEach((col, colIdx) => {
        if (col.name.endsWith("_id") && !col.primaryKey) {
          const targetName = col.name.replace("_id", "s");
          const targetTable = schemaTables.find(
            (t) => t.name === targetName || t.name === col.name.replace("_id", "")
          );

          if (targetTable && tablePositions[targetTable.name]) {
            const targetPos = tablePositions[targetTable.name];

            const colYOffset = viewMode === "detailed" ? 44 + colIdx * 28 + 14 : 25;
            const y1 = sourcePos.y + colYOffset;
            const y2 = targetPos.y + 24; // point to target card header center

            let x1 = sourcePos.x + sourcePos.width;
            let x2 = targetPos.x;

            if (sourcePos.x > targetPos.x) {
              x1 = sourcePos.x;
              x2 = targetPos.x + targetPos.width;
            }

            rels.push({
              id: `${sourceTable.name}.${col.name}->${targetTable.name}`,
              fromTable: sourceTable.name,
              fromCol: col.name,
              fromColIndex: colIdx,
              toTable: targetTable.name,
              x1,
              y1,
              x2,
              y2,
            });
          }
        }
      });
    });

    return rels;
  }, [schemaTables, tablePositions, viewMode]);

  const activeTable = schemaTables.find((t) => t.id === selectedTableId) || null;

  const totalWidth = Math.max(
    1200,
    ...Object.values(tablePositions).map((p) => p.x + p.width + 100)
  );
  const totalHeight = Math.max(
    800,
    ...Object.values(tablePositions).map((p) => p.y + p.height + 150)
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bs-ui-canvas, #080c14)",
        color: "#f8fafc",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top Controls Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          background: "#0f172a",
          borderBottom: "1px solid #1e293b",
          zIndex: 20,
          gap: "12px",
          flexWrap: "wrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
            <Icon name="Flowchart" size={18} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.925rem", color: "#f8fafc", lineHeight: 1.2 }}>
              Database ER Visualizer
            </div>
            <div style={{ fontSize: "0.725rem", color: "#64748b" }}>
              Relational Architecture & Dependency Inspector
            </div>
          </div>

          <Badge variant="subtle" size="sm" style={{ background: "#1e293b", color: "#38bdf8", border: "1px solid #334155", marginLeft: "8px" }}>
            {schemaTables.length} Entities
          </Badge>
          <Badge variant="subtle" size="sm" style={{ background: "#1e293b", color: "#a7f3d0", border: "1px solid #334155" }}>
            {relationships.length} Connectors
          </Badge>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Search Filter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "6px",
              padding: "5px 10px",
            }}
          >
            <Icon name="Search" size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search table / column..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f8fafc",
                fontSize: "0.8rem",
                width: "150px",
              }}
            />
          </div>

          {/* Connection Lines Toggle */}
          <div style={{ display: "flex", alignItems: "center", background: "#1e293b", borderRadius: "6px", border: "1px solid #334155", padding: "2px" }}>
            <button
              type="button"
              onClick={() => setLinesMode("smart")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "4px",
                border: "none",
                background: linesMode === "smart" ? "var(--bs-ui-brand, #0b6763)" : "transparent",
                color: linesMode === "smart" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
              }}
              title="Highlight relationship connectors on selection/hover"
            >
              Smart Connectors
            </button>
            <button
              type="button"
              onClick={() => setLinesMode("all")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "4px",
                border: "none",
                background: linesMode === "all" ? "var(--bs-ui-brand, #0b6763)" : "transparent",
                color: linesMode === "all" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
              }}
              title="Show all connector lines"
            >
              All Lines
            </button>
            <button
              type="button"
              onClick={() => setLinesMode("none")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "4px",
                border: "none",
                background: linesMode === "none" ? "var(--bs-ui-brand, #0b6763)" : "transparent",
                color: linesMode === "none" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
              }}
              title="Hide connector lines"
            >
              Cards Only
            </button>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: "flex", alignItems: "center", background: "#1e293b", borderRadius: "6px", border: "1px solid #334155", padding: "2px" }}>
            <button
              type="button"
              onClick={() => setViewMode("detailed")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "4px",
                border: "none",
                background: viewMode === "detailed" ? "#0284c7" : "transparent",
                color: viewMode === "detailed" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
              }}
            >
              Detailed
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "4px",
                border: "none",
                background: viewMode === "compact" ? "#0284c7" : "transparent",
                color: viewMode === "compact" ? "#ffffff" : "#94a3b8",
                cursor: "pointer",
              }}
            >
              Compact
            </button>
          </div>

          {/* Zoom Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "5px 8px", borderRadius: "4px", cursor: "pointer" }}
              title="Zoom out"
            >
              <Icon name="Remove" size={12} />
            </button>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", minWidth: "38px", textAlign: "center" }}>{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "5px 8px", borderRadius: "4px", cursor: "pointer" }}
              title="Zoom in"
            >
              <Icon name="Add" size={12} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "5px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Diagram Area (Scrollable Canvas + Side Panel) */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Scrollable Diagram Surface */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            position: "relative",
            backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div
            style={{
              width: `${totalWidth}px`,
              height: `${totalHeight}px`,
              position: "relative",
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top left",
              transition: "transform 0.1s ease-out",
            }}
          >
            {/* SVG Connection Lines Overlay */}
            {linesMode !== "none" && (
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                <defs>
                  {/* Arrowhead Marker */}
                  <marker
                    id="er-arrowhead"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8" />
                  </marker>
                  <marker
                    id="er-arrowhead-active"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                </defs>

                {relationships.map((rel) => {
                  const activeTableObj = activeTable ? activeTable.name : null;
                  const isRelatedToSelected =
                    activeTableObj && (rel.fromTable === activeTableObj || rel.toTable === activeTableObj);
                  const isRelatedToHovered =
                    hoveredTableId &&
                    (rel.fromTable === hoveredTableId || rel.toTable === hoveredTableId);
                  const isExactColHovered =
                    hoveredColKey && `${rel.fromTable}.${rel.fromCol}` === hoveredColKey;

                  const isHighlighted = isRelatedToSelected || isRelatedToHovered || isExactColHovered;

                  // If smart connectors mode and nothing selected/hovered -> render subtle lines
                  const opacity =
                    linesMode === "all"
                      ? isHighlighted ? 1 : 0.6
                      : isHighlighted ? 1 : (selectedTableId || hoveredTableId) ? 0.08 : 0.4;

                  const strokeColor = isHighlighted
                    ? isExactColHovered ? "#f59e0b" : "#38bdf8"
                    : "#475569";

                  const strokeWidth = isHighlighted ? 3 : 1.5;

                  // Smooth cubic bezier curve calculation
                  const dx = Math.max(60, Math.abs(rel.x2 - rel.x1) / 2);
                  const cx1 = rel.x1 + (rel.x1 < rel.x2 ? dx : -dx);
                  const cy1 = rel.y1;
                  const cx2 = rel.x2 + (rel.x1 < rel.x2 ? -dx : dx);
                  const cy2 = rel.y2;

                  const pathD = `M ${rel.x1} ${rel.y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${rel.x2} ${rel.y2}`;

                  return (
                    <g key={rel.id} style={{ opacity, transition: "opacity 0.2s ease" }}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isHighlighted ? "none" : "4 4"}
                        markerEnd={isHighlighted ? "url(#er-arrowhead-active)" : "url(#er-arrowhead)"}
                      />

                      {/* Connection Label on hover/select */}
                      {isHighlighted && (
                        <text
                          x={(rel.x1 + rel.x2) / 2}
                          y={(rel.y1 + rel.y2) / 2 - 8}
                          fill="#38bdf8"
                          fontSize="11"
                          fontWeight="700"
                          textAnchor="middle"
                          style={{
                            background: "#0f172a",
                            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                          }}
                        >
                          {rel.fromCol} → {rel.toTable}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Entity Nodes Cards */}
            {filteredTables.map((table) => {
              const pos = tablePositions[table.name] || { x: 0, y: 0, width: 300 };
              const isSelected = selectedTableId === table.id;
              const isHovered = hoveredTableId === table.name;

              // Compute relations count
              const tableRel = relationships.filter(
                (r) => r.fromTable === table.name || r.toTable === table.name
              );

              return (
                <div
                  key={table.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTableId(isSelected ? null : table.id);
                  }}
                  onMouseEnter={() => setHoveredTableId(table.name)}
                  onMouseLeave={() => setHoveredTableId(null)}
                  style={{
                    position: "absolute",
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: `${pos.width}px`,
                    background: "#0f172a",
                    borderRadius: "10px",
                    border: isSelected
                      ? "2px solid #38bdf8"
                      : isHovered
                      ? "1px solid #0284c7"
                      : "1px solid #1e293b",
                    boxShadow: isSelected
                      ? "0 0 20px rgba(56, 189, 248, 0.3)"
                      : isHovered
                      ? "0 4px 16px rgba(2, 132, 199, 0.2)"
                      : "0 4px 12px rgba(0,0,0,0.4)",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "border 0.15s ease, box-shadow 0.15s ease",
                    zIndex: isSelected ? 15 : isHovered ? 12 : 10,
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      padding: "10px 14px",
                      background: isSelected
                        ? "linear-gradient(90deg, #1e293b, #0f172a)"
                        : isHovered
                        ? "#162032"
                        : "#111827",
                      borderBottom: "1px solid #1e293b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon name={table.icon || "Database"} size={16} color="#38bdf8" />
                      <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#f8fafc" }}>
                        {table.name}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8", background: "#1e293b", padding: "2px 6px", borderRadius: "4px" }}>
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
                            onMouseEnter={() => setHoveredColKey(colKey)}
                            onMouseLeave={() => setHoveredColKey(null)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "5px 14px",
                              fontSize: "0.78rem",
                              background: isColHovered ? "rgba(56, 189, 248, 0.1)" : "transparent",
                              borderBottom: "1px solid rgba(255,255,255,0.03)",
                              transition: "background 0.1s ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {col.primaryKey && (
                                <span style={{ background: "#fbbf24", color: "#78350f", fontWeight: 800, fontSize: "0.6rem", padding: "1px 4px", borderRadius: "3px" }}>
                                  PK
                                </span>
                              )}
                              {isFk && (
                                <span style={{ background: "#38bdf8", color: "#0c4a6e", fontWeight: 800, fontSize: "0.6rem", padding: "1px 4px", borderRadius: "3px" }}>
                                  FK
                                </span>
                              )}
                              <span style={{ color: col.primaryKey ? "#fde68a" : isFk ? "#7dd3fc" : "#e2e8f0", fontWeight: col.primaryKey ? 600 : 400 }}>
                                {col.name}
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "monospace" }}>
                                {col.type}
                              </span>
                              {col.nullable && (
                                <span style={{ fontSize: "0.65rem", color: "#475569" }} title="Nullable">?</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Card Footer Relations Bar */}
                  {tableRel.length > 0 && (
                    <div style={{ padding: "6px 14px", background: "#080e1a", borderTop: "1px solid #1e293b", fontSize: "0.7rem", color: "#94a3b8", display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, color: "#64748b" }}>Refs:</span>
                      {tableRel.map((r, i) => (
                        <span key={i} style={{ color: r.fromTable === table.name ? "#38bdf8" : "#a7f3d0", fontWeight: 500 }}>
                          {r.fromTable === table.name ? `→ ${r.toTable}` : `← ${r.fromTable}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Inspector Drawer Panel (When Table Selected) */}
        {activeTable && (
          <div
            style={{
              width: "320px",
              background: "#0f172a",
              borderLeft: "1px solid #1e293b",
              display: "flex",
              flexDirection: "column",
              zIndex: 25,
              boxShadow: "-4px 0 16px rgba(0,0,0,0.4)",
            }}
          >
            {/* Inspector Header */}
            <div style={{ padding: "14px 16px", background: "#1e293b", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name={activeTable.icon || "Database"} size={18} color="#38bdf8" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f8fafc" }}>
                    {activeTable.name}
                  </div>
                  <div style={{ fontSize: "0.725rem", color: "#64748b" }}>
                    Schema: {activeTable.schema}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTableId(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <Icon name="Close" size={16} />
              </button>
            </div>

            {/* Inspector Body Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Quick Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "10px", background: "#162032", borderRadius: "6px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Total Columns</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#38bdf8" }}>{activeTable.columns?.length || 0}</div>
                </div>
                <div style={{ padding: "10px", background: "#162032", borderRadius: "6px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Record Count</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#a7f3d0" }}>{activeTable.rowCount ?? 0}</div>
                </div>
              </div>

              {/* Inbound & Outbound Relationships */}
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "8px" }}>
                  Connected Relationships
                </div>
                {relationships.filter(r => r.fromTable === activeTable.name || r.toTable === activeTable.name).length === 0 ? (
                  <div style={{ fontSize: "0.78rem", color: "#64748b", fontStyle: "italic" }}>
                    No foreign key relationships detected for this entity.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {relationships
                      .filter(r => r.fromTable === activeTable.name || r.toTable === activeTable.name)
                      .map((rel, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "8px 10px",
                            background: "#162032",
                            borderRadius: "6px",
                            border: "1px solid #1e293b",
                            fontSize: "0.78rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <span style={{ color: rel.fromTable === activeTable.name ? "#38bdf8" : "#a7f3d0", fontWeight: 600 }}>
                              {rel.fromTable === activeTable.name ? `FK: ${rel.fromCol}` : `Referenced By: ${rel.fromTable}`}
                            </span>
                          </div>
                          <span style={{ color: "#94a3b8" }}>
                            → {rel.toTable}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Column Specification Table */}
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "8px" }}>
                  Schema Columns
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {(activeTable.columns || []).map((col) => (
                    <div
                      key={col.name}
                      style={{
                        padding: "6px 10px",
                        background: "#162032",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: col.primaryKey ? "#fde68a" : "#e2e8f0", fontWeight: col.primaryKey ? 600 : 400 }}>
                        {col.name}
                      </span>
                      <span style={{ color: "#64748b", fontFamily: "monospace" }}>
                        {col.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
