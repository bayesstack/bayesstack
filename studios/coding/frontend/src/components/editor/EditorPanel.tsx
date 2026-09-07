import React, { useState, useEffect } from "react";
import { Button, CodeEditor, Dropdown, Icon } from "@bayesstack/ui";
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
  settings?: EditorSettings;
}

export interface EditorSettings {
  theme: "dark" | "light";
  fontSize: string;
  tabSize: number;
  keymap: "standard" | "vim" | "emacs";
}

const SETTINGS_KEY = "bs_cs_editor_settings";

export function getInitialEditorSettings(): EditorSettings {
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
  settings: controlledSettings,
}: EditorPanelProps) {
  const [internalSettings] = useState<EditorSettings>(getInitialEditorSettings);
  const [resetFeedback, setResetFeedback] = useState<boolean>(false);
  const [formatFeedback, setFormatFeedback] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [showResetDiffModal, setShowResetDiffModal] = useState<boolean>(false);

  const settings = controlledSettings || internalSettings;
  const currentTheme = settings.theme;

  useEffect(() => {
    if (controlledSettings) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [controlledSettings, settings]);

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

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      // Clipboard access is best-effort in embedded browser contexts.
    }
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 1500);
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
      {/* Deliberately small editor strip: language and source actions only. */}
      <div
        className="bs-cs-editor-toolbar"
        style={{
          background: currentTheme === "dark" ? "#1e293b" : "#ffffff",
          borderBottom: currentTheme === "dark" ? "1px solid #334155" : "1px solid var(--bs-ui-line, #d7e8e4)",
          flexShrink: 0,
          transition: "background 150ms ease, border-color 150ms ease",
        }}
      >
        <div className="bs-cs-editor-toolbar-primary">
          <LanguageSelect
            value={language}
            onChange={onLanguageChange}
            options={filteredOptions.length > 0 ? filteredOptions : LANGUAGE_OPTIONS}
          />

        </div>

        <div className="bs-cs-editor-actions" aria-label="Code actions">
          <Button
            variant="outline"
            size="xs"
            leftIcon={<Icon name={formatFeedback ? "Check" : "Sparkles"} size={13} />}
            onClick={handleFormatCode}
            title="Format Code (Python / JS / C++ / Java / JSON)"
          >
            {formatFeedback ? "Formatted" : "Format"}
          </Button>
          <Dropdown
            placement="bottomRight"
            items={[
              {
                key: "copy-code",
                label: copyFeedback ? "Code copied" : "Copy code",
                icon: copyFeedback ? "Check" : "Copy",
                onClick: handleCopyCode,
              },
              {
                key: "reset-starter",
                label: resetFeedback ? "Starter restored" : "Reset to starter",
                icon: resetFeedback ? "Check" : "Refresh",
                divider: true,
                danger: isDirty,
                onClick: handleResetClick,
              },
            ]}
          >
            <Button
              variant="outline"
              size="xs"
              rightIcon={<Icon name="ChevronDown" size={12} />}
              title="More code actions"
              aria-label="More code actions"
            >
              More
            </Button>
          </Dropdown>
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
          showCopy={false}
          showStatusFooter={true}
          showStatusDetails={false}
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
