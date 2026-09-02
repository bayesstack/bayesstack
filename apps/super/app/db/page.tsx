"use client";

import React, { useState } from "react";
import { Badge, Ribbon, DatabaseWorkspace } from "@bayesstack/ui";
import { SuperAdminLayout } from "../../components/SuperAdminLayout";
import { bayesStackDbRibbonTabs } from "../../config/ribbons";
import { useDatabaseExplorer } from "./hooks/useDatabaseExplorer";
import { TableDataGrid } from "./components/TableDataGrid";
import { SqlQueryConsole } from "./components/SqlQueryConsole";
import {
  DatabasePlaceholdersModal,
  getRibbonPlaceholderModalConfig,
  type ModalConfig,
} from "./components/DatabasePlaceholdersModal";

export default function BayesStackDbPage() {
  const {
    tables,
    openedTableIds,
    selectedTableId,
    dbEngine,
    handleCreateNewQuery,
    handleTabRename,
  } = useDatabaseExplorer();

  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    opened: false,
    title: "",
    description: "",
  });

  const handleRibbonAction = (actionId: string) => {
    if (actionId === "queryEditor") {
      handleCreateNewQuery();
    } else {
      setModalConfig(getRibbonPlaceholderModalConfig(actionId));
    }
  };

  const ribbonHeader = (
    <Ribbon
      key="ribbon-database"
      tabs={bayesStackDbRibbonTabs}
      defaultActiveTabId="home"
      onActionClick={handleRibbonAction}
      extra={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Badge variant="subtle" size="sm">
            {dbEngine.toUpperCase()}
          </Badge>
          <Badge variant="subtle" size="sm">
            BayesStack DB
          </Badge>
        </div>
      }
    />
  );

  return (
    <SuperAdminLayout ribbon={ribbonHeader}>
      <div style={{ width: "100%", height: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
        <DatabaseWorkspace
          tables={tables.length > 0 ? tables : undefined}
          defaultOpenedTableIds={openedTableIds.length > 0 ? openedTableIds : undefined}
          defaultSelectedTableId={selectedTableId || undefined}
          onNewQuery={handleCreateNewQuery}
          onTabRename={handleTabRename}
          style={{ borderRadius: 0, border: "none", borderTop: "1px solid var(--bs-ui-line, #d7e8e4)" }}
        >
          {(activeTable) => {
            if (activeTable?.schema === "sql" || activeTable?.id.startsWith("query-editor")) {
              return <SqlQueryConsole dbEngine={dbEngine} />;
            }
            return <TableDataGrid activeTable={activeTable} />;
          }}
        </DatabaseWorkspace>

        <DatabasePlaceholdersModal
          config={modalConfig}
          onClose={() => setModalConfig((prev) => ({ ...prev, opened: false }))}
        />
      </div>
    </SuperAdminLayout>
  );
}
