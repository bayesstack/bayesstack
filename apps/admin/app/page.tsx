"use client";

import React, { useState } from "react";
import { BayesStackLogo } from "@bayesstack/assets";
import {
  Button,
  Badge,
  Title,
  Text,
  Paper,
  Table,
  Modal,
  Spotlight,
  useToast,
  Icon,
  Avatar,
  type SpotlightActionItem,
} from "@bayesstack/ui";

export default function AdminPage() {
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const { showToast } = useToast();

  const sampleUsers = [
    { id: "USR-101", name: "Dr. Elena Rostova", email: "elena.rostova@bayesstack.edu", role: "Faculty Lead", status: "Active", courses: 4, telemetry: "99.8%" },
    { id: "USR-102", name: "Marcus Vance", email: "marcus.vance@bayesstack.edu", role: "Graduate Student", status: "Active", courses: 6, telemetry: "97.4%" },
    { id: "USR-103", name: "Sophia Chen", email: "sophia.chen@bayesstack.edu", role: "System Admin", status: "Active", courses: 12, telemetry: "100%" },
    { id: "USR-104", name: "Devon Miller", email: "devon.miller@bayesstack.edu", role: "Research Associate", status: "Offline", courses: 2, telemetry: "94.1%" },
    { id: "USR-105", name: "Claire Dupont", email: "claire.dupont@bayesstack.edu", role: "Adjunct Faculty", status: "Active", courses: 3, telemetry: "98.9%" },
  ];

  const tableColumns = [
    { key: "id", header: "User ID", width: 110 },
    { key: "name", header: "Full Name", sortable: true },
    { key: "email", header: "Institutional Email" },
    { key: "role", header: "Assigned Role" },
    {
      key: "status",
      header: "Status",
      render: (val: string) => (
        <Badge variant={val === "Active" ? "solid" : "subtle"} size="sm">
          {val}
        </Badge>
      ),
    },
    { key: "courses", header: "Active Modules", align: "center" as const },
    { key: "telemetry", header: "Telemetry Score", align: "right" as const },
  ];

  const spotlightActions: SpotlightActionItem[] = [
    { id: "1", title: "User Access Control", description: "Manage roles, SAML SSO, and OAuth tokens", group: "Governance", icon: "ShieldCheck" },
    { id: "2", title: "Export System Telemetry Logs", description: "Download JSON/CSV metrics for audit review", group: "Reports", icon: "File" },
    { id: "3", title: "API Gateway Metrics", description: "Inspect rate limits and request latency", group: "Infrastructure", icon: "Database" },
  ];

  const handleExportLogs = () => {
    showToast({
      title: "Telemetry Export Initiated",
      message: "Generating encrypted audit logs package for compliance review.",
      variant: "success",
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bs-canvas)" }}>
      {/* Admin Header Navigation */}
      <header className="admin-header">
        <div className="admin-container admin-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <BayesStackLogo variant="primary" style={{ height: "32px" }} />
            <span style={{ height: "20px", width: "1px", background: "#d7e8e4" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Title as="h3" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#123333" }}>
                Admin Telemetry & Governance Portal
              </Title>
              <Badge variant="subtle" size="sm">
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#0b6763", fontWeight: 600 }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0b6763" }} />
                  All Systems Operational
                </span>
              </Badge>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon name="Search" size={16} color="#0b6763" />}
              onClick={() => setSpotlightOpen(true)}
              style={{ background: "#ffffff" }}
            >
              Search <span style={{ opacity: 0.6, fontSize: "0.75rem", marginLeft: "0.5rem" }}>Cmd+K</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="ShieldCheck" size={16} color="#0b6763" />}
              onClick={() => setSecurityModalOpen(true)}
            >
              Security Settings
            </Button>
            <Avatar name="Sophia Chen" color="#0b6763" size="sm" />
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="admin-container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        {/* Telemetry Metric Scorecards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          <Paper className="admin-stat-card">
            <Text size="sm" style={{ color: "#4a6360", marginBottom: "0.25rem" }}>Total Active Users</Text>
            <Title as="h2" style={{ color: "#123333", fontSize: "1.75rem", fontWeight: 800 }}>1,482</Title>
            <Badge variant="subtle" size="sm" style={{ marginTop: "0.5rem" }}>+12% this month</Badge>
          </Paper>

          <Paper className="admin-stat-card">
            <Text size="sm" style={{ color: "#4a6360", marginBottom: "0.25rem" }}>Platform Uptime</Text>
            <Title as="h2" style={{ color: "#0b6763", fontSize: "1.75rem", fontWeight: 800 }}>99.98%</Title>
            <Badge variant="subtle" size="sm" style={{ marginTop: "0.5rem" }}>SLA Compliant</Badge>
          </Paper>

          <Paper className="admin-stat-card">
            <Text size="sm" style={{ color: "#4a6360", marginBottom: "0.25rem" }}>Daily Telemetry Ingestion</Text>
            <Title as="h2" style={{ color: "#123333", fontSize: "1.75rem", fontWeight: 800 }}>4.2M</Title>
            <Badge variant="subtle" size="sm" style={{ marginTop: "0.5rem" }}>Events / 24h</Badge>
          </Paper>

          <Paper className="admin-stat-card">
            <Text size="sm" style={{ color: "#4a6360", marginBottom: "0.25rem" }}>SOC2 Audit Score</Text>
            <Title as="h2" style={{ color: "#123333", fontSize: "1.75rem", fontWeight: 800 }}>100%</Title>
            <Badge variant="solid" size="sm" style={{ marginTop: "0.5rem" }}>Verified Compliant</Badge>
          </Paper>
        </div>

        {/* User Management & Telemetry Data Grid */}
        <Paper className="admin-stat-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <Title as="h3" style={{ color: "#123333", fontSize: "1.25rem" }}>Institutional User Directory</Title>
              <Text size="sm" style={{ color: "#4a6360", marginTop: "0.25rem" }}>
                Manage user credentials, system role assignments, and real-time engagement telemetry.
              </Text>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Button size="sm" variant="secondary" leftIcon={<Icon name="File" size={14} color="#0b6763" />} onClick={handleExportLogs}>
                Export Logs
              </Button>
              <Button size="sm" variant="primary" leftIcon={<Icon name="Plus" size={14} />}>
                Add User
              </Button>
            </div>
          </div>

          <Table
            data={sampleUsers}
            columns={tableColumns}
            selectable
            hoverable
            striped
          />
        </Paper>
      </main>

      {/* Security Settings Modal */}
      <Modal
        opened={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        title="Security & Governance Settings"
        size="md"
      >
        <div style={{ padding: "0.5rem 0" }}>
          <Text style={{ color: "#4a6360", marginBottom: "1.25rem" }}>
            Configure institutional security policies and tenant access controls:
          </Text>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Paper style={{ padding: "1rem", border: "1px solid #d7e8e4", borderRadius: "8px" }}>
              <Title as="h4" style={{ color: "#123333", fontSize: "0.95rem", marginBottom: "0.25rem" }}>SAML 2.0 Single Sign-On</Title>
              <Text size="sm" style={{ color: "#4a6360" }}>Enforce identity provider authentication for all faculty and administrative staff.</Text>
            </Paper>

            <Paper style={{ padding: "1rem", border: "1px solid #d7e8e4", borderRadius: "8px" }}>
              <Title as="h4" style={{ color: "#123333", fontSize: "0.95rem", marginBottom: "0.25rem" }}>Multi-Tenant Database Isolation</Title>
              <Text size="sm" style={{ color: "#4a6360" }}>Row-level encryption and dedicated tenant schemas enabled.</Text>
            </Paper>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <Button variant="primary" size="sm" onClick={() => setSecurityModalOpen(false)}>Save Settings</Button>
          </div>
        </div>
      </Modal>

      {/* Spotlight Command Overlay */}
      <Spotlight
        open={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        actions={spotlightActions}
        placeholder="Type to search admin tools, audit logs, or system controls..."
      />
    </div>
  );
}
