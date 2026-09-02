"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Icon, Badge, type DbTable } from "@bayesstack/ui";

export function ErDiagramViewer({ tables }: { tables: DbTable[] }) {
  const [search, setSearch] = useState<string>("");
  const [zoom, setZoom] = useState<number>(100);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [hoveredColKey, setHoveredColKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
  const [linesMode, setLinesMode] = useState<"smart" | "all" | "none">("smart");

  // Dynamic positions for draggable entity cards
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragState, setDragState] = useState<{
    tableName: string;
    startX: number;
    startY: number;
    initialNodeX: number;
    initialNodeY: number;
  } | null>(null);

  // Canvas Panning State
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanningCanvas, setIsPanningCanvas] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isLight = theme === "light";

  const t = {
    canvasBg: isLight ? "#f8fafc" : "#0b0f19",
    dotColor: isLight ? "rgba(100, 116, 139, 0.18)" : "rgba(148, 163, 184, 0.07)",
    toolbarBg: isLight ? "#ffffff" : "#0f172a",
    toolbarBorder: isLight ? "#e2e8f0" : "#1e293b",
    toolbarText: isLight ? "#0f172a" : "#f8fafc",
    subtleText: isLight ? "#64748b" : "#94a3b8",
    inputBg: isLight ? "#f1f5f9" : "#1e293b",
    inputBorder: isLight ? "#cbd5e1" : "#334155",

    // Card Tokens
    cardBg: isLight ? "#ffffff" : "#0f172a",
    cardHeaderBg: isLight ? "#f8fafc" : "#111827",
    cardHeaderSelectedBg: isLight ? "#e4f2ef" : "#1e293b",
    cardBorder: isLight ? "#e2e8f0" : "#1e293b",
    cardBorderHover: isLight ? "#0b6763" : "#0284c7",
    cardBorderSelected: isLight ? "#0b6763" : "#38bdf8",
    cardShadow: isLight
      ? "0 4px 14px rgba(15, 23, 42, 0.06)"
      : "0 4px 12px rgba(0,0,0,0.4)",
    cardShadowSelected: isLight
      ? "0 0 20px rgba(11, 103, 99, 0.2)"
      : "0 0 20px rgba(56, 189, 248, 0.3)",

    cardTitle: isLight ? "#0f172a" : "#f8fafc",
    colRowHover: isLight ? "rgba(11, 103, 99, 0.06)" : "rgba(56, 189, 248, 0.1)",
    colRowBorder: isLight ? "#f1f5f9" : "rgba(255,255,255,0.03)",
    colName: isLight ? "#1e293b" : "#e2e8f0",
    colType: isLight ? "#64748b" : "#64748b",

    // Key Badges
    pkBg: isLight ? "#fef3c7" : "#fbbf24",
    pkColor: isLight ? "#92400e" : "#78350f",
    fkBg: isLight ? "#e0f2fe" : "#38bdf8",
    fkColor: isLight ? "#0369a1" : "#0c4a6e",

    // Connectors
    strokeNormal: isLight ? "#cbd5e1" : "#475569",
    strokeHighlighted: isLight ? "#0b6763" : "#38bdf8",
    strokeHovered: isLight ? "#d97706" : "#f59e0b",
    markerFill: isLight ? "#0b6763" : "#38bdf8",
    markerActiveFill: isLight ? "#d97706" : "#f59e0b",

    // Inspector Side Drawer
    inspectorBg: isLight ? "#ffffff" : "#0f172a",
    inspectorBorder: isLight ? "#e2e8f0" : "#1e293b",
    inspectorHeaderBg: isLight ? "#f8fafc" : "#1e293b",
    inspectorCardBg: isLight ? "#f1f5f9" : "#162032",
    inspectorCardBorder: isLight ? "#e2e8f0" : "#1e293b",
  };

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

  // Auto-initialize node positions in grid layout
  useEffect(() => {
    const initialPos: Record<string, { x: number; y: number }> = {};
    const CARD_WIDTH = 300;
    const GAP_X = 90;
    const GAP_Y = 60;
    const COLS_PER_ROW = 3;

    schemaTables.forEach((table, index) => {
      if (!nodePositions[table.name]) {
        const colIndex = index % COLS_PER_ROW;
        const rowIndex = Math.floor(index / COLS_PER_ROW);
        initialPos[table.name] = {
          x: 40 + colIndex * (CARD_WIDTH + GAP_X),
          y: 40 + rowIndex * (360 + GAP_Y),
        };
      }
    });

    if (Object.keys(initialPos).length > 0) {
      setNodePositions((prev) => ({ ...initialPos, ...prev }));
    }
  }, [schemaTables]);

  const handleResetLayout = () => {
    const resetPos: Record<string, { x: number; y: number }> = {};
    const CARD_WIDTH = 300;
    const GAP_X = 90;
    const GAP_Y = 60;
    const COLS_PER_ROW = 3;

    schemaTables.forEach((table, index) => {
      const colIndex = index % COLS_PER_ROW;
      const rowIndex = Math.floor(index / COLS_PER_ROW);
      resetPos[table.name] = {
        x: 40 + colIndex * (CARD_WIDTH + GAP_X),
        y: 40 + rowIndex * (360 + GAP_Y),
      };
    });

    setNodePositions(resetPos);
    setPanOffset({ x: 0, y: 0 });
    setZoom(100);
  };

  const handleAutoFocus = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoom(100);
  };

  // Canvas Panning & Card Dragging Mouse Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "DIV" ||
      target.tagName === "SVG" ||
      target.tagName === "path"
    ) {
      setIsPanningCanvas(true);
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
    }
  };

  const handleCardMouseDown = (e: React.MouseEvent, tableName: string) => {
    e.stopPropagation();
    const current = nodePositions[tableName] || { x: 40, y: 40 };
    setDragState({
      tableName,
      startX: e.clientX,
      startY: e.clientY,
      initialNodeX: current.x,
      initialNodeY: current.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanningCanvas) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (dragState) {
      const scale = zoom / 100;
      const deltaX = (e.clientX - dragState.startX) / scale;
      const deltaY = (e.clientY - dragState.startY) / scale;

      const newX = Math.max(10, dragState.initialNodeX + deltaX);
      const newY = Math.max(10, dragState.initialNodeY + deltaY);

      setNodePositions((prev) => ({
        ...prev,
        [dragState.tableName]: { x: newX, y: newY },
      }));
    }
  };

  const handleMouseUp = () => {
    if (isPanningCanvas) setIsPanningCanvas(false);
    if (dragState) setDragState(null);
  };

  // Compute 2D positions for entity nodes
  const tablePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; width: number; height: number }> = {};
    const CARD_WIDTH = 300;
    const COLS_PER_ROW = 3;
    const GAP_X = 90;
    const GAP_Y = 60;

    schemaTables.forEach((table, index) => {
      const pos = nodePositions[table.name] || {
        x: 40 + (index % COLS_PER_ROW) * (CARD_WIDTH + GAP_X),
        y: 40 + Math.floor(index / COLS_PER_ROW) * (360 + GAP_Y),
      };

      const colCount = table.columns?.length || 0;
      const estimatedHeight = viewMode === "detailed" ? 50 + colCount * 28 + 36 : 80;

      positions[table.name] = {
        x: pos.x,
        y: pos.y,
        width: CARD_WIDTH,
        height: estimatedHeight,
      };
    });

    return positions;
  }, [schemaTables, nodePositions, viewMode]);

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
    1400,
    ...Object.values(tablePositions).map((p) => p.x + p.width + 200)
  );
  const totalHeight = Math.max(
    800,
    ...Object.values(tablePositions).map((p) => p.y + p.height + 200)
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: t.canvasBg,
        color: t.toolbarText,
        overflow: "hidden",
        position: "relative",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Controls Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          background: t.toolbarBg,
          borderBottom: `1px solid ${t.toolbarBorder}`,
          zIndex: 20,
          gap: "12px",
          flexWrap: "wrap",
          boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.05)" : "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", background: isLight ? "#e4f2ef" : "rgba(56, 189, 248, 0.1)", border: `1px solid ${isLight ? "#bce3dc" : "rgba(56, 189, 248, 0.2)"}` }}>
            <Icon name="Flowchart" size={18} color={isLight ? "#0b6763" : "#38bdf8"} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.925rem", color: t.toolbarText, lineHeight: 1.2 }}>
              Database ER Visualizer
            </div>
            <div style={{ fontSize: "0.725rem", color: t.subtleText }}>
              Pan Canvas • Drag Entity Nodes • Auto-Focus View
            </div>
          </div>

          <Badge variant="subtle" size="sm" style={{ background: t.inputBg, color: isLight ? "#0b6763" : "#38bdf8", border: `1px solid ${t.inputBorder}`, marginLeft: "8px" }}>
            {schemaTables.length} Entities
          </Badge>
          <Badge variant="subtle" size="sm" style={{ background: t.inputBg, color: isLight ? "#15803d" : "#a7f3d0", border: `1px solid ${t.inputBorder}` }}>
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
              background: t.inputBg,
              border: `1px solid ${t.inputBorder}`,
              borderRadius: "6px",
              padding: "5px 10px",
            }}
          >
            <Icon name="Search" size={14} color={t.subtleText} />
            <input
              type="text"
              placeholder="Search table / column..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: t.toolbarText,
                fontSize: "0.8rem",
                width: "140px",
              }}
            />
          </div>

          {/* Connection Lines Toggle */}
          <div style={{ display: "flex", alignItems: "center", background: t.inputBg, borderRadius: "6px", border: `1px solid ${t.inputBorder}`, padding: "2px" }}>
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
                color: linesMode === "smart" ? "#ffffff" : t.subtleText,
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
                color: linesMode === "all" ? "#ffffff" : t.subtleText,
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
                color: linesMode === "none" ? "#ffffff" : t.subtleText,
                cursor: "pointer",
              }}
              title="Hide connector lines"
            >
              Cards Only
            </button>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: "flex", alignItems: "center", background: t.inputBg, borderRadius: "6px", border: `1px solid ${t.inputBorder}`, padding: "2px" }}>
            <button
              type="button"
              onClick={() => setViewMode("detailed")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "4px",
                border: "none",
                background: viewMode === "detailed" ? (isLight ? "#0b6763" : "#0284c7") : "transparent",
                color: viewMode === "detailed" ? "#ffffff" : t.subtleText,
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
                background: viewMode === "compact" ? (isLight ? "#0b6763" : "#0284c7") : "transparent",
                color: viewMode === "compact" ? "#ffffff" : t.subtleText,
                cursor: "pointer",
              }}
            >
              Compact
            </button>
          </div>

          {/* Auto-Focus View Button */}
          <button
            type="button"
            onClick={handleAutoFocus}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 10px",
              borderRadius: "6px",
              background: isLight ? "#e4f2ef" : "rgba(56, 189, 248, 0.1)",
              border: `1px solid ${isLight ? "#bce3dc" : "rgba(56, 189, 248, 0.3)"}`,
              color: isLight ? "#0b6763" : "#38bdf8",
              fontWeight: 700,
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
            title="Center and reset canvas view"
          >
            <Icon name="Maximize" size={14} />
            <span>Auto Focus</span>
          </button>

          {/* Reset Layout */}
          <button
            type="button"
            onClick={handleResetLayout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 10px",
              borderRadius: "6px",
              background: t.inputBg,
              border: `1px solid ${t.inputBorder}`,
              color: t.toolbarText,
              fontWeight: 600,
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
            title="Reset cards to default grid layout"
          >
            <Icon name="Refresh" size={14} />
            <span>Reset Grid</span>
          </button>

          {/* Theme Mode Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={() => setTheme(isLight ? "dark" : "light")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 10px",
              borderRadius: "6px",
              background: t.inputBg,
              border: `1px solid ${t.inputBorder}`,
              color: t.toolbarText,
              fontWeight: 600,
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
            title="Toggle Light / Dark mode"
          >
            <Icon name={isLight ? "Moon" : "Sun"} size={14} />
            <span>{isLight ? "Dark" : "Light"}</span>
          </button>

          {/* Zoom Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.subtleText, padding: "5px 8px", borderRadius: "4px", cursor: "pointer" }}
              title="Zoom out"
            >
              <Icon name="Remove" size={12} />
            </button>
            <span style={{ fontSize: "0.75rem", color: t.subtleText, minWidth: "38px", textAlign: "center" }}>{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.subtleText, padding: "5px 8px", borderRadius: "4px", cursor: "pointer" }}
              title="Zoom in"
            >
              <Icon name="Add" size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Diagram Area (Scrollable Canvas + Side Panel) */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Scrollable Diagram Surface */}
        <div
          onMouseDown={handleCanvasMouseDown}
          style={{
            flex: 1,
            overflow: "auto",
            position: "relative",
            background: t.canvasBg,
            backgroundImage: `radial-gradient(${t.dotColor} 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            cursor: isPanningCanvas ? "grabbing" : "grab",
          }}
        >
          <div
            style={{
              width: `${totalWidth}px`,
              height: `${totalHeight}px`,
              position: "relative",
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
              transformOrigin: "top left",
              transition: dragState || isPanningCanvas ? "none" : "transform 0.15s ease-out",
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
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={t.markerFill} />
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
                    <path d="M 0 1 L 10 5 L 0 9 z" fill={t.markerActiveFill} />
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

                  const opacity =
                    linesMode === "all"
                      ? isHighlighted ? 1 : 0.6
                      : isHighlighted ? 1 : (selectedTableId || hoveredTableId) ? 0.08 : 0.45;

                  const strokeColor = isHighlighted
                    ? isExactColHovered ? t.strokeHovered : t.strokeHighlighted
                    : t.strokeNormal;

                  const strokeWidth = isHighlighted ? 3 : 1.5;

                  // Smooth cubic bezier curve calculation
                  const dx = Math.max(60, Math.abs(rel.x2 - rel.x1) / 2);
                  const cx1 = rel.x1 + (rel.x1 < rel.x2 ? dx : -dx);
                  const cy1 = rel.y1;
                  const cx2 = rel.x2 + (rel.x1 < rel.x2 ? -dx : dx);
                  const cy2 = rel.y2;

                  const pathD = `M ${rel.x1} ${rel.y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${rel.x2} ${rel.y2}`;

                  return (
                    <g key={rel.id} style={{ opacity, transition: dragState || isPanningCanvas ? "none" : "opacity 0.2s ease" }}>
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
                          fill={t.strokeHighlighted}
                          fontSize="11"
                          fontWeight="700"
                          textAnchor="middle"
                          style={{
                            textShadow: isLight
                              ? "0 1px 3px rgba(255,255,255,0.9)"
                              : "0 1px 4px rgba(0,0,0,0.8)",
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
              const isDragging = dragState?.tableName === table.name;

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
                    background: t.cardBg,
                    borderRadius: "10px",
                    border: isDragging
                      ? `2px dashed ${t.cardBorderSelected}`
                      : isSelected
                      ? `2px solid ${t.cardBorderSelected}`
                      : isHovered
                      ? `1px solid ${t.cardBorderHover}`
                      : `1px solid ${t.cardBorder}`,
                    boxShadow: isDragging
                      ? "0 12px 30px rgba(0,0,0,0.2)"
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
                    onMouseDown={(e) => handleCardMouseDown(e, table.name)}
                    style={{
                      padding: "10px 14px",
                      background: isSelected
                        ? t.cardHeaderSelectedBg
                        : isHovered
                        ? isLight ? "#f1f5f9" : "#162032"
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
                      <Icon name={table.icon || "Database"} size={16} color={isLight ? "#0b6763" : "#38bdf8"} />
                      <span style={{ fontWeight: 700, fontSize: "0.875rem", color: t.cardTitle }}>
                        {table.name}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.7rem", color: t.subtleText, background: t.inputBg, padding: "2px 6px", borderRadius: "4px" }}>
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
                              background: isColHovered ? t.colRowHover : "transparent",
                              borderBottom: `1px solid ${t.colRowBorder}`,
                              transition: "background 0.1s ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {col.primaryKey && (
                                <span style={{ background: t.pkBg, color: t.pkColor, fontWeight: 800, fontSize: "0.6rem", padding: "1px 4px", borderRadius: "3px" }}>
                                  PK
                                </span>
                              )}
                              {isFk && (
                                <span style={{ background: t.fkBg, color: t.fkColor, fontWeight: 800, fontSize: "0.6rem", padding: "1px 4px", borderRadius: "3px" }}>
                                  FK
                                </span>
                              )}
                              <span style={{ color: col.primaryKey ? (isLight ? "#92400e" : "#fde68a") : isFk ? (isLight ? "#0369a1" : "#7dd3fc") : t.colName, fontWeight: col.primaryKey ? 600 : 400 }}>
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
                    <div style={{ padding: "6px 14px", background: isLight ? "#f8fafc" : "#080e1a", borderTop: `1px solid ${t.cardBorder}`, fontSize: "0.7rem", color: t.subtleText, display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, color: t.subtleText }}>Refs:</span>
                      {tableRel.map((r, i) => (
                        <span key={i} style={{ color: r.fromTable === table.name ? (isLight ? "#0b6763" : "#38bdf8") : (isLight ? "#15803d" : "#a7f3d0"), fontWeight: 500 }}>
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
              background: t.inspectorBg,
              borderLeft: `1px solid ${t.inspectorBorder}`,
              display: "flex",
              flexDirection: "column",
              zIndex: 25,
              boxShadow: isLight ? "-4px 0 16px rgba(15, 23, 42, 0.08)" : "-4px 0 16px rgba(0,0,0,0.4)",
            }}
          >
            {/* Inspector Header */}
            <div style={{ padding: "14px 16px", background: t.inspectorHeaderBg, borderBottom: `1px solid ${t.inspectorBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name={activeTable.icon || "Database"} size={18} color={isLight ? "#0b6763" : "#38bdf8"} />
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
                onClick={() => setSelectedTableId(null)}
                style={{ background: "transparent", border: "none", color: t.subtleText, cursor: "pointer", padding: "4px" }}
              >
                <Icon name="Close" size={16} />
              </button>
            </div>

            {/* Inspector Body Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Quick Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "10px", background: t.inspectorCardBg, borderRadius: "6px", border: `1px solid ${t.inspectorCardBorder}` }}>
                  <div style={{ fontSize: "0.7rem", color: t.subtleText }}>Total Columns</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: isLight ? "#0b6763" : "#38bdf8" }}>{activeTable.columns?.length || 0}</div>
                </div>
                <div style={{ padding: "10px", background: t.inspectorCardBg, borderRadius: "6px", border: `1px solid ${t.inspectorCardBorder}` }}>
                  <div style={{ fontSize: "0.7rem", color: t.subtleText }}>Record Count</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: isLight ? "#15803d" : "#a7f3d0" }}>{activeTable.rowCount ?? 0}</div>
                </div>
              </div>

              {/* Inbound & Outbound Relationships */}
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: t.toolbarText, marginBottom: "8px" }}>
                  Connected Relationships
                </div>
                {relationships.filter(r => r.fromTable === activeTable.name || r.toTable === activeTable.name).length === 0 ? (
                  <div style={{ fontSize: "0.78rem", color: t.subtleText, fontStyle: "italic" }}>
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
                            background: t.inspectorCardBg,
                            borderRadius: "6px",
                            border: `1px solid ${t.inspectorCardBorder}`,
                            fontSize: "0.78rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <span style={{ color: rel.fromTable === activeTable.name ? (isLight ? "#0b6763" : "#38bdf8") : (isLight ? "#15803d" : "#a7f3d0"), fontWeight: 600 }}>
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
                        background: t.inspectorCardBg,
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: col.primaryKey ? (isLight ? "#92400e" : "#fde68a") : t.colName, fontWeight: col.primaryKey ? 600 : 400 }}>
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
        )}
      </div>
    </div>
  );
}
