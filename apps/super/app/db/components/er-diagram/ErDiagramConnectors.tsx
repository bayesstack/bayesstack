import React from "react";
import { type DbTable } from "@bayesstack/ui";
import { Relationship, ErDiagramThemeTokens } from "./types";

interface ErDiagramConnectorsProps {
  relationships: Relationship[];
  activeTable: DbTable | null;
  hoveredTableId: string | null;
  hoveredColKey: string | null;
  dragState: any;
  isPanningCanvas: boolean;
  t: ErDiagramThemeTokens;
}

export function ErDiagramConnectors({
  relationships,
  activeTable,
  hoveredTableId,
  hoveredColKey,
  dragState,
  isPanningCanvas,
  t,
}: ErDiagramConnectorsProps) {
  return (
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

        const opacity = isHighlighted
          ? 1
          : (activeTable || hoveredTableId)
          ? 0.08
          : 0.45;

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
                  textShadow: "0 1px 3px rgba(255,255,255,0.9)",
                }}
              >
                {rel.fromCol} → {rel.toTable}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
