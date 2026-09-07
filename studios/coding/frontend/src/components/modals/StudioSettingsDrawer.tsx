import React from "react";
import { Button, Drawer, Icon } from "@bayesstack/ui";
import type { EditorSettings } from "../editor/EditorPanel";

interface StudioSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
  editorSettings: EditorSettings;
  onEditorSettingsChange: (settings: EditorSettings) => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenShortcuts: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleProblemPane: () => void;
  onToggleConsole: () => void;
  onToggleConsoleDock: () => void;
}

export function StudioSettingsDrawer({
  open,
  onClose,
  theme,
  onThemeChange,
  editorSettings,
  onEditorSettingsChange,
  isAudioEnabled,
  onToggleAudio,
  onOpenShortcuts,
  isFullscreen,
  onToggleFullscreen,
  onToggleProblemPane,
  onToggleConsole,
  onToggleConsoleDock,
}: StudioSettingsDrawerProps) {
  const updateEditorSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    onEditorSettingsChange({ ...editorSettings, [key]: value });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Studio settings"
      subtitle="Personalize your workspace without crowding your code."
      size="sm"
      zIndex={10001}
      className={theme === "dark" ? "bs-cs-settings-drawer bs-cs-settings-drawer--dark" : "bs-cs-settings-drawer"}
    >
      <section className="bs-cs-settings-section" aria-labelledby="bs-cs-settings-appearance">
        <div>
          <h4 id="bs-cs-settings-appearance">Appearance</h4>
          <p>Choose one theme for the entire studio.</p>
        </div>
        <div className="bs-cs-settings-choice-group" role="group" aria-label="Studio theme">
          <Button
            variant={theme === "light" ? "primary" : "secondary"}
            size="sm"
            leftIcon={<Icon name="Sun" size={14} />}
            onClick={() => onThemeChange("light")}
            aria-pressed={theme === "light"}
          >
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "primary" : "secondary"}
            size="sm"
            leftIcon={<Icon name="Moon" size={14} />}
            onClick={() => onThemeChange("dark")}
            aria-pressed={theme === "dark"}
          >
            Dark
          </Button>
        </div>
      </section>

      <section className="bs-cs-settings-section" aria-labelledby="bs-cs-settings-editor">
        <div>
          <h4 id="bs-cs-settings-editor">Editor</h4>
          <p>These preferences are saved to this browser.</p>
        </div>
        <label className="bs-cs-settings-field">
          <span>Keybindings</span>
          <select
            value={editorSettings.keymap}
            onChange={(event) => updateEditorSetting("keymap", event.target.value as EditorSettings["keymap"])}
            aria-label="Editor Keybinding Mode"
          >
            <option value="standard">VS Code</option>
            <option value="vim">Vim</option>
            <option value="emacs">Emacs</option>
          </select>
        </label>
        <label className="bs-cs-settings-field">
          <span>Font size</span>
          <select
            value={editorSettings.fontSize}
            onChange={(event) => updateEditorSetting("fontSize", event.target.value)}
            aria-label="Editor Font Size"
          >
            <option value="12px">Small · 12px</option>
            <option value="14px">Medium · 14px</option>
            <option value="16px">Large · 16px</option>
          </select>
        </label>
        <label className="bs-cs-settings-field">
          <span>Indentation</span>
          <select
            value={editorSettings.tabSize}
            onChange={(event) => updateEditorSetting("tabSize", Number(event.target.value))}
            aria-label="Indentation Tab Size"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>
      </section>

      <section className="bs-cs-settings-section" aria-labelledby="bs-cs-settings-assistance">
        <div>
          <h4 id="bs-cs-settings-assistance">Assistance</h4>
          <p>Keep optional help and feedback available, but out of the way.</p>
        </div>
        <div className="bs-cs-settings-inline-action">
          <div>
            <strong>Audio cues</strong>
            <span>{isAudioEnabled ? "Feedback sounds are on" : "Feedback sounds are muted"}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name={isAudioEnabled ? "VolumeHigh" : "VolumeMute"} size={14} />}
            onClick={onToggleAudio}
          >
            {isAudioEnabled ? "On" : "Off"}
          </Button>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Icon name="Key" size={14} />} onClick={onOpenShortcuts}>
          View keyboard shortcuts
        </Button>
      </section>

      <section className="bs-cs-settings-section" aria-labelledby="bs-cs-settings-workspace">
        <div>
          <h4 id="bs-cs-settings-workspace">Workspace</h4>
          <p>Keep layout controls available without adding permanent chrome.</p>
        </div>
        <div className="bs-cs-settings-workspace-actions">
          <Button variant="secondary" size="sm" leftIcon={<Icon name="PanelLeft" size={14} />} onClick={onToggleProblemPane}>
            Toggle problem panel
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Icon name="ArrowDown" size={14} />} onClick={onToggleConsole}>
            Toggle test panel
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Icon name="SidebarRight" size={14} />} onClick={onToggleConsoleDock}>
            Change console position
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name={isFullscreen ? "Minimize" : "Maximize"} size={14} />}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </Button>
        </div>
      </section>
    </Drawer>
  );
}
