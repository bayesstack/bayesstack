import React, { useState } from "react";
import { Badge, CodeEditor, Icon, Table } from "@bayesstack/ui";

export function SqlQueryConsole({ dbEngine }: { dbEngine: string }) {
  const [query, setQuery] = useState<string>("SELECT * FROM public.tenants LIMIT 10;");
  const [loading, setLoading] = useState<boolean>(false);
  const [editorHeight, setEditorHeight] = useState<number>(240);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const [result, setResult] = useState<{
    status: "idle" | "success" | "error";
    execution_time_ms?: number;
    row_count?: number;
    columns?: { name: string; type: string }[];
    rows?: any[];
    error?: string;
    message?: string;
  }>({ status: "idle" });

  const handleRunQuery = async (queryToRun?: string) => {
    const sql = (queryToRun || query).trim();
    if (!sql) return;

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${apiUrl}/api/super/database/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sql }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errText = await res.text();
        setResult({
          status: "error",
          error: errText || `HTTP ${res.status} Error`,
          execution_time_ms: 0,
        });
      }
    } catch (err: any) {
      setResult({
        status: "error",
        error: err.message || "Failed to reach backend database service",
        execution_time_ms: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunQuery();
    }
  };

  const handleMouseDownResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = editorHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      let newHeight = startHeight + deltaY;
      if (newHeight < 100) newHeight = 100;
      if (newHeight > 600) newHeight = 600;
      setEditorHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const tableColumns = (result.columns || []).map((col) => ({
    key: col.name,
    header: (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span>{col.name}</span>
        <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }}>({col.type})</span>
      </div>
    ),
    render: (val: any) => {
      if (val === null || val === undefined) {
        return <span style={{ color: "#94a3b8", fontStyle: "italic" }}>NULL</span>;
      }
      if (typeof val === "boolean") {
        return val ? "TRUE" : "FALSE";
      }
      return String(val);
    },
  }));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "var(--bs-ui-surface, #ffffff)", overflow: "hidden" }}>
      {/* Top Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          background: "#0f172a",
          borderBottom: "1px solid #334155",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Icon name="Terminal" size={16} color="#38bdf8" />
          <span style={{ color: "#f8fafc", fontWeight: 600, fontSize: "0.875rem" }}>SQL Query Console</span>
          <Badge variant="subtle" size="sm" style={{ background: "#1e293b", color: "#38bdf8", border: "1px solid #334155" }}>
            {dbEngine.toUpperCase()}
          </Badge>
        </div>

        {/* Toolbar Buttons: Save Query, Copy SQL & Run Query */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 12px",
              borderRadius: "6px",
              background: isSaved ? "rgba(245, 158, 11, 0.15)" : "#1e293b",
              color: isSaved ? "#f59e0b" : "#94a3b8",
              fontWeight: 600,
              fontSize: "0.825rem",
              border: isSaved ? "1px solid #f59e0b" : "1px solid #334155",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Bookmark & Save Query (Placeholder)"
          >
            <Icon name="Bookmark" size={14} color={isSaved ? "#f59e0b" : undefined} />
            <span>{isSaved ? "Saved!" : "Save Query"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopySql}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 12px",
              borderRadius: "6px",
              background: "#1e293b",
              color: copied ? "#34d399" : "#94a3b8",
              fontWeight: 600,
              fontSize: "0.825rem",
              border: "1px solid #334155",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Copy SQL query to clipboard"
          >
            <Icon name={copied ? "CheckCircle" : "Copy"} size={14} />
            <span>{copied ? "Copied!" : "Copy SQL"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRunQuery()}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "6px",
              background: loading ? "#0369a1" : "var(--bs-ui-brand, #0b6763)",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.825rem",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            <Icon name={loading ? "Refresh" : "Play"} size={14} />
            <span>{loading ? "Executing..." : "Run Query"}</span>
            <span style={{ fontSize: "0.7rem", opacity: 0.8, fontWeight: 400 }}>Ctrl+Enter</span>
          </button>
        </div>
      </div>

      {/* SQL Code Editor Area */}
      <div style={{ height: `${editorHeight}px`, flexShrink: 0, overflow: "hidden" }} onKeyDown={handleKeyDown}>
        <CodeEditor
          language="sql"
          value={query}
          onChange={setQuery}
          variant="dark"
          showCopy={false}
          showLineNumbers={true}
          showLanguageSelect={false}
          showStatusFooter={true}
          minHeight={`${editorHeight}px`}
          style={{ height: "100%", borderRadius: 0, border: "none" }}
        />
      </div>

      {/* Adjustable Vertical Split Drag Handle */}
      <div
        role="separator"
        aria-orientation="horizontal"
        style={{
          height: "6px",
          background: isResizing ? "var(--bs-ui-brand, #0b6763)" : "#334155",
          cursor: "row-resize",
          flexShrink: 0,
          transition: "background 0.15s ease",
          zIndex: 10,
        }}
        onMouseDown={handleMouseDownResizer}
        onDoubleClick={() => setEditorHeight(240)}
        title="Drag to resize SQL Editor height (Double-click to reset)"
      />

      {/* Query Result Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 16px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "#334155",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Query Results</span>
          {result.status === "success" && (
            <Badge color="success" variant="subtle" size="sm">
              SUCCESS 200 OK
            </Badge>
          )}
          {result.status === "error" && (
            <Badge color="danger" variant="subtle" size="sm">
              ERROR
            </Badge>
          )}
        </div>

        {result.status === "success" && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#64748b", fontWeight: 400 }}>
            <span>Rows: <strong>{result.row_count ?? result.rows?.length ?? 0}</strong></span>
            <span>Execution: <strong>{result.execution_time_ms} ms</strong></span>
          </div>
        )}
      </div>

      {/* Query Result Output Data Grid or Error Display */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {result.status === "error" ? (
          <div style={{ padding: "1.5rem", background: "#fef2f2", color: "#991b1b", fontFamily: "monospace", fontSize: "0.85rem", height: "100%", overflowY: "auto" }}>
            <strong>SQL Execution Error:</strong>
            <pre style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>{result.error}</pre>
          </div>
        ) : result.message ? (
          <div style={{ padding: "1.5rem", color: "#166534", background: "#f0fdf4", fontSize: "0.875rem" }}>
            ✓ {result.message}
          </div>
        ) : (
          <Table
            striped
            bordered
            hoverable
            size="sm"
            loading={loading}
            columns={tableColumns}
            data={result.rows || []}
            emptyText={result.status === "idle" ? "Click 'Run Query' or press Ctrl+Enter to execute SQL query." : "Query executed successfully. 0 rows returned."}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>
    </div>
  );
}
