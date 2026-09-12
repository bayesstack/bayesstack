"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, Icon, Logo, Sidebar, Tooltip, type SidebarItem } from "@bayesstack/ui";

const navigationItems: SidebarItem[] = [
  { id: "home", label: "Home", icon: "Home", href: "/" },
  { id: "learn", label: "Learn", icon: "BookOpen", href: "/learn", badge: <span className="learner-nav-badge learner-nav-badge--teal">3 active</span> },
  { id: "assessments", label: "Assessments", icon: "Quiz", href: "/assessments", badge: <span className="learner-nav-badge learner-nav-badge--rose">1 due</span> },
  { id: "projects", label: "Projects", icon: "Folder", href: "/projects" },
  { id: "community", label: "Community", icon: "UserGroup", href: "/community" },
  { id: "calendar", label: "Calendar", icon: "Calendar", href: "/calendar" },
];

const secondaryItems: SidebarItem[] = [{ id: "help", label: "Help & Docs", icon: "HelpCircle", href: "/help" }];
const SIDEBAR_PREFERENCE_KEY = "bayesstack:learner-sidebar-preference";

const routeToId: Record<string, string> = {
  "/": "home",
  "/learn": "learn",
  "/assessments": "assessments",
  "/projects": "projects",
  "/community": "community",
  "/calendar": "calendar",
  "/help": "help",
  "/profile": "profile",
};

type SidebarPreference = "expanded" | "collapsed";

function TenantMark() {
  return <span className="learner-tenant-mark" aria-hidden="true"><span>A</span><i /></span>;
}

function CollapsedRailTooltip({
  collapsed,
  content,
  children,
}: {
  collapsed: boolean;
  content: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Tooltip
      content={content}
      placement="right"
      disabled={!collapsed}
      className="learner-collapsed-tooltip"
    >
      {children}
    </Tooltip>
  );
}

function LearnerBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={`learner-brand-lockup ${collapsed ? "is-collapsed" : ""}`}
      title="Veermata Jijabai Technological Institute · Learner Studio"
    >
      <Logo
        variant="full"
        theme="dark"
        size="md"
        title="Veermata Jijabai Technological Institute"
        subtitle={<span>Learner Studio <span className="learner-brand-dot">/</span> <span className="learner-brand-platform">BayesStack</span></span>}
        mark={<TenantMark />}
      />
    </div>
  );
}

function LearnerProfile({ active, collapsed }: { active: boolean; collapsed: boolean }) {
  return (
    <a
      href="/profile"
      className={`learner-profile ${active ? "is-active" : ""}`}
      title={collapsed ? "Sarah Connor · Profile" : undefined}
      aria-label="Open Sarah Connor profile"
    >
      <span className="learner-profile-main">
        <Avatar name="Sarah Connor" size="sm" status="online" className="learner-profile-avatar" />
        <span className="learner-profile-copy"><strong>Sarah Connor</strong><span>sarah@bayesstack.edu</span></span>
      </span>
      <Icon name="Sliders" size="sm" className="learner-profile-settings" />
    </a>
  );
}

export default function LearnerPage() {
  const pathname = usePathname();
  const activeId = routeToId[pathname] || "home";
  const [sidebarPreference, setSidebarPreference] = useState<SidebarPreference>("expanded");
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY);
    if (savedPreference === "collapsed" || savedPreference === "expanded") {
      setSidebarPreference(savedPreference);
    }
    setHasLoadedPreference(true);
  }, []);

  useEffect(() => {
    if (hasLoadedPreference) {
      window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, sidebarPreference);
    }
  }, [hasLoadedPreference, sidebarPreference]);

  const collapsed = sidebarPreference === "collapsed";

  const handleCollapseChange = (nextCollapsed: boolean) => {
    setSidebarPreference(nextCollapsed ? "collapsed" : "expanded");
  };

  const allItems = [...navigationItems, ...secondaryItems];
  const activeItem = allItems.find((item) => item.id === activeId);
  const activeLabel = activeId === "profile" ? "Profile" : (activeItem?.label || "Home");

  return (
    <div className="learner-shell">
      <Sidebar
        className="learner-sidebar"
        items={navigationItems}
        activeId={activeId}
        collapsed={collapsed}
        onCollapseChange={handleCollapseChange}
        collapsible
        collapsedTooltips
        width={280}
        collapsedWidth={70}
        header={<LearnerBrand collapsed={collapsed} />}
        footer={
          <div className="learner-sidebar-footer">
            {secondaryItems.map((item) => (
              <CollapsedRailTooltip key={item.id} collapsed={collapsed} content={item.label}>
                <a
                  href={item.href}
                  className={`learner-footer-link ${activeId === item.id ? "is-active" : ""}`}
                >
                  <Icon name={item.icon as any} size="md" />
                  <span className="learner-footer-label">{item.label}</span>
                </a>
              </CollapsedRailTooltip>
            ))}
            <CollapsedRailTooltip collapsed={collapsed} content="Profile">
              <LearnerProfile active={activeId === "profile"} collapsed={collapsed} />
            </CollapsedRailTooltip>
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
