import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar, SidebarGroup } from "../Sidebar";
import { Icon } from "../../../atoms/Icons";
import { Badge } from "../../../atoms/Badges";

const meta: Meta<typeof Sidebar> = {
  title: "Molecules/Navigation/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["default", "subtle", "dark"],
    },
    collapsible: {
      control: "boolean",
    },
    collapsed: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleNavigationGroups: SidebarGroup[] = [
  {
    title: "Platform Core",
    items: [
      { id: "dashboard", label: "Dashboard Overview", icon: "Dashboard" },
      {
        id: "curriculum",
        label: "Curriculum Engine",
        icon: "BookOpen",
        badge: <Badge variant="subtle" size="sm">v2.4</Badge>,
        items: [
          { id: "courses", label: "All Courses" },
          { id: "modules", label: "Learning Modules" },
          { id: "latex-lab", label: "LaTeX Formula Editor" },
        ],
      },
      {
        id: "analytics",
        label: "Analytics & Telemetry",
        icon: "BarChart",
        items: [
          { id: "student-metrics", label: "Student Metrics" },
          { id: "cohort-retention", label: "Cohort Retention" },
          { id: "realtime-logs", label: "Realtime Logs" },
        ],
      },
    ],
  },
  {
    title: "Institutional Tenants",
    items: [
      { id: "superadmin", label: "SuperAdmin Studio", icon: "ShieldCheck", badge: <Badge variant="solid" size="sm">Pro</Badge> },
      { id: "tenants", label: "Tenant Directory", icon: "Building" },
      { id: "users", label: "User Management", icon: "UserGroup" },
    ],
  },
  {
    title: "System",
    items: [
      { id: "settings", label: "System Settings", icon: "Settings" },
      { id: "audit-logs", label: "Audit Logs", icon: "FileCode" },
    ],
  },
];

export const Playground: Story = {
  args: {
    items: sampleNavigationGroups,
    defaultActiveId: "dashboard",
    variant: "default",
    collapsible: true,
  },
  render: (args) => (
    <div style={{ height: 680, display: "flex", border: "1px solid #E2E8F0", borderRadius: 12 }}>
      <Sidebar {...args} />
      <div style={{ flex: 1, padding: 32, background: "#F8FAFC" }}>
        <h2 style={{ margin: 0, fontSize: 20, color: "#123333" }}>Main Canvas Content Area</h2>
        <p style={{ color: "#59716E", marginTop: 8 }}>
          Sidebar molecule automatically adjusts canvas dimensions during collapse/expand state transitions.
        </p>
      </div>
    </div>
  ),
};

export const Ex1_GroupedSidebarWithHeaderFooter: Story = {
  name: "01: Enterprise Navigation with Header & Footer Slots",
  render: () => {
    const [activeId, setActiveId] = useState("dashboard");

    const headerSlot = (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: "#0B6763",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          B
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#123333" }}>BayesStack</span>
          <span style={{ fontSize: 11, color: "#64748B" }}>Academic OS</span>
        </div>
      </div>
    );

    const footerSlot = (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#EBF5F5",
            color: "#0B6763",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          SA
        </div>
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#123333", whiteSpace: "nowrap" }}>
            Sagar Admin
          </span>
          <span style={{ fontSize: 11, color: "#64748B", whiteSpace: "nowrap" }}>sagar@bayesstack.com</span>
        </div>
      </div>
    );

    return (
      <div style={{ height: 700, display: "flex", border: "1px solid #E2E8F0", borderRadius: 12 }}>
        <Sidebar
          items={sampleNavigationGroups}
          activeId={activeId}
          onSelect={(id) => setActiveId(id)}
          header={headerSlot}
          footer={footerSlot}
          variant="default"
        />
        <div style={{ flex: 1, padding: 32, background: "#F8FAFC" }}>
          <h3 style={{ margin: 0, color: "#0B6763" }}>Active Route: {activeId}</h3>
          <p style={{ color: "#59716E" }}>
            Clicking sidebar items fires <code>onSelect</code> callback and updates active navigation state.
          </p>
        </div>
      </div>
    );
  },
};

export const Ex2_ThemeVariants: Story = {
  name: "02: Theme Variants (Default, Subtle, Dark)",
  render: () => {
    return (
      <div style={{ display: "flex", gap: 24, height: 600, overflowX: "auto" }}>
        <div style={{ height: "100%", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
          <Sidebar
            items={sampleNavigationGroups}
            defaultActiveId="dashboard"
            variant="default"
            header={<span style={{ fontWeight: 700, color: "#0B6763" }}>Default Light</span>}
          />
        </div>

        <div style={{ height: "100%", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
          <Sidebar
            items={sampleNavigationGroups}
            defaultActiveId="curriculum"
            variant="subtle"
            header={<span style={{ fontWeight: 700, color: "#59716E" }}>Subtle Canvas</span>}
          />
        </div>

        <div style={{ height: "100%", border: "1px solid #1E293B", borderRadius: 12, overflow: "hidden" }}>
          <Sidebar
            items={sampleNavigationGroups}
            defaultActiveId="superadmin"
            variant="dark"
            header={<span style={{ fontWeight: 700, color: "#2DD4BF" }}>Dark Studio</span>}
          />
        </div>
      </div>
    );
  },
};

export const Ex3_CollapsedState: Story = {
  name: "03: Compact Collapsed Sidebar",
  render: () => (
    <div style={{ height: 600, display: "flex", border: "1px solid #E2E8F0", borderRadius: 12 }}>
      <Sidebar
        items={sampleNavigationGroups}
        defaultActiveId="dashboard"
        defaultCollapsed={true}
        header={
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#0B6763", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            B
          </div>
        }
      />
      <div style={{ flex: 1, padding: 32, background: "#F8FAFC" }}>
        <h3 style={{ margin: 0, color: "#123333" }}>Collapsed Sidebar View</h3>
        <p style={{ color: "#59716E" }}>
          In collapsed mode, sidebar collapses to a compact width displaying tooltips on hover.
        </p>
      </div>
    </div>
  ),
};
