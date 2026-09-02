import React from "react";
import { Icon } from "@bayesstack/ui";

interface ErDiagramFloatingDockProps {
  zoom: number;
  onZoomChange: (zoom: number | ((prev: number) => number)) => void;
  onAutoFocus: () => void;
  onResetLayout: () => void;
  isSideInspectorOpen: boolean;
}

export function ErDiagramFloatingDock({
  zoom,
  onZoomChange,
  onAutoFocus,
  onResetLayout,
  isSideInspectorOpen,
}: ErDiagramFloatingDockProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: isSideInspectorOpen ? "340px" : "20px",
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: "4px",
        backgroundColor: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(12px)",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        boxShadow: "0 6px 20px rgba(15, 23, 42, 0.12)",
        padding: "4px 6px",
        transition: "right 0.2s ease",
      }}
    >
      {/* Auto Focus Icon Button */}
      <button
        type="button"
        onClick={onAutoFocus}
        style={{
          width: "30px",
          height: "30px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          backgroundColor: "#e4f2ef",
          border: "1px solid #bce3dc",
          color: "#0b6763",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        title="Auto Focus (Center & Reset View)"
      >
        <Icon name="Maximize" size={15} />
      </button>

      {/* Reset Grid Layout Icon Button */}
      <button
        type="button"
        onClick={onResetLayout}
        style={{
          width: "30px",
          height: "30px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          backgroundColor: "#f1f5f9",
          border: "1px solid #cbd5e1",
          color: "#334155",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        title="Reset Grid Layout"
      >
        <Icon name="Refresh" size={15} />
      </button>

      <div style={{ height: "18px", borderLeft: "1px solid #cbd5e1", margin: "0 2px" }} />

      {/* Zoom Out Button */}
      <button
        type="button"
        onClick={() => onZoomChange((z) => Math.max(50, z - 10))}
        style={{
          width: "30px",
          height: "30px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          backgroundColor: "#f1f5f9",
          border: "1px solid #cbd5e1",
          color: "#334155",
          cursor: "pointer",
        }}
        title="Zoom Out (-10%)"
      >
        <Icon name="Minus" size={14} />
      </button>

      {/* Zoom Level Readout (Click to reset 100%) */}
      <button
        type="button"
        onClick={() => onZoomChange(100)}
        style={{
          height: "30px",
          padding: "0 8px",
          fontSize: "0.74rem",
          fontWeight: 700,
          color: "#0b6763",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        title="Click to reset zoom to 100%"
      >
        {zoom}%
      </button>

      {/* Zoom In Button */}
      <button
        type="button"
        onClick={() => onZoomChange((z) => Math.min(150, z + 10))}
        style={{
          width: "30px",
          height: "30px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          backgroundColor: "#f1f5f9",
          border: "1px solid #cbd5e1",
          color: "#334155",
          cursor: "pointer",
        }}
        title="Zoom In (+10%)"
      >
        <Icon name="Add" size={14} />
      </button>
    </div>
  );
}
