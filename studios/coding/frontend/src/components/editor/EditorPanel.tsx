import React, { useState, useEffect } from "react";
import { Button, Icon, CodeEditor } from "@bayesstack/ui";
import { LanguageSelect } from "./LanguageSelect";
import { LANGUAGE_OPTIONS } from "../../hooks/useCodingProblem";
import { ResetConfirmModal } from "../modals/ResetConfirmModal";

import type { DraftStatus } from "../../hooks/useCodingProblem";

export interface EditorPanelProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  availableLanguages?: string[];
  onResetCode: () => void;
  starterCode?: string;
  isDirty?: boolean;
  draftStatus?: DraftStatus;
  lastSavedAt?: Date | null;
  theme?: "dark" | "light";
  onThemeChange?: (theme: "dark" | "light") => void;
}

export interface EditorSettings {
  theme: "dark" | "light";
  fontSize: string;
  tabSize: number;
  keymap: "standard" | "vim" | "emacs";
}

const SETTINGS_KEY = "bs_cs_editor_settings";

function getInitialSettings(): EditorSettings {
  if (typeof window === "undefined") {
    return { theme: "light", fontSize: "14px", tabSize: 2, keymap: "standard" };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        theme: parsed.theme || "light",
        fontSize: parsed.fontSize || "14px",
        tabSize: parsed.tabSize || 2,
        keymap: parsed.keymap || "standard",
      };
    }
  } catch {
    // fallback
  }
  return { theme: "light", fontSize: "14px", tabSize: 2, keymap: "standard" };
}

/**
 * Universal multi-language source code formatter for competitive programming
 * Formats JSON, JS/TS, C++, Java, and Python.
 */
export function formatSourceCode(rawCode: string, lang: string, tabSize: number): string {
  const l = (lang || "").toLowerCase();
  const indentStr = " ".repeat(tabSize);

  // 1. JSON formatting
  if (l === "json") {
    try {
      return JSON.stringify(JSON.parse(rawCode), null, tabSize) + "\n";
    } catch {
      return rawCode;
    }
  }

  // 2. Common line cleanup: trim trailing whitespace
  const rawLines = rawCode.split("\n");
  const trimmedLines = rawLines.map((line) => line.trimEnd());

  // Collapse multiple consecutive empty lines to maximum 1 empty line
  const cleanedLines: string[] = [];
  let prevWasEmpty = false;
  for (const line of trimmedLines) {
    const isEmpty = line.trim().length === 0;
    if (isEmpty) {
      if (!prevWasEmpty) {
        cleanedLines.push("");
        prevWasEmpty = true;
      }
    } else {
      cleanedLines.push(line);
      prevWasEmpty = false;
    }
  }

  // 3. C++ / Java / JavaScript / TypeScript indentation normalization
  if (["javascript", "typescript", "js", "ts", "cpp", "c++", "c", "java"].includes(l)) {
    let indentLevel = 0;
    const formatted: string[] = [];

    for (let i = 0; i < cleanedLines.length; i++) {
      const line = cleanedLines[i].trim();
      if (!line) {
        formatted.push("");
        continue;
      }

      // If line starts with a closing delimiter, dedent before emitting line
      let leadingCloses = 0;
      for (const ch of line) {
        if (ch === "}" || ch === ")") leadingCloses++;
        else break;
      }
      const effectiveIndent = Math.max(0, indentLevel - leadingCloses);
      formatted.push(indentStr.repeat(effectiveIndent) + line);

      // Compute net indent delta for following lines
      let openCount = 0;
      let closeCount = 0;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === "{" || char === "(") openCount++;
        else if (char === "}" || char === ")") closeCount++;
      }
      indentLevel = Math.max(0, indentLevel + openCount - closeCount);
    }
    return formatted.join("\n").trim() + "\n";
  }

  // 4. Python & fallback: clean trailing whitespace and ensure newline at EOF
  return cleanedLines.join("\n").trim() + "\n";
}

