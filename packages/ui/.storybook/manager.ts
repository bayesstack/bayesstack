import React, { type CSSProperties } from "react";
import { addons, types, useStorybookApi, useStorybookState } from "storybook/manager-api";
import { create } from "storybook/theming";

const tabStyle = (active: boolean): CSSProperties => ({
  appearance: "none",
  border: 0,
  borderBottom: `2px solid ${active ? "#0B6763" : "transparent"}`,
  background: "transparent",
  color: active ? "#0B6763" : "#59716E",
  cursor: "pointer",
  fontFamily: '"Outfit", "Inter", sans-serif',
  fontSize: 13,
  fontWeight: active ? 700 : 600,
  height: 40,
  padding: "0 14px",
});

function DocsToggle() {
  const api = useStorybookApi();
  const { storyId, viewMode } = useStorybookState();
  const currentEntry = storyId ? api.resolveStory(storyId) : undefined;
  const componentId = currentEntry?.type === "docs" ? currentEntry.parent : currentEntry?.parent;
  const componentEntry = componentId ? api.resolveStory(componentId) : undefined;

  if (componentEntry?.type !== "component") {
    return null;
  }

  const entries = componentEntry.children.map((id) => api.resolveStory(id));
  const canvasStoryId = entries.find((entry) => entry?.type === "story")?.id;
  const docsStoryId = entries.find((entry) => entry?.type === "docs")?.id;

  if (!canvasStoryId || !docsStoryId) {
    return null;
  }

  const isDocs = viewMode === "docs";
  const storageKey = `bayesstack:docs-canvas:${componentEntry.id}`;
  const savedCanvasStoryId = window.sessionStorage.getItem(storageKey);
  const returnStoryId =
    entries.find((entry) => entry?.type === "story" && entry.id === savedCanvasStoryId)?.id ??
    canvasStoryId;

  return React.createElement(
    "div",
    { style: { alignSelf: "stretch", display: "flex", marginLeft: 4 } },
    React.createElement(
      "button",
      {
        "aria-pressed": !isDocs,
        onClick: () => api.selectStory(returnStoryId),
        style: tabStyle(!isDocs),
        type: "button",
      },
      "Canvas",
    ),
    React.createElement(
      "button",
      {
        "aria-pressed": isDocs,
        onClick: () => {
          if (currentEntry?.type === "story") {
            window.sessionStorage.setItem(storageKey, currentEntry.id);
          }
          api.selectStory(docsStoryId);
        },
        style: tabStyle(isDocs),
        type: "button",
      },
      "Docs",
    ),
  );
}

addons.setConfig({
  sidebar: {
    filters: {
      hideDocsEntries: (entry) => entry.type !== "docs",
    },
  },
  theme: create({
    base: "light",
    brandTitle: "BayesStack Design Studio",
    brandUrl: "/?path=/story/welcome--introduction",
    brandTarget: "_self",
    brandImage: "/brand/logo-primary.png",
    colorPrimary: "#0B6763",
    colorSecondary: "#0B6763",
    appBg: "#FFFFFF",
    appContentBg: "#FFFFFF",
    appPreviewBg: "#F8FCFB",
    appBorderColor: "#D7E8E4",
    appBorderRadius: 12,
    fontBase: '"Outfit", "Inter", sans-serif',
    fontCode: '"DM Mono", "SFMono-Regular", monospace',
    textColor: "#123333",
    textInverseColor: "#FFFFFF",
    textMutedColor: "#68807D",
    barTextColor: "#59716E",
    barHoverColor: "#0B6763aa",
    barSelectedColor: "#0B6763",
    barBg: "#F1F8F6",
    buttonBg: "#0B6763",
    buttonBorder: "#0B6763",
    booleanBg: "#0B6763",
    booleanSelectedBg: "#084C49",
    inputBg: "#FFFFFF",
    inputBorder: "#C7DEDA",
    inputTextColor: "#123333",
    inputBorderRadius: 8,
  }),
});

addons.register("bayesstack/docs-toggle", () => {
  addons.add("bayesstack/docs-toggle", {
    title: "Switch between Canvas and Docs",
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === "story" || viewMode === "docs",
    render: () => React.createElement(DocsToggle),
  });
});
