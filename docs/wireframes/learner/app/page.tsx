"use client";

import React, { useState } from "react";
import { Sidebar, SidebarItem, Logo, Icon } from "@bayesstack/ui";

const navigationItems: SidebarItem[] = [
  {
    id: "home",
    label: "Home",
    icon: "Home",
  },
  {
    id: "learn",
    label: "Learn",
    icon: "BookOpen",
    badge: (
      <span
        style={{
          background: "rgba(11, 103, 99, 0.12)",
          color: "var(--bs-brand-teal)",
          fontSize: "11px",
          fontWeight: 700,
          padding: "2px 7px",
          borderRadius: "10px",
        }}
      >
        3 active
      </span>
    ),
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: "Quiz",
    badge: (
      <span
        style={{
          background: "rgba(225, 29, 72, 0.1)",
          color: "#e11d48",
          fontSize: "11px",
          fontWeight: 700,
          padding: "2px 7px",
          borderRadius: "10px",
        }}
      >
        1 due
      </span>
    ),
  },
  {
    id: "projects",
    label: "Projects",
    icon: "Folder",
  },
  {
    id: "community",
    label: "Community",
    icon: "UserGroup",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: "Calendar",
  },
];

const secondaryItems: SidebarItem[] = [
  {
    id: "help",
    label: "Help & Docs",
    icon: "HelpCircle",
  },
];

export default function LearnerPage() {
  const [activeId, setActiveId] = useState("home");
  const [collapsed, setCollapsed] = useState(false);

  const allItems = [...navigationItems, ...secondaryItems, { id: "profile", label: "Profile" }];
  const activeItem = allItems.find((item) => item.id === activeId) || { label: "Home" };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bs-canvas)", color: "var(--bs-ink)" }}>
      {/* Enterprise-Grade Collapsible Sidebar */}
      <Sidebar
        items={navigationItems}
        activeId={activeId}
        onSelect={(id) => setActiveId(id)}
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
        collapsible={true}
        width={270}
        collapsedWidth={72}
        style={{
          height: "100vh",
          boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
          borderColor: "var(--bs-line)",
          background: "var(--bs-surface)",
        }}
        header={
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              padding: "2px 0",
              overflow: "hidden",
            }}
          >
            <Logo
              variant={collapsed ? "mark" : "full"}
              size="sm"
              title="Apex Institute"
              subtitle={
                <span>
                  Learner Studio <span style={{ opacity: 0.4 }}>•</span>{" "}
                  <span style={{ color: "var(--bs-brand-teal)", fontWeight: 600 }}>BayesStack</span>
                </span>
              }
              badge="ENTERPRISE"
              mark={
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    background: "linear-gradient(135deg, #0b6763 0%, #084c49 100%)",
                    color: "#ffffff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "11.5px",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                    boxShadow: "0 2px 6px rgba(11, 103, 99, 0.25)",
                    flexShrink: 0,
                  }}
                  title={collapsed ? "Apex Institute of Tech — Learner Studio (BayesStack)" : undefined}
                >
                  AI
                </div>
              }
            />
          </div>
        }
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
            {/* Help & Support link */}
            {secondaryItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  title={collapsed ? (item.label as string) : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: isActive ? "var(--bs-brand-soft)" : "transparent",
                    color: isActive ? "var(--bs-brand-teal)" : "var(--bs-muted)",
                    fontWeight: isActive ? 600 : 500,
                    cursor: "pointer",
                    fontSize: "13.5px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon name={item.icon as any} size="md" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}

            {/* User Profile Card */}
            <div
              onClick={() => setActiveId("profile")}
              title={collapsed ? "Sarah Connor (sarah@bayesstack.edu)" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: collapsed ? "8px 0" : "8px 10px",
                borderRadius: "10px",
                background: activeId === "profile" ? "var(--bs-brand-soft)" : "rgba(11, 103, 99, 0.04)",
                border: activeId === "profile" ? "1px solid var(--bs-brand-teal)" : "1px solid var(--bs-line)",
                cursor: "pointer",
                justifyContent: collapsed ? "center" : "space-between",
                marginTop: "4px",
                transition: "all 0.18s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Avatar with active indicator dot */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0b6763 0%, #084c49 100%)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      boxShadow: "0 2px 6px rgba(11, 103, 99, 0.25)",
                    }}
                  >
                    SC
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      border: "2px solid #ffffff",
                    }}
                  />
                </div>

                {!collapsed && (
                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", textAlign: "left" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--bs-ink)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      Sarah Connor
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--bs-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      sarah@bayesstack.edu
                    </span>
                  </div>
                )}
              </div>

              {!collapsed && (
                <div style={{ color: "var(--bs-muted)", display: "flex", alignItems: "center" }}>
                  <Icon name="Sliders" size="sm" />
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* Main Content Viewport */}
      <main style={{ flex: 1, height: "100vh", padding: "36px 40px", overflowY: "auto" }}>
        {/* Top Breadcrumb & Status Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--bs-muted)", marginBottom: "4px" }}>
              <span>Learner Workspace</span>
              <span>/</span>
              <span style={{ color: "var(--bs-brand-teal)", fontWeight: 600 }}>{activeItem?.label}</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.03em", color: "var(--bs-ink)" }}>
              {activeItem?.label}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                background: "var(--bs-surface)",
                border: "1px solid var(--bs-line)",
                borderRadius: "20px",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "var(--bs-muted)",
              }}
            >
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
              Workspace Synced
            </div>
          </div>
        </div>

        {/* Content Card Canvas */}
        <div
          style={{
            background: "var(--bs-surface)",
            border: "1px solid var(--bs-line)",
            borderRadius: "14px",
            padding: "32px",
            minHeight: "440px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 16px -4px rgba(11, 103, 99, 0.03)",
          }}
        >
          <p style={{ color: "var(--bs-muted)", fontSize: "15px", lineHeight: "1.6" }}>
            This is the production-grade wireframe canvas for <strong>{activeItem?.label}</strong>.
          </p>
        </div>
      </main>
    </div>
  );
}
