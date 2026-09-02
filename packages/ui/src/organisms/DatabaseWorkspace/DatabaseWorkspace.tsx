import React, { useState, useEffect, useMemo, useRef, useCallback, forwardRef } from "react";
import { Icon, type IconName } from "../../atoms/Icons";
import { TextInput } from "../../atoms/Inputs/TextInput";
import { Skeleton } from "../../atoms/Loading/Skeleton";
import type {
  DatabaseWorkspaceProps,
  DbTable,
  DbSchemaGroup,
  OpenedTab,
} from "./types";
import "./DatabaseWorkspace.css";

const defaultMockTables: DbTable[] = [
  {
    id: "public.tenants",
    name: "tenants",
    schema: "public",
    description: "Registered enterprise tenants and institutional domains",
    rowCount: 1420,
    sizeBytes: 245760,
    icon: "Database",
    columns: [
      { name: "id", type: "uuid", primaryKey: true, nullable: false },
      { name: "slug", type: "varchar(64)", nullable: false },
      { name: "name", type: "varchar(255)", nullable: false },
      { name: "tier", type: "varchar(32)", nullable: false },
      { name: "created_at", type: "timestamptz", nullable: false },
    ],
  },
  {
    id: "public.users",
    name: "users",
    schema: "public",
    description: "Global user profiles across platform tenants",
    rowCount: 89200,
    sizeBytes: 14680064,
    icon: "User",
    columns: [
      { name: "id", type: "uuid", primaryKey: true, nullable: false },
      { name: "email", type: "varchar(255)", nullable: false },
      { name: "full_name", type: "varchar(255)", nullable: true },
      { name: "role", type: "varchar(64)", nullable: false },
      { name: "tenant_id", type: "uuid", nullable: false },
    ],
  },
  {
    id: "public.courses",
    name: "courses",
    schema: "public",
    description: "Master course templates catalog",
    rowCount: 340,
    sizeBytes: 1048576,
    icon: "BookOpen",
    columns: [
      { name: "id", type: "uuid", primaryKey: true, nullable: false },
      { name: "code", type: "varchar(32)", nullable: false },
      { name: "title", type: "varchar(255)", nullable: false },
      { name: "status", type: "varchar(32)", nullable: false },
    ],
  },
  {
    id: "auth.sessions",
    name: "sessions",
    schema: "auth",
    description: "Active authentication sessions and tokens",
    rowCount: 4500,
    sizeBytes: 524288,
    icon: "Shield",
    columns: [
      { name: "id", type: "uuid", primaryKey: true, nullable: false },
      { name: "user_id", type: "uuid", nullable: false },
      { name: "token_hash", type: "varchar(512)", nullable: false },
      { name: "expires_at", type: "timestamptz", nullable: false },
    ],
  },
  {
    id: "analytics.audit_logs",
    name: "audit_logs",
    schema: "analytics",
    description: "System audit trails and admin action events",
    rowCount: 312000,
    sizeBytes: 41943040,
    icon: "Activity",
    columns: [
      { name: "id", type: "uuid", primaryKey: true, nullable: false },
      { name: "actor_id", type: "uuid", nullable: false },
      { name: "action", type: "varchar(128)", nullable: false },
      { name: "payload", type: "jsonb", nullable: true },
      { name: "timestamp", type: "timestamptz", nullable: false },
    ],
  },
];

