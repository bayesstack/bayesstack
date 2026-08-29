import { useState, useLayoutEffect, RefObject } from "react";

export interface SmartPositionOptions {
  containerRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  preferredPlacement?: "top" | "bottom" | "left" | "right";
}

export interface SmartPositionResult {
  placement: "top" | "bottom" | "left" | "right";
  align: "center" | "left" | "right";
}

export function useSmartPositioning({
  containerRef,
  panelRef,
  isOpen,
  preferredPlacement = "bottom",
}: SmartPositionOptions): SmartPositionResult {
  const [position, setPosition] = useState<SmartPositionResult>({
    placement: preferredPlacement,
    align: "center",
  });

  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const updatePosition = () => {
      const containerEl = containerRef.current;
      const panelEl = panelRef.current;
      if (!containerEl) return;

      const triggerRect = containerEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Estimate panel size if panelEl is not yet measured
      const panelHeight = panelEl ? panelEl.offsetHeight : 180;
      const panelWidth = panelEl ? panelEl.offsetWidth : 280;

      let nextPlacement = preferredPlacement;

      // Vertical flip detection
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (
        preferredPlacement === "bottom" &&
        spaceBelow < panelHeight + 12 &&
        spaceAbove > spaceBelow
      ) {
        nextPlacement = "top";
      } else if (
        preferredPlacement === "top" &&
        spaceAbove < panelHeight + 12 &&
        spaceBelow > spaceAbove
      ) {
        nextPlacement = "bottom";
      }

      // Horizontal alignment / edge collision detection
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      const halfPanel = panelWidth / 2;

      let align: "center" | "left" | "right" = "center";

      if (triggerCenter - halfPanel < 16) {
        align = "left";
      } else if (triggerCenter + halfPanel > viewportWidth - 16) {
        align = "right";
      }

      setPosition({ placement: nextPlacement, align });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, preferredPlacement, containerRef, panelRef]);

  return position;
}
