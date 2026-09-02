import React, { useState, useMemo, useEffect } from "react";
import { type DbTable } from "@bayesstack/ui";
import { NodePosition, NodeBounds, Relationship, DragState } from "./types";

export function useErDiagramState(tables: DbTable[]) {
  const [search, setSearch] = useState<string>("");
  const [zoom, setZoom] = useState<number>(100);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [hoveredColKey, setHoveredColKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");

  // Dynamic positions for draggable entity cards
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Canvas Panning State
  const [panOffset, setPanOffset] = useState<NodePosition>({ x: 0, y: 0 });
  const [isPanningCanvas, setIsPanningCanvas] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<NodePosition>({ x: 0, y: 0 });

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
    const initialPos: Record<string, NodePosition> = {};
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
    const resetPos: Record<string, NodePosition> = {};
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
    const positions: Record<string, NodeBounds> = {};
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
    const rels: Relationship[] = [];

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

  return {
    search,
    setSearch,
    zoom,
    setZoom,
    selectedTableId,
    setSelectedTableId,
    hoveredTableId,
    setHoveredTableId,
    hoveredColKey,
    setHoveredColKey,
    viewMode,
    setViewMode,
    dragState,
    panOffset,
    isPanningCanvas,
    schemaTables,
    filteredTables,
    tablePositions,
    relationships,
    activeTable,
    totalWidth,
    totalHeight,
    handleResetLayout,
    handleAutoFocus,
    handleCanvasMouseDown,
    handleCardMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
