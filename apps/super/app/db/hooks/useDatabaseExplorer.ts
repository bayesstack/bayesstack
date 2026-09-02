import { useState, useEffect } from "react";
import type { DbTable } from "@bayesstack/ui";

export function useDatabaseExplorer() {
  const [tables, setTables] = useState<DbTable[]>([]);
  const [openedTableIds, setOpenedTableIds] = useState<string[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [dbEngine, setDbEngine] = useState<string>("postgresql");
  const [queryCounter, setQueryCounter] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    async function fetchTables() {
      try {
        const response = await fetch(`${apiUrl}/api/super/database/tables`);
        if (!response.ok) {
          throw new Error("Failed to fetch database schema");
        }
        const data = await response.json();
        if (isMounted) {
          const loadedTables: DbTable[] = data.tables || [];
          setTables(loadedTables);
          setDbEngine(data.database_engine || "postgresql");
          if (loadedTables.length > 0) {
            setOpenedTableIds([loadedTables[0].id]);
            setSelectedTableId(loadedTables[0].id);
          }
        }
      } catch (error) {
        console.warn("Backend API not reachable", error);
      }
    }

    fetchTables();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateNewQuery = () => {
    const nextId = queryCounter;
    const newQueryTab: DbTable = {
      id: `query-editor-${nextId}`,
      name: `Query #${nextId}`,
      schema: "sql",
      icon: "Code",
      description: "Interactive SQL query console",
    };

    setQueryCounter((prev) => prev + 1);

    setTables((prev) => {
      const exists = prev.some((t) => t.id === newQueryTab.id);
      if (!exists) return [newQueryTab, ...prev];
      return prev;
    });

    setOpenedTableIds((prev) => {
      if (!prev.includes(newQueryTab.id)) {
        return [...prev, newQueryTab.id];
      }
      return prev;
    });

    setSelectedTableId(newQueryTab.id);
  };

  const handleTabRename = (tabId: string, newTitle: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tabId) {
          return { ...t, name: newTitle };
        }
        return t;
      })
    );
  };

  return {
    tables,
    openedTableIds,
    selectedTableId,
    dbEngine,
    handleCreateNewQuery,
    handleTabRename,
  };
}
