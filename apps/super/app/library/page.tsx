"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Badge,
  Chip,
  Button,
  Icon,
  Ribbon,
  Table,
  SearchInput,
  Select,
  Breadcrumbs,
  Tabs,
  Alert,
  JsonEditor,
  type Column,
  type SelectOption,
  type TabItem,
} from "@bayesstack/ui";
import { SuperAdminLayout } from "../../components/SuperAdminLayout";
import { learningLibraryRibbonTabs } from "../../config/ribbons";
import { VideoStudio, type VideoActivityDescriptor } from "@bayesstack/studio-video";
import { CodingStudio, type CodingActivityDescriptor } from "@bayesstack/studio-coding";

interface Activity {
  id: string;
  concept_id?: string;
  concept_version?: number;
  activity_type: string;
  activity_version: string;
  title?: string;
  position: number;
  is_required: boolean;
  config?: Record<string, unknown>;
}

interface Concept {
  id: string;
  version: number;
  code: string;
  title: string;
  slug?: string;
  description?: string;
  topic_category?: string;
  tags?: string[];
  estimated_minutes?: number;
  content_status: string;
  metadata?: Record<string, unknown>;
  released_at?: string;
  activities: Activity[];
}

interface ActiveStudioSession {
  concept: Concept;
  activity: Activity;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LearningLibraryPage() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Standalone Studio State: null = Table View, object = Dedicated Full-Screen Studio
  const [activeStudio, setActiveStudio] = useState<ActiveStudioSession | null>(null);
  const [studioViewMode, setStudioViewMode] = useState<string>("runtime");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Fetch concepts from PostgreSQL via FastAPI
  const fetchConcepts = useCallback(() => {
    setLoading(true);
    setError("");
    fetch(`${apiUrl}/api/v1/catalog/concepts?limit=200`)
      .then((response) => {
        if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
        return response.json();
      })
      .then((data: Concept[]) => {
        const processed = data.map((c) => ({
          ...c,
          activities: (c.activities || []).slice().sort((a, b) => a.position - b.position),
        }));
        setConcepts(processed);
      })
      .catch((err: Error) => {
        setError(err.message || "Failed to connect to API");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchConcepts();
  }, [fetchConcepts]);

  // Deep linking via URL query parameters
  useEffect(() => {
    if (typeof window === "undefined" || concepts.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const conceptId = params.get("concept");
    const activityId = params.get("activity");

    if (conceptId && activityId) {
      const foundConcept = concepts.find((c) => c.id === conceptId);
      if (foundConcept) {
        const foundActivity = foundConcept.activities.find((a) => a.id === activityId);
        if (foundActivity) {
          setActiveStudio({ concept: foundConcept, activity: foundActivity });
        }
      }
    }
  }, [concepts]);

  // Keyboard shortcut: Esc to exit studio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeStudio) {
        handleExitStudio();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStudio]);

  // Launch Studio as Standalone Screen
  const handleLaunchStudio = (concept: Concept, activity: Activity) => {
    setActiveStudio({ concept, activity });
    setStudioViewMode("runtime");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("concept", concept.id);
      url.searchParams.set("activity", activity.id);
      window.history.pushState({}, "", url.toString());
    }
  };