export function EditorPanel({
  code,
  onChange,
  language,
  onLanguageChange,
  availableLanguages,
  onResetCode,
  starterCode,
  isDirty = false,
  draftStatus = "clean",
  lastSavedAt = null,
  theme: controlledTheme,
  onThemeChange,
}: EditorPanelProps) {
  const [settings, setSettings] = useState<EditorSettings>(getInitialSettings);
  const [resetFeedback, setResetFeedback] = useState<boolean>(false);
  const [formatFeedback, setFormatFeedback] = useState<boolean>(false);
  const [showResetDiffModal, setShowResetDiffModal] = useState<boolean>(false);

  const currentTheme = controlledTheme || settings.theme;

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, theme: currentTheme }));
    } catch {
      // ignore
    }
  }, [settings, currentTheme]);

  const filteredOptions = LANGUAGE_OPTIONS.filter((opt) =>
    availableLanguages ? availableLanguages.includes(opt.value) : true
  );

  const handleReset = () => {
    onResetCode();
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 1500);
  };

  const handleResetClick = () => {
    // If user has modified the code away from starter template, show diff confirm modal first
    if (isDirty && starterCode) {
      setShowResetDiffModal(true);
    } else {
      handleReset();
    }
  };

  const toggleTheme = () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setSettings((prev) => ({
      ...prev,
      theme: nextTheme,
    }));
    onThemeChange?.(nextTheme);
  };

  const handleFormatCode = () => {
    try {
      const formatted = formatSourceCode(code, language, settings.tabSize);
      onChange(formatted);
      setFormatFeedback(true);
      setTimeout(() => setFormatFeedback(false), 1500);
    } catch {
      // Keep code intact if error
    }
  };

  return (
    <div
      className="bs-cs-editor-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* Editor Controls Bar with Language, Draft Status, Formatting, Font Size, Keybindings, Reset, and Theme */}
      <div
        className="bs-cs-editor-toolbar"
        style={{
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 0.85rem",
          background: currentTheme === "dark" ? "#1e293b" : "#ffffff",
          borderBottom: currentTheme === "dark" ? "1px solid #334155" : "1px solid var(--bs-ui-line, #d7e8e4)",
          flexShrink: 0,
          transition: "background 150ms ease, border-color 150ms ease",
          gap: "8px",
          overflowX: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <LanguageSelect
            value={language}
            onChange={onLanguageChange}
            options={filteredOptions.length > 0 ? filteredOptions : LANGUAGE_OPTIONS}
          />

          {/* Draft Persistence & Unsaved Changes Indicator Pill */}
          {draftStatus === "saving" ? (
            <div
              className="bs-cs-draft-badge bs-cs-draft-badge--saving"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "rgba(245, 158, 11, 0.12)",
                color: "#f59e0b",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid rgba(245, 158, 11, 0.3)",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
              title="Auto-saving changes to persistent draft (300ms debounce)..."
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#f59e0b",
                  display: "inline-block",
                }}
              />
              <span>● Unsaved changes</span>
            </div>
          ) : isDirty && draftStatus === "saved" ? (
            <div
              className="bs-cs-draft-badge bs-cs-draft-badge--saved"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "rgba(16, 185, 129, 0.12)",
                color: "#10b981",
                fontSize: "11px",
                fontWeight: 500,
                border: "1px solid rgba(16, 185, 129, 0.25)",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
              title={lastSavedAt ? `Auto-saved to draft at ${lastSavedAt.toLocaleTimeString()}` : "Auto-saved to draft"}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  display: "inline-block",
                }}
              />
              <span>● Saved</span>
            </div>
          ) : (
            <div
              className="bs-cs-draft-badge bs-cs-draft-badge--clean"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: settings.theme === "dark" ? "rgba(148, 163, 184, 0.08)" : "rgba(100, 116, 139, 0.08)",
                color: settings.theme === "dark" ? "#64748b" : "#94a3b8",
                fontSize: "11px",
                fontWeight: 500,
                border: settings.theme === "dark" ? "1px solid rgba(148, 163, 184, 0.12)" : "1px solid rgba(100, 116, 139, 0.12)",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
              title="Currently on default starter code template"
            >
              <span>Starter template</span>
            </div>
          )}

          {/* Format Code Button */}
          <Button
            variant="outline"
            size="xs"
            leftIcon={<Icon name={formatFeedback ? "Check" : "Sparkles"} size={13} />}
            onClick={handleFormatCode}
            title="Format Code (Python / JS / C++ / Java / JSON)"
            style={{
              color: settings.theme === "dark" ? "#94a3b8" : undefined,
              borderColor: settings.theme === "dark" ? "#334155" : undefined,
            }}
          >
            {formatFeedback ? "Formatted!" : "Format"}
          </Button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {/* Keybinding Mode Switcher (Standard VS Code / Vim / Emacs) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 6px",
              borderRadius: "6px",
              background: settings.theme === "dark" ? "#0f172a" : "#f1f5f9",
              border: settings.theme === "dark" ? "1px solid #334155" : "1px solid #cbd5e1",
            }}
            title="Keybinding mode: Standard VS Code / Vim / Emacs"
          >
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                color: settings.theme === "dark" ? "#64748b" : "#64748b",
                userSelect: "none",
              }}
            >
              Keymap:
            </span>
            <select
              value={settings.keymap}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  keymap: e.target.value as "standard" | "vim" | "emacs",
                }))
              }
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "11px",
                fontWeight: 600,
                color: settings.theme === "dark" ? "#e2e8f0" : "#1e293b",
                cursor: "pointer",
                padding: "0 2px",
              }}
              aria-label="Editor Keybinding Mode"
            >
              <option value="standard">VS Code</option>
              <option value="vim">Vim</option>
              <option value="emacs">Emacs</option>
            </select>
          </div>

          {/* Font Size Toggle (Small / Medium / Large) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 6px",
              borderRadius: "6px",
              background: settings.theme === "dark" ? "#0f172a" : "#f1f5f9",
              border: settings.theme === "dark" ? "1px solid #334155" : "1px solid #cbd5e1",
            }}
            title="Editor Font Size (Small / Medium / Large)"
          >
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                color: settings.theme === "dark" ? "#64748b" : "#64748b",
                userSelect: "none",
              }}
            >
              Size:
            </span>
            <select
              value={settings.fontSize}
              onChange={(e) => setSettings((s) => ({ ...s, fontSize: e.target.value }))}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "11px",
                fontWeight: 600,
                color: settings.theme === "dark" ? "#e2e8f0" : "#1e293b",
                cursor: "pointer",
                padding: "0 2px",
              }}
              aria-label="Editor Font Size"
            >
              <option value="12px">Small (12px)</option>
              <option value="14px">Medium (14px)</option>
              <option value="16px">Large (16px)</option>
            </select>
          </div>

          {/* Quick Tab Size Selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              padding: "2px 6px",
              borderRadius: "6px",
              background: settings.theme === "dark" ? "#0f172a" : "#f1f5f9",
              border: settings.theme === "dark" ? "1px solid #334155" : "1px solid #cbd5e1",
            }}
            title="Indentation Width (Spaces)"
          >
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                color: settings.theme === "dark" ? "#64748b" : "#64748b",
                userSelect: "none",
              }}
            >
              Tab:
            </span>
            <select
              value={settings.tabSize}
              onChange={(e) => setSettings((s) => ({ ...s, tabSize: Number(e.target.value) }))}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "11px",
                fontWeight: 600,
                color: settings.theme === "dark" ? "#e2e8f0" : "#1e293b",
                cursor: "pointer",
                padding: "0 2px",
              }}
              aria-label="Indentation Tab Size"
            >
              <option value={2}>2 sp</option>
              <option value={4}>4 sp</option>
            </select>
          </div>

          {/* Reset Starter with Diff Safety Confirmation */}
          <Button
            variant="outline"
            size="xs"
            leftIcon={<Icon name={resetFeedback ? "Check" : "Refresh"} size={13} />}
            onClick={handleResetClick}
            title={isDirty ? "Reset code to starter template (diff confirmation)" : "Code is currently matching starter template"}
            style={{
              borderColor: settings.theme === "dark" ? "#334155" : undefined,
              color: settings.theme === "dark" ? "#e2e8f0" : undefined,
            }}
          >
            {resetFeedback ? "Reset Done" : "Reset Starter"}
          </Button>

          {/* Theme Toggle (Dark / Light) */}
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<Icon name={currentTheme === "dark" ? "Sun" : "Moon"} size={13} />}
            onClick={toggleTheme}
            title={`Switch to ${currentTheme === "dark" ? "Light" : "Dark"} editor theme`}
          >
            {currentTheme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>
      </div>

      {/* Embedded @bayesstack/ui CodeEditor (CodeMirror 6 Engine with Keybinding Mode) */}
      <div
        className="bs-cs-editor-stage"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
          height: "calc(100% - 44px)",
        }}
      >
        <CodeEditor
          value={code}
          onChange={onChange}
          language={language}
          variant={currentTheme}
          fontSize={settings.fontSize}
          tabSize={settings.tabSize}
          keymap={settings.keymap}
          showLineNumbers={true}
          showLanguageSelect={false}
          showCopy={true}
          showStatusFooter={true}
          footerStatus={
            draftStatus === "saving" ? (
              <span
                style={{
                  color: "#f59e0b",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#f59e0b",
                    display: "inline-block",
                  }}
                />
                <span>Saving...</span>
              </span>
            ) : isDirty && draftStatus === "saved" ? (
              <span
                style={{
                  color: "#10b981",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    display: "inline-block",
                  }}
                />
                <span>Saved to draft</span>
              </span>
            ) : (
              <span
                style={{
                  color: currentTheme === "dark" ? "#64748b" : "#94a3b8",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: currentTheme === "dark" ? "#64748b" : "#94a3b8",
                    display: "inline-block",
                  }}
                />
                <span>Saved to draft</span>
              </span>
            )
          }
          style={{ height: "100%", width: "100%", border: "none" }}
        />
      </div>

      {/* Reset with Diff Safety Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetDiffModal}
        onClose={() => setShowResetDiffModal(false)}
        onConfirm={handleReset}
        currentCode={code}
        starterCode={starterCode || ""}
        language={filteredOptions.find((o) => o.value === language)?.label || language}
      />
    </div>
  );
}
