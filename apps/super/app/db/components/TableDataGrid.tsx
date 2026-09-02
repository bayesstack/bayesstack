import React, { useState, useEffect } from "react";
import { Table, type DbTable } from "@bayesstack/ui";

export function TableDataGrid({ activeTable }: { activeTable: DbTable | null }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!activeTable || activeTable.schema === "sql" || activeTable.id.startsWith("query-editor")) return;
    const currentTable = activeTable;
    let isMounted = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    async function fetchRows() {
      setLoading(true);
      try {
        const res = await fetch(
          `${apiUrl}/api/super/database/tables/${currentTable.schema}/${currentTable.name}/rows`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setRows(data.rows || []);
          }
        } else if (isMounted) {
          setRows([]);
        }
      } catch (err) {
        console.warn("Failed to fetch table rows from API", err);
        if (isMounted) {
          setRows([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [activeTable?.id, activeTable]);

  if (!activeTable) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--bs-muted, #64748b)" }}>
        Select a database table from the explorer on the left to view data.
      </div>
    );
  }

  const columns = (activeTable.columns || []).map((col) => ({
    key: col.name,
    header: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span>{col.name}</span>
        {col.primaryKey && (
          <span
            style={{
              fontSize: "0.65rem",
              padding: "1px 4px",
              borderRadius: "3px",
              background: "var(--bs-ui-brand-soft, #e4f2ef)",
              color: "var(--bs-ui-brand, #0b6763)",
              fontWeight: 700,
            }}
          >
            PK
          </span>
        )}
        <span style={{ fontSize: "0.7rem", color: "var(--bs-muted, #64748b)", fontWeight: 400 }}>
          ({col.type})
        </span>
      </div>
    ),
    render: (val: any) => {
      if (val === null || val === undefined) {
        return <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.8rem" }}>NULL</span>;
      }
      if (typeof val === "boolean") {
        return (
          <span
            style={{
              fontSize: "0.75rem",
              padding: "2px 6px",
              borderRadius: "4px",
              background: val ? "#dcfce7" : "#fee2e2",
              color: val ? "#166534" : "#991b1b",
              fontWeight: 600,
            }}
          >
            {val ? "TRUE" : "FALSE"}
          </span>
        );
      }
      return String(val);
    },
  }));

  return (
    <div style={{ width: "100%", height: "100%", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Table
        striped
        bordered
        hoverable
        size="sm"
        loading={loading}
        columns={columns}
        data={rows}
        emptyText={`No records found in table "${activeTable.schema}.${activeTable.name}"`}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
