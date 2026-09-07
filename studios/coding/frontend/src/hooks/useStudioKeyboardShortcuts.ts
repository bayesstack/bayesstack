import { useEffect, useCallback } from "react";

export interface StudioShortcutActions {
  onRun?: () => void;
  onSubmit?: () => void;
  onToggleConsole?: () => void;
  onToggleSidebar?: () => void;
  onToggleDock?: () => void;
  onToggleFullscreen?: () => void;
  onToggleZenMode?: () => void;
  onOpenPalette?: () => void;
  onCloseModals?: () => void;
  onSave?: () => void;
  onFocusEditor?: () => void;
  disabled?: boolean;
}

/**
 * Detects whether the client is running on Apple/macOS
 */
export function isMac(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return (
    /Mac|iPod|iPhone|iPad/.test(navigator.platform || "") ||
    /Macintosh/.test(navigator.userAgent || "")
  );
}

/**
 * Ambient global keyboard shortcut listener for competitive coding ergonomics.
 * Intercepts shortcuts regardless of active focus (including inside CodeMirror/editors)
 * and prevents browser defaults.
 */
export function useStudioKeyboardShortcuts({
  onRun,
  onSubmit,
  onToggleConsole,
  onToggleSidebar,
  onToggleDock,
  onToggleFullscreen,
  onToggleZenMode,
  onOpenPalette,
  onCloseModals,
  onSave,
  onFocusEditor,
  disabled = false,
}: StudioShortcutActions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      const isModifier = e.metaKey || e.ctrlKey;

      // 1. Escape: Close any open modal/palette or focus back to editor stage
      if (e.key === "Escape") {
        if (onCloseModals) {
          e.preventDefault();
          onCloseModals();
        }
        if (onFocusEditor) {
          onFocusEditor();
        }
        return;
      }

      // 2. Command Palette / Shortcuts Cheatsheet: Cmd/Ctrl + K
      if (isModifier && (e.key === "k" || e.key === "K")) {
        if (onOpenPalette) {
          e.preventDefault();
          e.stopPropagation();
          onOpenPalette();
          return;
        }
      }

      // 3. Format & Save Code: Cmd/Ctrl + S (prevents default browser save page)
      if (isModifier && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        e.stopPropagation();
        if (onSave) {
          onSave();
        }
        return;
      }

      // 3. Run Code vs Submit Solution
      // Submit: Cmd/Ctrl + Shift + Enter
      // Run: Cmd/Ctrl + Enter
      if (isModifier && e.key === "Enter") {
        if (e.shiftKey) {
          if (onSubmit) {
            e.preventDefault();
            e.stopPropagation();
            onSubmit();
            return;
          }
        } else {
          if (onRun) {
            e.preventDefault();
            e.stopPropagation();
            onRun();
            return;
          }
        }
      }

      // 4. Toggle Console Drawer: Cmd/Ctrl + ' or Cmd/Ctrl + `
      if (isModifier && (e.key === "'" || e.key === "`")) {
        if (onToggleConsole) {
          e.preventDefault();
          e.stopPropagation();
          onToggleConsole();
          return;
        }
      }

      // 5. Toggle Left Sidebar (Problem Description): Cmd/Ctrl + B
      if (isModifier && (e.key === "b" || e.key === "B")) {
        if (onToggleSidebar) {
          e.preventDefault();
          e.stopPropagation();
          onToggleSidebar();
          return;
        }
      }

      // 6. Toggle Console Dock (Bottom ⟷ Right): Cmd/Ctrl + Shift + L
      if (isModifier && e.shiftKey && (e.key === "l" || e.key === "L")) {
        if (onToggleDock) {
          e.preventDefault();
          e.stopPropagation();
          onToggleDock();
          return;
        }
      }

      // 7. Toggle Zen Focus Mode: Cmd/Ctrl + Shift + Z or Alt + Shift + Z
      if (
        (isModifier && e.shiftKey && (e.key === "z" || e.key === "Z")) ||
        (e.altKey && e.shiftKey && (e.key === "z" || e.key === "Z"))
      ) {
        if (onToggleZenMode) {
          e.preventDefault();
          e.stopPropagation();
          onToggleZenMode();
          return;
        }
      }

      // 8. Toggle Fullscreen: Alt + Z
      if (e.altKey && !e.shiftKey && (e.key === "z" || e.key === "Z")) {
        if (onToggleFullscreen) {
          e.preventDefault();
          e.stopPropagation();
          onToggleFullscreen();
          return;
        }
      }
    },
    [
      disabled,
      onRun,
      onSubmit,
      onToggleConsole,
      onToggleSidebar,
      onToggleDock,
      onToggleFullscreen,
      onToggleZenMode,
      onOpenPalette,
      onCloseModals,
      onSave,
      onFocusEditor,
    ]
  );

  useEffect(() => {
    // Use capture phase to ensure shortcuts like Cmd+Enter trigger reliably
    // even when rich editors trap bubbling keyboard events
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [handleKeyDown]);
}
