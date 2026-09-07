import React, { useState } from "react";
import { Tabs, Badge, type TabItem } from "@bayesstack/ui";
import { ProblemDescriptionTab } from "./ProblemDescriptionTab";
import { EditorialTab } from "./EditorialTab";
import { SubmissionsTab } from "./SubmissionsTab";
import { NotesTab } from "./NotesTab";
import type { TestCase, SubmissionRecord, CodingActivityConfig } from "../../types";

interface LeftPaneProps {
  title: string;
  config: CodingActivityConfig;
  testCases: TestCase[];
  submissions: SubmissionRecord[];
  submissionsLoading: boolean;
  onRefreshSubmissions: () => void;
}

export function LeftPane({
  title,
  config,
  testCases,
  submissions,
  submissionsLoading,
  onRefreshSubmissions,
}: LeftPaneProps) {
  const [activeTab, setActiveTab] = useState<string>("description");

  const tabItems: TabItem[] = [
    {
      value: "description",
      label: "Description",
      icon: "BookOpen",
    },
    {
      value: "editorial",
      label: "Editorial",
      icon: "Lightbulb",
    },
    {
      value: "notes",
      label: "My Notes",
      icon: "Edit",
    },
    {
      value: "submissions",
      label: "Submissions",
      icon: "Clock",
      badge: submissions.length > 0 ? (
        <Badge color="neutral" variant="subtle" size="sm">
          {submissions.length}
        </Badge>
      ) : undefined,
    },
  ];

  return (
    <div
      className="bs-cs-left-pane"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        borderRight: "1px solid var(--bs-ui-line, #d7e8e4)",
        background: "var(--bs-ui-surface, #ffffff)",
      }}
    >
      {/* Tab Navigation */}
      <div
        className="bs-cs-left-nav"
        style={{
          padding: "0.4rem 1rem 0",
          borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
          background: "var(--bs-ui-surface, #ffffff)",
          flexShrink: 0,
        }}
      >
        <Tabs
          items={tabItems}
          value={activeTab}
          onValueChange={setActiveTab}
          variant="line"
          size="md"
        />
      </div>

      {/* Scrollable Tab Content Body */}
      <div
        className="bs-cs-left-body bs-cs-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.25rem 1.5rem",
          background: "var(--bs-ui-surface, #ffffff)",
          minHeight: 0,
        }}
      >
        {activeTab === "description" && (
          <ProblemDescriptionTab
            title={title}
            config={config}
            testCases={testCases}
          />
        )}

        {activeTab === "editorial" && (
          <EditorialTab config={config} />
        )}

        {activeTab === "notes" && (
          <NotesTab problemId={String(config.problem_id || "default")} />
        )}

        {activeTab === "submissions" && (
          <SubmissionsTab
            submissions={submissions}
            loading={submissionsLoading}
            onRefresh={onRefreshSubmissions}
          />
        )}
      </div>
    </div>
  );
}
