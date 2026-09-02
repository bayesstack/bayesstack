"use client";

import React from "react";
import { type DbTable } from "@bayesstack/ui";
import { ER_THEME_TOKENS } from "./er-diagram/theme";
import { useErDiagramState } from "./er-diagram/useErDiagramState";
import { ErDiagramToolbar } from "./er-diagram/ErDiagramToolbar";
import { ErDiagramConnectors } from "./er-diagram/ErDiagramConnectors";
import { ErDiagramNodeCard } from "./er-diagram/ErDiagramNodeCard";
import { ErDiagramFloatingDock } from "./er-diagram/ErDiagramFloatingDock";
import { ErDiagramSideInspector } from "./er-diagram/ErDiagramSideInspector";

export function ErDiagramViewer({ tables }: { tables: DbTable[] }) {
  const t = ER_THEME_TOKENS;
  const state = useErDiagramState(tables);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: t.canvasBg,
        color: t.toolbarText,
        overflow: "hidden",
        position: "relative",
      }}
      onMouseMove={state.handleMouseMove}
      onMouseUp={state.handleMouseUp}
    >
      {/* Super Compact Control Panel Header */}
      <ErDiagramToolbar
        search={state.search}
        onSearchChange={state.setSearch}
        viewMode={state.viewMode}
        onViewModeChange={state.setViewMode}
        schemaTablesCount={state.schemaTables.length}
        relationshipsCount={state.relationships.length}
        t={t}
      />

      {/* Main Diagram Area (Scrollable Canvas + Floating Map Controls + Side Panel) */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Scrollable Diagram Surface */}
        <div
          onMouseDown={state.handleCanvasMouseDown}
          style={{
            flex: 1,
            overflow: "auto",
            position: "relative",
            backgroundColor: t.canvasBg,
            backgroundImage: `radial-gradient(${t.dotColor} 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            backgroundPosition: `${state.panOffset.x}px ${state.panOffset.y}px`,
            cursor: state.isPanningCanvas ? "grabbing" : "grab",
          }}
        >
          <div
            style={{
              width: `${state.totalWidth}px`,
              height: `${state.totalHeight}px`,
              position: "relative",
              transform: `translate(${state.panOffset.x}px, ${state.panOffset.y}px) scale(${state.zoom / 100})`,
              transformOrigin: "top left",
              transition: state.dragState || state.isPanningCanvas ? "none" : "transform 0.15s ease-out",
            }}
          >
            {/* SVG Connection Lines Overlay */}
            <ErDiagramConnectors
              relationships={state.relationships}
              activeTable={state.activeTable}
              hoveredTableId={state.hoveredTableId}
              hoveredColKey={state.hoveredColKey}
              dragState={state.dragState}
              isPanningCanvas={state.isPanningCanvas}
              t={t}
            />

            {/* Entity Nodes Cards */}
            {state.filteredTables.map((table) => {
              const pos = state.tablePositions[table.name] || { x: 0, y: 0, width: 300, height: 100 };
              const isSelected = state.selectedTableId === table.id;
              const isHovered = state.hoveredTableId === table.name;
              const isDragging = state.dragState?.tableName === table.name;

              return (
                <ErDiagramNodeCard
                  key={table.id}
                  table={table}
                  pos={pos}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isDragging={isDragging}
                  viewMode={state.viewMode}
                  hoveredColKey={state.hoveredColKey}
                  relationships={state.relationships}
                  isPanningCanvas={state.isPanningCanvas}
                  t={t}
                  onSelectTable={state.setSelectedTableId}
                  onHoverTable={state.setHoveredTableId}
                  onHoverCol={state.setHoveredColKey}
                  onCardMouseDown={state.handleCardMouseDown}
                />
              );
            })}
          </div>
        </div>

        {/* Floating Map-Style Canvas Controls Widget (Bottom Right) */}
        <ErDiagramFloatingDock
          zoom={state.zoom}
          onZoomChange={state.setZoom}
          onAutoFocus={state.handleAutoFocus}
          onResetLayout={state.handleResetLayout}
          isSideInspectorOpen={!!state.activeTable}
        />

        {/* Side Inspector Drawer Panel (When Table Selected) */}
        {state.activeTable && (
          <ErDiagramSideInspector
            activeTable={state.activeTable}
            relationships={state.relationships}
            onClose={() => state.setSelectedTableId(null)}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
