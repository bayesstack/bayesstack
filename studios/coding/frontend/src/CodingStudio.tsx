import React, { useState, useRef, useEffect } from "react";
import type { CodingStudioProps } from "./types";
import { useCodingProblem } from "./hooks/useCodingProblem";
import { useCodeExecution } from "./hooks/useCodeExecution";
import { useSubmissions } from "./hooks/useSubmissions";
import { useStudioKeyboardShortcuts } from "./hooks/useStudioKeyboardShortcuts";
import { useAudioEffects } from "./hooks/useAudioEffects";
import { CodingStudioLayout, type CodingStudioLayoutActions } from "./components/layout/CodingStudioLayout";
import { CodingStudioHeader } from "./components/layout/CodingStudioHeader";
import { LeftPane } from "./components/leftPane/LeftPane";
import { EditorPanel, getInitialEditorSettings, type EditorSettings } from "./components/editor/EditorPanel";
import { ConsolePanel } from "./components/console/ConsolePanel";
import { ShortcutsModal } from "./components/modals/ShortcutsModal";
import { StudioSettingsDrawer } from "./components/modals/StudioSettingsDrawer";
import "./styles/codingStudio.css";

const STREAK_KEY = "bs_cs_user_streak";

export function CodingStudio({
  activity,
  apiBaseUrl = "http://localhost:8000",
  onComplete,
  onEvent,
  className = "",
  style = {},
}: CodingStudioProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const layoutActionsRef = useRef<CodingStudioLayoutActions | null>(null);

  // One persisted preference model keeps the shell and editor in the same theme.
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => {
    const settings = getInitialEditorSettings();
    if (typeof window === "undefined") return settings;
    try {
      const legacyTheme = localStorage.getItem("bs_cs_theme_user_choice");
      return legacyTheme === "light" || legacyTheme === "dark" ? { ...settings, theme: legacyTheme } : settings;
    } catch {
      return settings;
    }
  });
  const studioTheme = editorSettings.theme;

  useEffect(() => {
    try {
      localStorage.setItem("bs_cs_editor_settings", JSON.stringify(editorSettings));
      localStorage.setItem("bs_cs_theme_user_choice", editorSettings.theme);
    } catch {
      // Browser storage may be unavailable in an embedded runtime.
    }
  }, [editorSettings]);

  // Coding Studio is a full-screen workspace. Keep its host chrome, menus, and
  // portalled overlays in the same color system instead of only darkening the
  // editor card.
  useEffect(() => {
    const className = "bs-cs-dark-mode";
    const root = document.documentElement;
    const body = document.body;

    if (studioTheme === "dark") {
      root.classList.add(className);
      body.classList.add(className);
    } else {
      root.classList.remove(className);
      body.classList.remove(className);
    }

    return () => {
      root.classList.remove(className);
      body.classList.remove(className);
    };
  }, [studioTheme]);

  // Daily Streak retention tracker
  const [streakCount, setStreakCount] = useState<number>(() => {
    if (typeof window === "undefined") return 3;
    try {
      const stored = localStorage.getItem(STREAK_KEY);
      return stored ? parseInt(stored, 10) || 3 : 3;
    } catch {
      return 3;
    }
  });

  // Zero-dependency Web Audio API synthesized cues
  const { isAudioEnabled, toggleAudio, playClick, playChime, playFailure } = useAudioEffects();

  const handleToggleZenMode = () => {
    setIsZenMode((prev) => {
      const next = !prev;
      // When entering Zen mode, collapse left sidebar so editor & console get 100% focus
      if (next) {
        layoutActionsRef.current?.toggleLeftCollapse();
      }
      return next;
    });
  };

  // 1. Problem metadata and starter codes hook
  const {
    problemId,
    config,
    starterCode,
    selectedLanguage,
    setSelectedLanguage,
    code,
    setCode,
    isDirty,
    draftStatus,
    lastSavedAt,
    testCases,
    availableLanguages,
    handleResetCode,
    handleSaveDraft,
  } = useCodingProblem(activity, apiBaseUrl);

  // 2. Submission history hook
  const {
    submissions,
    loading: submissionsLoading,
    fetchSubmissions,
    addSubmission,
  } = useSubmissions(problemId, apiBaseUrl);

  // 3. Code runner & judge evaluation hook
  const {
    isRunning,
    isSubmitting,
    isCustomRunning,
    customInput,
    setCustomInput,
    customOutput,
    activeConsoleTab,
    setActiveConsoleTab,
    runResult,
    runTests,
    submitSolution,
    runCustomInput,
  } = useCodeExecution({
    problemId,
    activityId: activity.id,
    apiBaseUrl,
    code,
    selectedLanguage,
    testCases,
    onComplete: () => {
      playChime();
      setStreakCount((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem(STREAK_KEY, String(next));
        } catch {
          // ignore
        }
        return next;
      });
      onComplete?.();
    },
    onEvent,
    onNewSubmission: addSubmission,
  });

  const handleRun = () => {
    playClick();
    if (!isRunning && !isSubmitting) runTests();
  };

  const handleSubmit = () => {
    playClick();
    if (!isRunning && !isSubmitting) submitSolution();
  };

  // Sensory audio feedback when judge completes evaluation
  const prevRunStatusRef = useRef(runResult.status);
  useEffect(() => {
    if (runResult.status !== prevRunStatusRef.current) {
      if (runResult.status === "passed") {
        playChime();
      } else if (runResult.status === "failed" || runResult.status === "error") {
        playFailure();
      }
      prevRunStatusRef.current = runResult.status;
    }
  }, [runResult.status, playChime, playFailure]);

  // 4. Ambient Global Keyboard Shortcuts
  useStudioKeyboardShortcuts({
    onRun: handleRun,
    onSubmit: handleSubmit,
    onToggleConsole: () => {
      layoutActionsRef.current?.toggleConsoleCollapse();
    },
    onToggleSidebar: () => {
      layoutActionsRef.current?.toggleLeftCollapse();
    },
    onToggleDock: () => {
      layoutActionsRef.current?.toggleConsolePosition();
    },
    onToggleFullscreen: () => {
      setIsFullscreen((prev) => !prev);
    },
    onToggleZenMode: handleToggleZenMode,
    onOpenPalette: () => {
      setIsShortcutsOpen((prev) => !prev);
    },
    onSave: handleSaveDraft,
    onFocusEditor: () => {
      const editorElement = document.querySelector<HTMLElement>(
        ".cm-content, .monaco-editor textarea, .bs-cs-editor textarea, [contenteditable='true']"
      );
      editorElement?.focus();
    },
    onCloseModals: () => {
      if (isShortcutsOpen) {
        setIsShortcutsOpen(false);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
      } else if (isZenMode) {
        setIsZenMode(false);
      }
    },
  });

  const problemTitle = String(
    config.problem_title || activity.title || "0/1 Knapsack Problem"
  );
  const difficulty = String(config.difficulty || "Medium");

  return (
    <>
      <CodingStudioLayout
        isFullscreen={isFullscreen}
        isZenMode={isZenMode}
        theme={studioTheme}
        className={className}
        style={style}
        onLayoutReady={(actions) => {
          layoutActionsRef.current = actions;
        }}
        header={
          <CodingStudioHeader
            title={problemTitle}
            difficulty={difficulty}
            timeLimitMs={config.time_limit_ms}
            memoryLimitMb={config.memory_limit_mb}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isZenMode={isZenMode}
            onToggleZenMode={handleToggleZenMode}
            onOpenSettings={() => setIsSettingsOpen(true)}
            streakCount={streakCount}
          />
        }
        leftPane={
          <LeftPane
            title={problemTitle}
            config={config}
            testCases={testCases}
            submissions={submissions}
            submissionsLoading={submissionsLoading}
            onRefreshSubmissions={fetchSubmissions}
          />
        }
        editorPanel={
          <EditorPanel
            code={code}
            onChange={setCode}
            language={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            availableLanguages={availableLanguages}
            onResetCode={handleResetCode}
            starterCode={starterCode}
            isDirty={isDirty}
            draftStatus={draftStatus}
            lastSavedAt={lastSavedAt}
            settings={editorSettings}
          />
        }
        consolePanel={
          <ConsolePanel
            testCases={testCases}
            customInput={customInput}
            onCustomInputChange={setCustomInput}
            onRunCustomInput={runCustomInput}
            isCustomRunning={isCustomRunning}
            customOutput={customOutput}
            runResult={runResult}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            activeTab={activeConsoleTab}
            onTabChange={setActiveConsoleTab}
            onNextProblem={() => onComplete?.()}
          />
        }
      />

      {/* Global Command Palette & Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onRun={handleRun}
        onSubmit={handleSubmit}
        onToggleConsole={() => layoutActionsRef.current?.toggleConsoleCollapse()}
        onToggleSidebar={() => layoutActionsRef.current?.toggleLeftCollapse()}
        onToggleDock={() => layoutActionsRef.current?.toggleConsolePosition()}
        onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
        onToggleZenMode={handleToggleZenMode}
        onResetCode={handleResetCode}
        onSave={handleSaveDraft}
      />

      <StudioSettingsDrawer
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={studioTheme}
        onThemeChange={(theme) => setEditorSettings((current) => ({ ...current, theme }))}
        editorSettings={editorSettings}
        onEditorSettingsChange={setEditorSettings}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={toggleAudio}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
        onToggleProblemPane={() => layoutActionsRef.current?.toggleLeftCollapse()}
        onToggleConsole={() => layoutActionsRef.current?.toggleConsoleCollapse()}
        onToggleConsoleDock={() => layoutActionsRef.current?.toggleConsolePosition()}
        onOpenShortcuts={() => {
          setIsSettingsOpen(false);
          setIsShortcutsOpen(true);
        }}
      />
    </>
  );
}

export * from "./types";
export { useCodingProblem } from "./hooks/useCodingProblem";
export { useCodeExecution } from "./hooks/useCodeExecution";
export { useSubmissions } from "./hooks/useSubmissions";
export { useSplitResize } from "./hooks/useSplitResize";
export { useStudioKeyboardShortcuts, isMac } from "./hooks/useStudioKeyboardShortcuts";
export { CodingStudioLayout } from "./components/layout/CodingStudioLayout";
export { CodingStudioHeader } from "./components/layout/CodingStudioHeader";
export { SplitDivider } from "./components/layout/SplitDivider";
export { LeftPane } from "./components/leftPane/LeftPane";
export { EditorPanel } from "./components/editor/EditorPanel";
export { ConsolePanel } from "./components/console/ConsolePanel";
export { ShortcutsModal } from "./components/modals/ShortcutsModal";
export { StudioSettingsDrawer } from "./components/modals/StudioSettingsDrawer";
export { MathText, enrichMathFormulas } from "./components/common/MathText";
export { useAudioEffects } from "./hooks/useAudioEffects";
export { ConfettiCelebration } from "./components/common/ConfettiCelebration";