export const DatabaseWorkspace = forwardRef<HTMLDivElement, DatabaseWorkspaceProps>(
  (
    {
      tables = defaultMockTables,
      schemas: propSchemas,
      defaultSelectedTableId,
      defaultOpenedTableIds,
      onTableSelect,
      onTabClose,
      onTabRename,
      onNewQuery,
      loading = false,
      defaultExplorerCollapsed = false,
      defaultExplorerWidth = 260,
      minExplorerWidth = 180,
      maxExplorerWidth = 500,
      onExplorerResize,
      tabStripExtra,
      children,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // 1. Explorer Collapse and Resize State
    const [isExplorerCollapsed, setIsExplorerCollapsed] = useState<boolean>(defaultExplorerCollapsed);
    const [explorerWidth, setExplorerWidth] = useState<number>(defaultExplorerWidth);
    const [editingTabId, setEditingTabId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>("");
    const [isResizing, setIsResizing] = useState<boolean>(false);

    // 2. Search Filter State
    const [searchQuery, setSearchQuery] = useState<string>("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // 3. Tab State Management
    const [openedTabs, setOpenedTabs] = useState<OpenedTab[]>(() => {
      if (defaultOpenedTableIds && defaultOpenedTableIds.length > 0) {
        return defaultOpenedTableIds
          .map((id) => {
            const table = tables.find((t) => t.id === id);
            if (!table) return null;
            return {
              id: table.id,
              tableId: table.id,
              title: table.name,
              schema: table.schema,
              table,
            };
          })
          .filter(Boolean) as OpenedTab[];
      }
      // Default to opening the first table if available
      if (tables.length > 0) {
        const initialTable = defaultSelectedTableId
          ? tables.find((t) => t.id === defaultSelectedTableId) || tables[0]
          : tables[0];
        return [
          {
            id: initialTable.id,
            tableId: initialTable.id,
            title: initialTable.name,
            schema: initialTable.schema,
            table: initialTable,
          },
        ];
      }
      return [];
    });

    const [activeTabId, setActiveTabId] = useState<string>(() => {
      if (defaultSelectedTableId) return defaultSelectedTableId;
      if (tables.length > 0) return tables[0].id;
      return "";
    });

    // Handle selecting a table from explorer (opens tab if not open, or focuses existing tab)
    const handleSelectTable = useCallback(
      (table: DbTable) => {
        // Check if tab already exists
        const existingTab = openedTabs.find((t) => t.tableId === table.id);
        if (existingTab) {
          setActiveTabId(existingTab.id);
        } else {
          const newTab: OpenedTab = {
            id: table.id,
            tableId: table.id,
            title: table.name,
            schema: table.schema,
            table,
          };
          setOpenedTabs((prev) => [...prev, newTab]);
          setActiveTabId(table.id);
        }

        if (onTableSelect) {
          onTableSelect(table);
        }
      },
      [openedTabs, onTableSelect]
    );

    // Synchronize external defaultSelectedTableId changes (e.g. creating query tabs)
    useEffect(() => {
      if (defaultSelectedTableId) {
        const targetTable = tables.find((t) => t.id === defaultSelectedTableId);
        if (targetTable) {
          setActiveTabId((current) => (current !== targetTable.id ? targetTable.id : current));
          setOpenedTabs((prev) => {
            if (!prev.some((t) => t.id === targetTable.id)) {
              return [
                ...prev,
                {
                  id: targetTable.id,
                  tableId: targetTable.id,
                  title: targetTable.name,
                  schema: targetTable.schema,
                  table: targetTable,
                },
              ];
            }
            return prev;
          });
        }
      }
    }, [defaultSelectedTableId, tables]);

    // Handle closing a tab
    const handleCloseTab = useCallback(
      (tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        setOpenedTabs((prevTabs) => {
          const targetIndex = prevTabs.findIndex((t) => t.id === tabId);
          const nextTabs = prevTabs.filter((t) => t.id !== tabId);

          if (activeTabId === tabId) {
            if (nextTabs.length > 0) {
              // Activate neighbor tab
              const nextActiveIndex = targetIndex >= nextTabs.length ? nextTabs.length - 1 : targetIndex;
              const nextActiveTab = nextTabs[nextActiveIndex];
              setActiveTabId(nextActiveTab.id);
              if (onTableSelect) onTableSelect(nextActiveTab.table);
            } else {
              setActiveTabId("");
              if (onTableSelect) onTableSelect(null);
            }
          }

          return nextTabs;
        });

        if (onTabClose) {
          onTabClose(tabId);
        }
      },
      [activeTabId, onTableSelect, onTabClose]
    );

    const editingStartTimeRef = useRef<number>(0);

    const handleStartRename = (tabId: string, currentTitle: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      editingStartTimeRef.current = Date.now();
      setEditingTabId(tabId);
      setEditingTitle(currentTitle);
    };

    const handleSaveRename = (tabId: string, force = false) => {
      if (!force && Date.now() - editingStartTimeRef.current < 300) {
        return;
      }
      const cleanTitle = editingTitle.trim();
      if (cleanTitle) {
        setOpenedTabs((prev) =>
          prev.map((t) => {
            if (t.id === tabId) {
              return {
                ...t,
                title: cleanTitle,
                table: { ...t.table, name: cleanTitle },
              };
            }
            return t;
          })
        );
        if (onTabRename) {
          onTabRename(tabId, cleanTitle);
        }
      }
      setEditingTabId(null);
      setEditingTitle("");
    };

    // Keep openedTabs titles in sync when tables prop changes (e.g. from parent renaming)
    useEffect(() => {
      setOpenedTabs((prev) =>
        prev.map((tab) => {
          const matchingTable = tables.find((t) => t.id === tab.id);
          if (matchingTable && (matchingTable.name !== tab.title || matchingTable.name !== tab.table.name)) {
            return {
              ...tab,
              title: matchingTable.name,
              table: matchingTable,
            };
          }
          return tab;
        })
      );
    }, [tables]);

    // Keyboard shortcut handler (Cmd/Ctrl + K for search focus, Escape to clear)
    const handleKeyDownContainer = (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isExplorerCollapsed) setIsExplorerCollapsed(false);
        if (searchInputRef.current) searchInputRef.current.focus();
      } else if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("");
      }
    };

    // Separate database tables from SQL query items
    const realDbTables = useMemo(() => {
      return tables.filter((t) => t.schema !== "sql" && !t.id.startsWith("query-editor"));
    }, [tables]);

    const queryTables = useMemo(() => {
      return tables.filter((t) => t.schema === "sql" || t.id.startsWith("query-editor"));
    }, [tables]);

    // Filter database tables by search query
    const filteredTables = useMemo(() => {
      if (!searchQuery.trim()) return realDbTables;
      const q = searchQuery.toLowerCase().trim();
      return realDbTables.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.schema && t.schema.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }, [realDbTables, searchQuery]);

    // Group tables by schema
    const schemaGroups = useMemo(() => {
      if (propSchemas) return propSchemas;

      const groupMap: Record<string, DbTable[]> = {};
      filteredTables.forEach((table) => {
        const s = table.schema || "public";
        if (!groupMap[s]) groupMap[s] = [];
        groupMap[s].push(table);
      });

      return Object.keys(groupMap).map((schemaKey) => ({
        name: schemaKey,
        tables: groupMap[schemaKey],
      }));
    }, [propSchemas, filteredTables]);

    const [tablesHeightPct, setTablesHeightPct] = useState<number>(55);
    const [isVResizing, setIsVResizing] = useState<boolean>(false);
    const explorerRef = useRef<HTMLDivElement>(null);

    const handleMouseDownVResizer = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        setIsVResizing(true);

        const startY = e.clientY;
        const startPercentage = tablesHeightPct;
        const containerHeight = explorerRef.current?.clientHeight || 500;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const deltaY = moveEvent.clientY - startY;
          const deltaPct = (deltaY / containerHeight) * 100;
          let newPct = startPercentage + deltaPct;

          if (newPct < 15) newPct = 15;
          if (newPct > 85) newPct = 85;

          setTablesHeightPct(newPct);
        };

        const handleMouseUp = () => {
          setIsVResizing(false);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      },
      [tablesHeightPct]
    );

    // 4. Explorer Resizing Drag Handlers
    const handleMouseDownResizer = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);

        const startX = e.clientX;
        const startWidth = explorerWidth;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const deltaX = moveEvent.clientX - startX;
          let newWidth = startWidth + deltaX;

          if (newWidth < minExplorerWidth) newWidth = minExplorerWidth;
          if (newWidth > maxExplorerWidth) newWidth = maxExplorerWidth;

          setExplorerWidth(newWidth);
          if (onExplorerResize) onExplorerResize(newWidth);
        };

        const handleMouseUp = () => {
          setIsResizing(false);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      },
      [explorerWidth, minExplorerWidth, maxExplorerWidth, onExplorerResize]
    );

    const handleDoubleClickResizer = useCallback(() => {
      setExplorerWidth(defaultExplorerWidth);
      if (onExplorerResize) onExplorerResize(defaultExplorerWidth);
    }, [defaultExplorerWidth, onExplorerResize]);

    const activeTab = openedTabs.find((t) => t.id === activeTabId);
    const activeTable = activeTab?.table;

    return (
      <div
        ref={ref}
        className={[
          "bs-db-workspace",
          isResizing && "bs-db-workspace--resizing",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        onKeyDown={handleKeyDownContainer}
        {...props}
      >
        {/* Left Pane: Table Explorer */}
        <aside
          className={[
            "bs-db-explorer",
            isExplorerCollapsed && "bs-db-explorer--collapsed",
            classNames?.explorer,
          ]
            .filter(Boolean)
            .join(" ")}
          style={isExplorerCollapsed ? undefined : { width: `${explorerWidth}px`, flexShrink: 0 }}
        >
          {/* Explorer Header */}
          <div className={["bs-db-explorer-header", classNames?.explorerHeader].filter(Boolean).join(" ")}>
            {!isExplorerCollapsed && (
              <div className="bs-db-explorer-title">
                <span>Tables</span>
                <span className="bs-db-explorer-count">{tables.length}</span>
              </div>
            )}
            <button
              type="button"
              className="bs-db-explorer-toggle"
              aria-label={isExplorerCollapsed ? "Expand table explorer" : "Collapse table explorer"}
              onClick={() => setIsExplorerCollapsed(!isExplorerCollapsed)}
            >
              <Icon name={isExplorerCollapsed ? "ArrowRight" : "ArrowLeft"} size={16} />
            </button>
          </div>

          {!isExplorerCollapsed && (
            <div ref={explorerRef} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              {/* Top Section: Tables Explorer */}
              <div style={{ flex: `0 0 ${tablesHeightPct}%`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Search Field */}
                <div className={["bs-db-explorer-search", classNames?.explorerSearch].filter(Boolean).join(" ")}>
                  <TextInput
                    ref={searchInputRef}
                    size="sm"
                    placeholder="Filter tables... (⌘K)"
                    prefixIcon="Search"
                    clearable
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery("")}
                  />
                </div>

                {/* Tables Body / Grouped Table Tree */}
                <div className={["bs-db-explorer-body", classNames?.explorerTree].filter(Boolean).join(" ")} style={{ flex: 1, overflowY: "auto" }}>
                  {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px 14px" }}>
                      <Skeleton title={{ width: "45%" }} paragraph={{ rows: 3, width: ["90%", "75%", "85%"] }} active />
                      <Skeleton title={{ width: "35%" }} paragraph={{ rows: 2, width: ["80%", "65%"] }} active />
                    </div>
                  ) : schemaGroups.length === 0 || filteredTables.length === 0 ? (
                    <div className="bs-db-explorer-empty">
                      {searchQuery ? `No tables matching "${searchQuery}"` : "No tables found"}
                    </div>
                  ) : (
                    schemaGroups.map((group) => (
                      <div key={group.name} className={["bs-db-schema-group", classNames?.explorerGroup].filter(Boolean).join(" ")}>
                        <div className="bs-db-schema-header">
                          <span>{group.name}</span>
                          <span style={{ opacity: 0.7 }}>{group.tables.length}</span>
                        </div>

                        {group.tables.map((table) => {
                          const isSelected = activeTabId === table.id;
                          return (
                            <button
                              key={table.id}
                              type="button"
                              className={[
                                "bs-db-table-item",
                                isSelected && "bs-db-table-item--active",
                                classNames?.explorerItem,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              onClick={() => handleSelectTable(table)}
                            >
                              <div className="bs-db-table-meta">
                                <Icon name={table.icon || "Database"} size={14} />
                                <span className="bs-db-table-name">{table.name}</span>
                              </div>
                              {table.rowCount !== undefined && (
                                <span className="bs-db-table-rows">
                                  {table.rowCount > 1000 ? `${(table.rowCount / 1000).toFixed(1)}k` : table.rowCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Horizontal Resizer Handle between Tables & Queries */}
              <div
                role="separator"
                aria-orientation="horizontal"
                style={{
                  height: "6px",
                  background: isVResizing ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-line, #d7e8e4)",
                  cursor: "row-resize",
                  flexShrink: 0,
                  transition: "background 0.15s ease",
                  zIndex: 5,
                }}
                onMouseDown={handleMouseDownVResizer}
                onDoubleClick={() => setTablesHeightPct(55)}
                title="Drag to resize Tables / Queries split (Double-click to reset)"
              />

              {/* Bottom Section: Queries List */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bs-ui-surface, #ffffff)" }}>
                <div
                  className="bs-db-schema-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "var(--bs-ui-canvas, #f1f8f6)",
                    borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Icon name="Code" size={13} />
                    <span>Queries</span>
                    <span className="bs-db-explorer-count">{queryTables.length}</span>
                  </div>
                  {onNewQuery && (
                    <button
                      type="button"
                      onClick={onNewQuery}
                      title="Create new SQL query"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        borderRadius: "4px",
                        background: "var(--bs-ui-brand-soft, #e4f2ef)",
                        color: "var(--bs-ui-brand, #0b6763)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Icon name="Add" size={12} />
                      <span>New</span>
                    </button>
                  )}
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
                  {queryTables.length === 0 ? (
                    <div style={{ padding: "12px", fontSize: "12px", color: "var(--bs-ui-muted, #4a6360)", fontStyle: "italic", textAlign: "center" }}>
                      No queries created yet.
                    </div>
                  ) : (
                    queryTables.map((q) => {
                      const isSelected = activeTabId === q.id;
                      const isEditing = editingTabId === q.id;

                      return (
                        <div
                          key={q.id}
                          className={[
                            "bs-db-table-item",
                            isSelected && "bs-db-table-item--active",
                            classNames?.explorerItem,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => handleSelectTable(q)}
                          onDoubleClick={(e) => handleStartRename(q.id, q.name, e)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px" }}
                        >
                          <div className="bs-db-table-meta" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                            <Icon name="Code" size={14} color={isSelected ? "var(--bs-ui-brand, #0b6763)" : undefined} />
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveRename(q.id, true);
                                  if (e.key === "Escape") setEditingTabId(null);
                                }}
                                onBlur={() => handleSaveRename(q.id)}
                                onClick={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.target.select()}
                                autoFocus
                                style={{
                                  fontSize: "12px",
                                  padding: "1px 4px",
                                  borderRadius: "3px",
                                  border: "1px solid var(--bs-ui-brand, #0b6763)",
                                  outline: "none",
                                  width: "80%",
                                }}
                              />
                            ) : (
                              <span
                                className="bs-db-table-name"
                                onDoubleClick={(e) => handleStartRename(q.id, q.name, e)}
                                title="Double-click to rename query"
                                style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              >
                                {q.name}
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <button
                              type="button"
                              aria-label="Edit query name"
                              onClick={(e) => handleStartRename(q.id, q.name, e)}
                              style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.6, padding: "2px" }}
                            >
                              <Icon name="Edit" size={12} />
                            </button>
                            {openedTabs.some((t) => t.id === q.id) && (
                              <button
                                type="button"
                                aria-label="Close query tab"
                                onClick={(e) => handleCloseTab(q.id, e)}
                                style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.6, padding: "2px" }}
                              >
                                <Icon name="Close" size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Vertical Separator Drag Resizer Handle */}
        {!isExplorerCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={explorerWidth}
            aria-valuemin={minExplorerWidth}
            aria-valuemax={maxExplorerWidth}
            tabIndex={0}
            className={[
              "bs-db-resizer",
              isResizing && "bs-db-resizer--active",
              classNames?.explorerResizer,
            ]
              .filter(Boolean)
              .join(" ")}
            onMouseDown={handleMouseDownResizer}
            onDoubleClick={handleDoubleClickResizer}
            title="Drag to resize table explorer (Double-click to reset)"
          />
        )}

        {/* Right Pane: VS Code Style Workspace Area Skeleton */}
        <main className={["bs-db-main", classNames?.mainContent].filter(Boolean).join(" ")}>
          {/* Tab Strip */}
          <div className={["bs-db-tabstrip", classNames?.tabStrip].filter(Boolean).join(" ")}>
            <div className="bs-db-tabs-container" role="tablist">
              {openedTabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                const isEditing = editingTabId === tab.id;
                return (
                  <div
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    className={[
                      "bs-db-tab",
                      isActive && "bs-db-tab--active",
                      classNames?.tabItem,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      setActiveTabId(tab.id);
                      if (onTableSelect) onTableSelect(tab.table);
                    }}
                    onDoubleClick={(e) => handleStartRename(tab.id, tab.title, e)}
                  >
                    <Icon name={tab.table.icon || "Database"} size={14} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(tab.id, true);
                          if (e.key === "Escape") setEditingTabId(null);
                        }}
                        onBlur={() => handleSaveRename(tab.id)}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.target.select()}
                        autoFocus
                        style={{
                          fontSize: "12px",
                          padding: "1px 4px",
                          borderRadius: "3px",
                          border: "1px solid var(--bs-ui-brand, #0b6763)",
                          outline: "none",
                          background: "var(--bs-ui-surface, #ffffff)",
                          color: "var(--bs-ui-ink, #123333)",
                          width: "100px",
                        }}
                      />
                    ) : (
                      <span
                        onDoubleClick={(e) => handleStartRename(tab.id, tab.title, e)}
                        title="Double-click to rename tab"
                      >
                        {tab.title}
                      </span>
                    )}
                    <button
                      type="button"
                      className="bs-db-tab-close"
                      aria-label={`Close ${tab.title} tab`}
                      onClick={(e) => handleCloseTab(tab.id, e)}
                    >
                      <Icon name="Close" size={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            {tabStripExtra && <div>{tabStripExtra}</div>}
          </div>

          {/* Canvas Area: App Content Slot or Empty State */}
          {activeTable ? (
            <div className={["bs-db-canvas", classNames?.workspaceCanvas].filter(Boolean).join(" ")}>
              {typeof children === "function" ? children(activeTable) : children}
            </div>
          ) : (
            <div className={["bs-db-empty-canvas", classNames?.emptyState].filter(Boolean).join(" ")}>
              <div className="bs-db-empty-icon">🗄️</div>
              <div className="bs-db-empty-title">No Table Selected</div>
              <div className="bs-db-empty-desc">
                Select a database table from the explorer on the left to open a tab workspace.
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }
);

DatabaseWorkspace.displayName = "DatabaseWorkspace";
