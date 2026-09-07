import { useState, useRef, useCallback, useEffect } from "react";

export type ConsolePosition = "bottom" | "right";

export interface SplitResizeOptions {
  // Horizontal (Left-Right) split options
  defaultLeftPct?: number;
  minLeftPct?: number;
  maxLeftPct?: number;
  // Vertical (Editor-Console bottom split) options
  defaultConsoleHeight?: number;
  minConsoleHeight?: number;
  maxConsoleHeightPct?: number;
  // Horizontal (Editor-Console side split) options
  defaultConsoleWidthPct?: number;
  minConsoleWidthPct?: number;
  maxConsoleWidthPct?: number;
  defaultPosition?: ConsolePosition;
}

export function useSplitResize({
  defaultLeftPct = 44,
  minLeftPct = 20,
  maxLeftPct = 75,
  defaultConsoleHeight = 280,
  minConsoleHeight = 42,
  maxConsoleHeightPct = 80,
  defaultConsoleWidthPct = 42,
  minConsoleWidthPct = 25,
  maxConsoleWidthPct = 65,
  defaultPosition = "bottom",
}: SplitResizeOptions = {}) {
  // Container references
  const workspaceRef = useRef<HTMLElement>(null);
  const rightPaneRef = useRef<HTMLElement>(null);

  // Horizontal main split state (Left Pane width %)
  const [leftWidthPct, setLeftWidthPct] = useState<number>(defaultLeftPct);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(false);
  const lastLeftWidthRef = useRef<number>(defaultLeftPct);
  const [isHDragging, setIsHDragging] = useState<boolean>(false);

  // Console layout mode
  const [consolePosition, setConsolePosition] = useState<ConsolePosition>(defaultPosition);

  // Vertical split state (Console bottom split height in px)
  const [consoleHeight, setConsoleHeight] = useState<number>(defaultConsoleHeight);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState<boolean>(false);
  const lastConsoleHeightRef = useRef<number>(defaultConsoleHeight);
  const [isVDragging, setIsVDragging] = useState<boolean>(false);

  // Horizontal side split state (Console side split width in %)
  const [consoleWidthPct, setConsoleWidthPct] = useState<number>(defaultConsoleWidthPct);
  const lastConsoleWidthRef = useRef<number>(defaultConsoleWidthPct);
  const [isSideDragging, setIsSideDragging] = useState<boolean>(false);

  // 1. Main Workspace Horizontal Pointer Drag Handler (Left Pane vs Right Pane)
  const handleHPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isLeftCollapsed) return;
      e.preventDefault();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);
      setIsHDragging(true);

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!workspaceRef.current) return;
        const rect = workspaceRef.current.getBoundingClientRect();
        if (rect.width <= 0) return;

        const deltaX = moveEvent.clientX - rect.left;
        let pct = (deltaX / rect.width) * 100;

        if (pct < minLeftPct) pct = minLeftPct;
        if (pct > maxLeftPct) pct = maxLeftPct;

        setLeftWidthPct(Math.round(pct * 10) / 10);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        try {
          target.releasePointerCapture(upEvent.pointerId);
        } catch {
          // pointer capture might already be released
        }
        setIsHDragging(false);
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
        target.removeEventListener("pointercancel", onPointerUp);
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
      target.addEventListener("pointercancel", onPointerUp);
    },
    [isLeftCollapsed, minLeftPct, maxLeftPct]
  );

  const resetLeftWidth = useCallback(() => {
    setIsLeftCollapsed(false);
    setLeftWidthPct(defaultLeftPct);
  }, [defaultLeftPct]);

  const toggleLeftCollapse = useCallback(() => {
    setIsLeftCollapsed((prev) => {
      if (!prev) {
        lastLeftWidthRef.current = leftWidthPct;
        return true;
      } else {
        setLeftWidthPct(lastLeftWidthRef.current || defaultLeftPct);
        return false;
      }
    });
  }, [leftWidthPct, defaultLeftPct]);

  // 2. Vertical Pointer Drag Handler (Bottom Console Height)
  const handleVPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);
      setIsVDragging(true);

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!rightPaneRef.current) return;
        const rect = rightPaneRef.current.getBoundingClientRect();
        if (rect.height <= 0) return;

        // Distance from bottom of right pane
        let newH = rect.bottom - moveEvent.clientY;
        const maxH = (rect.height * maxConsoleHeightPct) / 100;

        if (newH < minConsoleHeight) {
          newH = minConsoleHeight;
          setIsConsoleCollapsed(true);
        } else {
          setIsConsoleCollapsed(false);
        }

        if (newH > maxH) newH = maxH;

        setConsoleHeight(Math.round(newH));
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        try {
          target.releasePointerCapture(upEvent.pointerId);
        } catch {
          // pointer capture might already be released
        }
        setIsVDragging(false);
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
        target.removeEventListener("pointercancel", onPointerUp);
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
      target.addEventListener("pointercancel", onPointerUp);
    },
    [minConsoleHeight, maxConsoleHeightPct]
  );

  const resetConsoleHeight = useCallback(() => {
    setIsConsoleCollapsed(false);
    setConsoleHeight(defaultConsoleHeight);
  }, [defaultConsoleHeight]);

  // 3. Side-by-Side Horizontal Pointer Drag Handler (Editor vs Console in Right Pane)
  const handleSidePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isConsoleCollapsed) return;
      e.preventDefault();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);
      setIsSideDragging(true);

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!rightPaneRef.current) return;
        const rect = rightPaneRef.current.getBoundingClientRect();
        if (rect.width <= 0) return;

        // Distance from right edge of right pane
        const deltaFromRight = rect.right - moveEvent.clientX;
        let pct = (deltaFromRight / rect.width) * 100;

        if (pct < minConsoleWidthPct) pct = minConsoleWidthPct;
        if (pct > maxConsoleWidthPct) pct = maxConsoleWidthPct;

        setConsoleWidthPct(Math.round(pct * 10) / 10);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        try {
          target.releasePointerCapture(upEvent.pointerId);
        } catch {
          // pointer capture might already be released
        }
        setIsSideDragging(false);
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
        target.removeEventListener("pointercancel", onPointerUp);
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
      target.addEventListener("pointercancel", onPointerUp);
    },
    [isConsoleCollapsed, minConsoleWidthPct, maxConsoleWidthPct]
  );

  const resetConsoleWidth = useCallback(() => {
    setIsConsoleCollapsed(false);
    setConsoleWidthPct(defaultConsoleWidthPct);
  }, [defaultConsoleWidthPct]);

  const toggleConsoleCollapse = useCallback(() => {
    setIsConsoleCollapsed((prev) => {
      if (!prev) {
        lastConsoleHeightRef.current = consoleHeight;
        lastConsoleWidthRef.current = consoleWidthPct;
        return true;
      } else {
        if (consolePosition === "bottom") {
          setConsoleHeight(
            lastConsoleHeightRef.current > minConsoleHeight
              ? lastConsoleHeightRef.current
              : defaultConsoleHeight
          );
        } else {
          setConsoleWidthPct(
            lastConsoleWidthRef.current || defaultConsoleWidthPct
          );
        }
        return false;
      }
    });
  }, [consoleHeight, consoleWidthPct, consolePosition, minConsoleHeight, defaultConsoleHeight, defaultConsoleWidthPct]);

  const toggleConsolePosition = useCallback(() => {
    setConsolePosition((prev) => (prev === "bottom" ? "right" : "bottom"));
    setIsConsoleCollapsed(false);
  }, []);

  // Keyboard accessibility helper for ARIA separators
  const handleKeyDownH = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setLeftWidthPct((prev) => Math.max(minLeftPct, prev - 2));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setLeftWidthPct((prev) => Math.min(maxLeftPct, prev + 2));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleLeftCollapse();
      }
    },
    [minLeftPct, maxLeftPct, toggleLeftCollapse]
  );

  const handleKeyDownV = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setConsoleHeight((prev) => Math.min(600, prev + 20));
        setIsConsoleCollapsed(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setConsoleHeight((prev) => Math.max(minConsoleHeight, prev - 20));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleConsoleCollapse();
      }
    },
    [minConsoleHeight, toggleConsoleCollapse]
  );

  // Global keyboard shortcuts for console visibility and docking.
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + ' : Toggle console minimize/expand
      if (isModifier && e.key === "'") {
        e.preventDefault();
        toggleConsoleCollapse();
        return;
      }

      // Ctrl/Cmd + Shift + L : Toggle between Bottom and Right layout
      if (isModifier && e.shiftKey && (e.key === "L" || e.key === "l")) {
        e.preventDefault();
        toggleConsolePosition();
        return;
      }

    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [toggleConsoleCollapse, toggleConsolePosition]);

  // Global user-select prevention during active dragging
  useEffect(() => {
    const isDragging = isHDragging || isVDragging || isSideDragging;
    if (isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = isVDragging ? "row-resize" : "col-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isHDragging, isVDragging, isSideDragging]);

  return {
    workspaceRef,
    rightPaneRef,
    // Horizontal main split
    leftWidthPct,
    setLeftWidthPct,
    isLeftCollapsed,
    setIsLeftCollapsed,
    isHDragging,
    handleHPointerDown,
    resetLeftWidth,
    toggleLeftCollapse,
    handleKeyDownH,
    // Console position
    consolePosition,
    setConsolePosition,
    toggleConsolePosition,
    // Vertical console split (bottom)
    consoleHeight,
    setConsoleHeight,
    isConsoleCollapsed,
    setIsConsoleCollapsed,
    isVDragging,
    handleVPointerDown,
    resetConsoleHeight,
    // Horizontal console split (right)
    consoleWidthPct,
    setConsoleWidthPct,
    isSideDragging,
    handleSidePointerDown,
    resetConsoleWidth,
    // Shared console helpers
    toggleConsoleCollapse,
    handleKeyDownV,
  };
}