  // Exit Studio back to Table View
  const handleExitStudio = () => {
    setActiveStudio(null);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("concept");
      url.searchParams.delete("activity");
      window.history.pushState({}, "", url.pathname);
    }
  };

  // Switch between activities of the concept inside the standalone studio
  const handleSwitchStudioActivity = (activityId: string) => {
    if (!activeStudio) return;
    const nextAct = activeStudio.concept.activities.find((a) => a.id === activityId);
    if (nextAct) {
      setActiveStudio({
        concept: activeStudio.concept,
        activity: nextAct,
      });
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("activity", nextAct.id);
        window.history.pushState({}, "", url.toString());
      }
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    concepts.forEach((c) => {
      if (c.topic_category) set.add(c.topic_category);
    });
    return Array.from(set);
  }, [concepts]);

  // Filtered concepts
  const filteredConcepts = useMemo(() => {
    return concepts.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(q))) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.activities && c.activities.some((a) => (a.title || "").toLowerCase().includes(q)));

      const matchesCategory =
        selectedCategory === "all" ||
        (c.topic_category && c.topic_category.toLowerCase() === selectedCategory.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ||
        c.content_status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [concepts, searchQuery, selectedCategory, selectedStatus]);

  // Total activities
  const totalActivitiesCount = useMemo(() => {
    return concepts.reduce((sum, c) => sum + (c.activities?.length || 0), 0);
  }, [concepts]);

  // Select dropdown options
  const categoryOptions: SelectOption[] = useMemo(() => {
    return [
      { value: "all", label: `All Topics (${concepts.length})` },
      ...categories.map((cat) => ({
        value: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
      })),
    ];
  }, [categories, concepts.length]);

  const statusOptions: SelectOption[] = [
    { value: "all", label: "All Statuses" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "review", label: "Review" },
  ];

  // Ribbon header with @bayesstack/ui Ribbon and Badges
  const ribbonHeader = (
    <Ribbon
      key="ribbon-library"
      tabs={learningLibraryRibbonTabs}
      defaultActiveTabId="templates"
      extra={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Badge variant="subtle" size="sm">
            {concepts.length} Concepts • {totalActivitiesCount} Activities
          </Badge>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: error ? "#ef4444" : "#10b981",
              background: error ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: error ? "#ef4444" : "#10b981",
              }}
            />
            {error ? "API Disconnected" : "PostgreSQL 5432 : Live"}
          </span>
        </div>
      }
    />
  );

  // Table Columns Definition leveraging @bayesstack/ui Table Column API
  const tableColumns: Column<Concept>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Concept Code",
        width: "180px",
        sortable: true,
        render: (_val, row: Concept) => (
          <div>
            <div
              style={{
                fontFamily: "var(--bs-font-mono, monospace)",
                fontWeight: 700,
                color: "#0b6763",
                fontSize: "0.85rem",
              }}
            >
              {row.code}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <Badge color="neutral" variant="subtle" size="sm">
                v{row.version}
              </Badge>
              <span style={{ fontSize: "0.68rem", color: "#8da0a4" }}>
                {row.id}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "title",
        header: "Concept Title & Objectives",
        render: (_val, row: Concept) => (
          <div>
            <div style={{ fontWeight: 800, color: "#142b32", fontSize: "0.95rem" }}>
              {row.title}
            </div>
            <p
              style={{
                margin: "4px 0 6px",
                fontSize: "0.78rem",
                color: "#546e73",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {row.description || "No description provided."}
            </p>

            {row.tags && row.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {row.tags.map((tag) => (
                  <Chip key={tag} color="neutral" variant="subtle">
                    #{tag}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "topic_category",
        header: "Category",
        width: "120px",
        render: (val: string) => (
          <Badge color="primary" variant="subtle" size="sm">
            {val || "general"}
          </Badge>
        ),
      },
      {
        key: "estimated_minutes",
        header: "Duration",
        width: "90px",
        render: (val?: number) => (
          <span style={{ color: "#334155", fontWeight: 600 }}>
            {val ? `${val} min` : "—"}
          </span>
        ),
      },
      {
        key: "content_status",
        header: "Status",
        width: "110px",
        render: (val: string) => (
          <Badge
            color={val === "published" ? "success" : val === "review" ? "warning" : "neutral"}
            variant="subtle"
            size="sm"
          >
            {val || "draft"}
          </Badge>
        ),
      },
      {
        key: "activities",
        header: "Activities Pipeline (Launch Standalone Studio)",
        width: 480,
        render: (_val, row: Concept) => {
          const activities = row.activities || [];
          if (activities.length === 0) {
            return (
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontStyle: "italic" }}>
                No activities configured
              </span>
            );
          }

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {activities.map((act, actIndex) => {
                const isVideo = act.activity_type.toLowerCase() === "video";
                return (
                  <div
                    key={act.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#f8fafb",
                      border: "1px solid #dce5e8",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", width: "14px" }}>
                        {actIndex + 1}.
                      </span>

                      <Badge
                        color={isVideo ? "success" : "info"}
                        variant="subtle"
                        size="sm"
                      >
                        {isVideo ? "▶ VIDEO" : "⌨ CODING"}
                      </Badge>

                      <span
                        title={act.title}
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {act.title || `Activity ${act.id}`}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      {act.is_required && (
                        <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>
                          Req
                        </span>
                      )}
                      <Button
                        variant="primary"
                        size="xs"
                        leftIcon={<Icon name={isVideo ? "Play" : "Code"} size={13} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchStudio(row, act);
                        }}
                      >
                        Launch Studio
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
    ],
    []
  );

  // =========================================================================
  // VIEW 1: DEDICATED STANDALONE STUDIO SCREEN (Leveraging @bayesstack/ui)
  // =========================================================================
  if (activeStudio) {
    const { concept, activity } = activeStudio;
    const isVideo = activity.activity_type.toLowerCase() === "video";
    const isCoding = activity.activity_type.toLowerCase() === "coding";

    const studioTabItems: TabItem[] = [
      { value: "runtime", label: "Studio Runtime", icon: isVideo ? "Play" : "Code" },
      { value: "descriptor", label: "CQRS Descriptor", icon: "BookOpen" },
    ];

    const activitySwitcherTabs: TabItem[] = (concept.activities || []).map((act, index) => ({
      value: act.id,
      label: `Act ${index + 1}: ${act.title || act.activity_type}`,
      icon: act.activity_type.toLowerCase() === "video" ? "Play" : "Code",
    }));

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: "var(--bs-ui-canvas, #f1f8f6)",
          color: "var(--bs-ui-ink, #123333)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "var(--bs-font-main, sans-serif)",
        }}
      >
        {/* Studio Top Control Navigation Bar */}
        <header
          style={{
            height: "60px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.5rem",
            boxShadow: "0 2px 12px rgba(11, 103, 99, 0.04)",
            flexShrink: 0,
          }}
        >
          {/* Left: Exit Button & Breadcrumbs using @bayesstack/ui */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon name="ArrowLeft" size={15} />}
              onClick={handleExitStudio}
              title="Return to Concept Table (Esc)"
            >
              Exit Studio
            </Button>

            <Breadcrumbs
              items={[
                { label: "Concepts Catalog", onClick: handleExitStudio },
                { label: concept.code },
                { label: concept.title },
              ]}
              showHomeIcon={false}
            />
          </div>

          {/* Center: Activity Switcher using @bayesstack/ui Tabs */}
          {concept.activities && concept.activities.length > 1 && (
            <Tabs
              items={activitySwitcherTabs}
              value={activity.id}
              onValueChange={handleSwitchStudioActivity}
              variant="pill"
              size="sm"
            />
          )}

          {/* Right: Studio Mode Toggle & Modality Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Tabs
              items={studioTabItems}
              value={studioViewMode}
              onValueChange={setStudioViewMode}
              variant="pill"
              size="sm"
            />

            <Badge color={isVideo ? "success" : "primary"} variant="subtle" size="sm">
              {activity.activity_type.toUpperCase()} STUDIO
            </Badge>
          </div>
        </header>

        {/* Studio Standalone Body */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: "var(--bs-ui-canvas, #f1f8f6)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {studioViewMode === "runtime" ? (
            <div style={{ maxWidth: "1600px", width: "100%", margin: "0 auto", flex: 1 }}>
              {isVideo && (
                <VideoStudio
                  activity={activity as VideoActivityDescriptor}
                  onComplete={() => {
                    setNotification({
                      message: `Video activity '${activity.title}' marked as completed!`,
                      type: "success",
                    });
                    setTimeout(() => setNotification(null), 4000);
                  }}
                />
              )}

              {isCoding && (
                <CodingStudio
                  activity={activity as CodingActivityDescriptor}
                  apiBaseUrl={apiUrl}
                  onComplete={() => {
                    setNotification({
                      message: `Coding solution for '${activity.title}' passed and submitted!`,
                      type: "success",
                    });
                    setTimeout(() => setNotification(null), 4000);
                  }}
                />
              )}

              {!isVideo && !isCoding && (
                <Alert severity="info" variant="accent" title={activity.title}>
                  Generic studio runtime mounted for activity type: <code>{activity.activity_type}</code>
                </Alert>
              )}
            </div>
          ) : (
            /* Standalone CQRS Descriptor JSON View using @bayesstack/ui JsonEditor */
            <div
              style={{
                maxWidth: "1100px",
                width: "100%",
                margin: "0 auto",
                background: "var(--bs-ui-surface, #ffffff)",
                borderRadius: "14px",
                padding: "1.5rem",
                border: "1px solid var(--bs-ui-line, #d7e8e4)",
                boxShadow: "0 4px 20px rgba(11, 103, 99, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                  borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
                  paddingBottom: "0.75rem",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, color: "var(--bs-ui-brand, #0b6763)", fontSize: "0.95rem", fontWeight: 700 }}>
                    CQRS Activity Publication Descriptor
                  </h4>
                  <p style={{ margin: "2px 0 0", color: "var(--bs-ui-muted, #4a6360)", fontSize: "0.75rem" }}>
                    Compiled immutable runtime manifest (contract v2026-09-01)
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="xs"
                  leftIcon={<Icon name="Copy" size={13} />}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(
                        {
                          activity_id: activity.id,
                          activity_release_id: `release-${activity.id}-1`,
                          activity_type: activity.activity_type,
                          activity_version: activity.activity_version,
                          contract_version: "2026-09-01",
                          position: activity.position,
                          is_required: activity.is_required,
                          title: activity.title,
                          config: activity.config,
                          concept_id: concept.id,
                          concept_version: concept.version,
                        },
                        null,
                        2
                      )
                    );
                    setNotification({ message: "Descriptor copied to clipboard!", type: "info" });
                    setTimeout(() => setNotification(null), 3000);
                  }}
                >
                  Copy JSON
                </Button>
              </div>

              {/* @bayesstack/ui JsonEditor */}
              <JsonEditor
                value={{
                  activity_id: activity.id,
                  activity_release_id: `release-${activity.id}-1`,
                  activity_type: activity.activity_type,
                  activity_version: activity.activity_version,
                  contract_version: "2026-09-01",
                  position: activity.position,
                  is_required: activity.is_required,
                  title: activity.title,
                  config: activity.config,
                  concept_id: concept.id,
                  concept_version: concept.version,
                }}
                variant="light"
                mode="tree"
                showRawToggle={true}
                readOnly={true}
              />
            </div>
          )}
        </main>

        {/* Notification Toast using @bayesstack/ui Alert */}
        {notification && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 10000,
              maxWidth: "400px",
            }}
          >
            <Alert
              severity={notification.type === "success" ? "success" : "info"}
              variant="accent"
              title={notification.message}
            />
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SINGLE CONCEPTS TABLE (Leveraging @bayesstack/ui Table, SearchInput, Select)
  // =========================================================================
  return (
    <SuperAdminLayout ribbon={ribbonHeader}>
      <div
        style={{
          width: "100%",
          minHeight: "calc(100vh - 110px)",
          background: "#f4f8f7",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--bs-font-main, sans-serif)",
          padding: "1.5rem",
          boxSizing: "border-box",
        }}
      >
        {/* Header Title & Filter Control Bar */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d7e8e4",
            borderRadius: "10px",
            padding: "1.25rem 1.5rem",
            marginBottom: "1.25rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* Breadcrumbs & Title */}
          <div>
            <Breadcrumbs
              items={[
                { label: "Master Catalog" },
                { label: "Concepts Library" },
              ]}
              showHomeIcon={true}
            />
            <h1 style={{ margin: "4px 0 2px", fontSize: "1.35rem", color: "#123333", fontWeight: 800 }}>
              Learning Concepts & Activity Runtimes
            </h1>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#546e73" }}>
              Explore platform concepts and launch interactive studio runtimes for each activity.
            </p>
          </div>

          {/* Controls: SearchInput, Select, and Button from @bayesstack/ui */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* SearchInput from @bayesstack/ui */}
            <div style={{ width: "260px" }}>
              <SearchInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
                placeholder="Search concepts, activities..."
                size="sm"
              />
            </div>

            {/* Topic Select from @bayesstack/ui */}
            <div style={{ width: "170px" }}>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                options={categoryOptions}
                placeholder="Topic..."
              />
            </div>

            {/* Status Select from @bayesstack/ui */}
            <div style={{ width: "150px" }}>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                options={statusOptions}
                placeholder="Status..."
              />
            </div>

            {/* Refresh Button from @bayesstack/ui */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon name="Refresh" size={15} />}
              onClick={fetchConcepts}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert from @bayesstack/ui */}
        {error && (
          <div style={{ marginBottom: "1.25rem" }}>
            <Alert
              severity="error"
              variant="accent"
              title="Failed to connect to API"
              action={
                <Button variant="danger" size="xs" onClick={fetchConcepts}>
                  Retry
                </Button>
              }
            >
              {error}. Verify PostgreSQL is running on 5432 and API monolith is running on port 8000.
            </Alert>
          </div>
        )}

        {/* SINGLE CONCEPTS TABLE using @bayesstack/ui Table Organism */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d7e8e4",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            overflow: "hidden",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Table<Concept>
            data={filteredConcepts}
            columns={tableColumns}
            rowKey="id"
            size="md"
            hoverable={true}
            bordered={true}
            striped={true}
            loading={loading}
            emptyText="No matching concepts found in database."
          />

          {/* Table Summary Footer */}
          <div
            style={{
              padding: "0.75rem 1.25rem",
              background: "#fafcfc",
              borderTop: "1px solid #eef2f3",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.78rem",
              color: "#64748b",
            }}
          >
            <div>
              Displaying <strong>{filteredConcepts.length}</strong> of <strong>{concepts.length}</strong> catalog concepts
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>Registered Activities: <strong>{totalActivitiesCount}</strong></span>
              <span>&bull;</span>
              <span>Backend: <strong style={{ color: "#10b981" }}>PostgreSQL + FastAPI 8000</strong></span>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
