"use client";

import React, { useState } from "react";
import { Avatar, Icon, Logo, Sidebar, type SidebarItem } from "@bayesstack/ui";

const navigationItems: SidebarItem[] = [
  { id: "home", label: "Home", icon: "Home" },
  { id: "learn", label: "Learn", icon: "BookOpen", badge: <span className="learner-nav-badge learner-nav-badge--teal">3 active</span> },
  { id: "assessments", label: "Assessments", icon: "Quiz", badge: <span className="learner-nav-badge learner-nav-badge--rose">1 due</span> },
  { id: "projects", label: "Projects", icon: "Folder" },
  { id: "community", label: "Community", icon: "UserGroup" },
  { id: "calendar", label: "Calendar", icon: "Calendar" },
];

const secondaryItems: SidebarItem[] = [{ id: "help", label: "Help & Docs", icon: "HelpCircle" }];

function TenantMark() {
  return <span className="learner-tenant-mark" aria-hidden="true"><span>A</span><i /></span>;
}

function LearnerBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`learner-brand-lockup ${collapsed ? "is-collapsed" : ""}`}>
      <Logo
        variant="full"
        size="sm"
        title="Veermata Jijabai Technological Institute"
        subtitle={<span>Learner Studio <span className="learner-brand-dot">/</span> <span className="learner-brand-platform">BayesStack</span></span>}
        mark={<TenantMark />}
      />
    </div>
  );
}

function LearnerProfile({ active, collapsed, onSelect }: { active: boolean; collapsed: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={`learner-profile ${active ? "is-active" : ""}`}
      onClick={onSelect}
      title={collapsed ? "Sarah Connor · Profile" : undefined}
      aria-label="Open Sarah Connor profile"
    >
      <span className="learner-profile-main">
        <Avatar name="Sarah Connor" size="sm" status="online" className="learner-profile-avatar" />
        <span className="learner-profile-copy"><strong>Sarah Connor</strong><span>sarah@bayesstack.edu</span></span>
      </span>
      <Icon name="Sliders" size="sm" className="learner-profile-settings" />
    </button>
  );
}

export default function LearnerPage() {
  const [activeId, setActiveId] = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const allItems = [...navigationItems, ...secondaryItems];
  const activeItem = allItems.find((item) => item.id === activeId);
  const activeLabel = activeId === "profile" ? "Profile" : (activeItem?.label || "Home");

  return (
    <div className="learner-shell">
      <Sidebar
        className="learner-sidebar"
        items={[{ items: navigationItems }]}
        activeId={activeId}
        onSelect={(id) => setActiveId(id)}
        defaultCollapsed={false}
        onCollapseChange={setCollapsed}
        collapsible
        width={260}
        collapsedWidth={70}
        header={<LearnerBrand collapsed={collapsed} />}
        footer={
          <div className="learner-sidebar-footer">
            {secondaryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`learner-footer-link ${activeId === item.id ? "is-active" : ""}`}
                onClick={() => setActiveId(item.id)}
                title={collapsed ? String(item.label) : undefined}
              >
                <Icon name={item.icon as any} size="md" />
                <span className="learner-footer-label">{item.label}</span>
              </button>
            ))}
            <LearnerProfile active={activeId === "profile"} collapsed={collapsed} onSelect={() => setActiveId("profile")} />
          </div>
        }
      />

      <main className="learner-main">
        <header className="learner-topbar">
          <div className="learner-topbar-context"><span className="learner-context-kicker">Veermata Jijabai Technological Institute</span><span className="learner-context-separator">/</span><span className="learner-context-current">{activeLabel}</span></div>
          <div className="learner-topbar-actions"><span className="learner-sync-status"><span /> Synced just now</span><button type="button" className="learner-notification-button" aria-label="View notifications"><Icon name="Bell" size="sm" /><span className="learner-notification-dot" /></button></div>
        </header>

        <section className="learner-content" aria-labelledby="learner-page-title">
          <div className="learner-page-heading">
            <div><p className="learner-eyebrow">Learner workspace</p><h1 id="learner-page-title">{activeLabel}</h1><p className="learner-page-description">Your academic work, designed around the way you learn.</p></div>
            <div className="learner-term-chip"><span className="learner-term-chip-dot" /><span><strong>Spring 2026</strong><small>Current term</small></span><Icon name="ChevronDown" size="xs" /></div>
          </div>

          <div className="learner-shell-card">
            <div className="learner-card-intro"><span className="learner-card-icon"><Icon name="Sparkles" size="md" /></span><div><span className="learner-card-kicker">Your workspace is ready</span><h2>A calm place to make progress.</h2><p>This shell is the starting point for your courses, assessments, projects, and campus community.</p></div></div>
            <div className="learner-card-meta"><span><Icon name="ShieldCheck" size="sm" /> Secure institutional session</span><span><Icon name="Clock" size="sm" /> Last activity today</span></div>
          </div>
        </section>
      </main>
    </div>
  );
}
