import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button, Icon } from "@bayesstack/ui";
import { isMac } from "../../hooks/useStudioKeyboardShortcuts";

export interface ShortcutItem {
  id: string;
  title: string;
  description: string;
  category: "Execution" | "Workspace" | "Editor" | "Navigation";
  macKeys: string[];
  winKeys: string[];
  action?: () => void;
  icon?: string;
}

export interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRun?: () => void;
  onSubmit?: () => void;
  onToggleConsole?: () => void;
  onToggleSidebar?: () => void;
  onToggleDock?: () => void;
  onToggleFullscreen?: () => void;
  onToggleZenMode?: () => void;
  onResetCode?: () => void;
  onSave?: () => void;
}

export function ShortcutsModal({
  isOpen,
  onClose,
  onRun,
  onSubmit,
  onToggleConsole,
  onToggleSidebar,
  onToggleDock,
  onToggleFullscreen,
  onToggleZenMode,
  onResetCode,
  onSave,
}: ShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const inputRef = useRef<HTMLInputElement>(null);
  const isApple = useMemo(() => isMac(), []);

  const commands: ShortcutItem[] = useMemo(
    () => [
      {
        id: "run-code",
        title: "Run Test Cases",
        description: "Execute active starter code against visible sample test cases",
        category: "Execution",
        macKeys: ["⌘", "↵"],
        winKeys: ["Ctrl", "Enter"],
        action: onRun,
      },
      {
        id: "submit-code",
        title: "Submit Solution",
        description: "Submit solution to the remote grading engine across all test suites",
        category: "Execution",
        macKeys: ["⇧", "⌘", "↵"],
        winKeys: ["Ctrl", "Shift", "Enter"],
        action: onSubmit,
      },
      {
        id: "toggle-console",
        title: "Toggle Console Drawer",
        description: "Expand or collapse the test case results and evaluation console",
        category: "Workspace",
        macKeys: ["⌘", "'"],
        winKeys: ["Ctrl", "'"],
        action: onToggleConsole,
      },
      {
        id: "toggle-sidebar",
        title: "Toggle Problem Sidebar",
        description: "Collapse the problem description to give 100% width to the code editor",
        category: "Workspace",
        macKeys: ["⌘", "B"],
        winKeys: ["Ctrl", "B"],
        action: onToggleSidebar,
      },
      {
        id: "toggle-dock",
        title: "Switch Console Dock",
        description: "Toggle console between Bottom Dock and Right Side-by-Side Split",
        category: "Workspace",
        macKeys: ["⇧", "⌘", "L"],
        winKeys: ["Ctrl", "Shift", "L"],
        action: onToggleDock,
      },
      {
        id: "toggle-zen",
        title: "Toggle Zen Focus Mode",
        description: "Distraction-free ambient dark mode focusing on the code editor and console",
        category: "Workspace",
        macKeys: ["⇧", "⌥", "Z"],
        winKeys: ["Ctrl", "Shift", "Z"],
        action: onToggleZenMode,
      },
      {
        id: "toggle-fullscreen",
        title: "Toggle Fullscreen Studio",
        description: "Expand coding studio to full window viewport distraction-free mode",
        category: "Workspace",
        macKeys: ["⌥", "Z"],
        winKeys: ["Alt", "Z"],
        action: onToggleFullscreen,
      },
      {
        id: "format-save-code",
        title: "Format & Save Code",
        description: "Beautify code and persist draft changes to local storage",
        category: "Editor",
        macKeys: ["⌘", "S"],
        winKeys: ["Ctrl", "S"],
        action: onSave,
      },
      {
        id: "reset-code",
        title: "Reset to Starter Code",
        description: "Restore initial problem boilerplate (warning: discards unsaved draft)",
        category: "Editor",
        macKeys: ["⌥", "⌘", "R"],
        winKeys: ["Ctrl", "Alt", "R"],
        action: onResetCode,
      },
      {
        id: "open-palette",
        title: "Open Command Palette / Shortcuts",
        description: "Quickly search actions and reference all keyboard shortcuts",
        category: "Navigation",
        macKeys: ["⌘", "K"],
        winKeys: ["Ctrl", "K"],
        action: () => {},
      },
      {
        id: "close-dialog",
        title: "Close Modal / Cancel",
        description: "Dismiss active dialog or return focus to code editor",
        category: "Navigation",
        macKeys: ["Esc"],
        winKeys: ["Esc"],
        action: onClose,
      },
    ],
    [
      onRun,
      onSubmit,
      onToggleConsole,
      onToggleSidebar,
      onToggleDock,
      onToggleFullscreen,
      onResetCode,
      onSave,
      onClose,
    ]
  );

  const filteredCommands = useMemo(() => {
    return commands.filter((cmd) => {
      const matchesCategory =
        activeCategory === "All" || cmd.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      const matchesQuery =
        cmd.title.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [commands, activeCategory, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelectCommand = (cmd: ShortcutItem) => {
    onClose();
    if (cmd.action) {
      cmd.action();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev + 1 < filteredCommands.length ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 >= 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelectCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  const categories = ["All", "Execution", "Workspace", "Editor", "Navigation"];

  return (
    <div
      className="bs-cs-modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(10, 24, 23, 0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "10vh",
        paddingLeft: "1rem",
        paddingRight: "1rem",
      }}
    >
      <div
        className="bs-cs-command-palette"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--bs-ui-line, #d7e8e4)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "75vh",
          animation: "bsModalSlideIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Search Header */}
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
            background: "#ffffff",
          }}
        >
          <span style={{ color: "var(--bs-ui-brand, #0b6763)", display: "flex" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search shortcuts (e.g. Run, Submit, Console)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              color: "var(--bs-ui-ink, #123333)",
              background: "transparent",
            }}
          />
          <kbd
            className="bs-cs-kbd"
            style={{
              fontSize: "0.72rem",
              padding: "2px 6px",
              borderRadius: "4px",
              background: "var(--bs-ui-canvas, #f1f8f6)",
              border: "1px solid var(--bs-ui-line, #d7e8e4)",
              color: "var(--bs-ui-muted, #4a6360)",
            }}
          >
            ESC to close
          </kbd>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            padding: "8px 16px",
            background: "var(--bs-ui-canvas, #f1f8f6)",
            borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
            overflowX: "auto",
          }}
        >
          {categories.map((cat) => {
            const isCurrent = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedIndex(0);
                }}
                style={{
                  border: "none",
                  background: isCurrent ? "var(--bs-ui-brand, #0b6763)" : "transparent",
                  color: isCurrent ? "#ffffff" : "var(--bs-ui-muted, #4a6360)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Command / Shortcut Results List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 0",
          }}
        >
          {filteredCommands.length === 0 ? (
            <div
              style={{
                padding: "2.5rem 1rem",
                textAlign: "center",
                color: "var(--bs-ui-muted, #4a6360)",
                fontSize: "0.85rem",
              }}
            >
              No commands found matching "{searchQuery}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const keys = isApple ? cmd.macKeys : cmd.winKeys;

              return (
                <div
                  key={cmd.id}
                  onClick={() => handleSelectCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    cursor: "pointer",
                    background: isSelected ? "rgba(11, 103, 99, 0.08)" : "transparent",
                    borderLeft: `3px solid ${isSelected ? "var(--bs-ui-brand, #0b6763)" : "transparent"}`,
                    transition: "background 0.1s ease",
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: "12px" }}>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--bs-ui-ink, #123333)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>{cmd.title}</span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          background: "var(--bs-ui-canvas, #f1f8f6)",
                          color: "var(--bs-ui-brand, #0b6763)",
                          fontWeight: 600,
                          border: "1px solid var(--bs-ui-line, #d7e8e4)",
                        }}
                      >
                        {cmd.category}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        color: "var(--bs-ui-muted, #4a6360)",
                        marginTop: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {cmd.description}
                    </div>
                  </div>

                  {/* Shortcut Key Badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                    {keys.map((k, ki) => (
                      <kbd
                        key={ki}
                        className="bs-cs-kbd"
                        style={{
                          padding: "3px 7px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          fontFamily: "var(--bs-ui-font-mono, monospace)",
                          background: "#ffffff",
                          border: "1px solid var(--bs-ui-line, #d7e8e4)",
                          borderRadius: "5px",
                          color: "var(--bs-ui-ink, #123333)",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: "8px 16px",
            background: "var(--bs-ui-canvas, #f1f8f6)",
            borderTop: "1px solid var(--bs-ui-line, #d7e8e4)",
            fontSize: "0.72rem",
            color: "var(--bs-ui-muted, #4a6360)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            Navigate with <strong>↑</strong> <strong>↓</strong>, execute with <strong>↵ Enter</strong>
          </span>
          <span>{isApple ? "macOS Layout" : "Windows/Linux Layout"}</span>
        </div>
      </div>
    </div>
  );
}
