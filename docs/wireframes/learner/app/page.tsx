"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Icon, Logo, Sidebar, Spotlight, Tooltip, type SidebarItem } from "@bayesstack/ui";
import { LearningExperience, type LearningActivityId, type LearningView } from "./learning/LearningExperience";
import { useLearnerShellState } from "./learner-shell-state";

const navigationItems: SidebarItem[] = [
  { id: "home", label: "Home", icon: "Home", href: "/" },
  { id: "learning", label: "Learning", icon: "BookOpen", href: "/learning", badge: <span className="learner-nav-badge learner-nav-badge--teal">3 active</span> },
  { id: "labs", label: "Labs", icon: "CheckCircle", href: "/labs", badge: <span className="learner-nav-badge learner-nav-badge--rose">1 due</span> },
  { id: "projects", label: "Projects", icon: "Folder", href: "/projects" },
  { id: "discussions", label: "Discussions", icon: "Comment", href: "/discussions" },
  { id: "calendar", label: "Calendar", icon: "Calendar", href: "/calendar" },
  { id: "progress", label: "Progress", icon: "ChartLine", href: "/progress" },
];

const secondaryItems: SidebarItem[] = [{ id: "help", label: "Help", icon: "HelpCircle", href: "/help" }];

const routeToId: Record<string, string> = {
  "/": "home",
  "/learning": "learning",
  "/labs": "labs",
  "/tasks": "labs",
  "/projects": "projects",
  "/discussions": "discussions",
  "/calendar": "calendar",
  "/progress": "progress",
  "/help": "help",
  "/profile": "profile",
};

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

function LearnerBrand({ collapsed, onSearch }: { collapsed: boolean; onSearch: () => void }) {
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcutLabel("⌘ K");
  }, []);

  return (
    <div
      className={`learner-brand-lockup ${collapsed ? "is-collapsed" : ""}`}
      title="Veermata Jijabai Technological Institute · Learner Studio"
    >
      <div className="learner-brand-row">
      <Logo
        variant="full"
        theme="dark"
        size="md"
        title="Veermata Jijabai Technological Institute"
        subtitle={<span>Learner Studio <span className="learner-brand-dot">/</span> <span className="learner-brand-platform">BayesStack</span></span>}
        mark={<TenantMark />}
      />
      </div>
      <CollapsedRailTooltip collapsed={collapsed} content="Search">
        <button type="button" className="learner-search-trigger" onClick={onSearch} aria-label="Open search">
          <Icon name="Search" size="sm" />
          <span className="learner-search-label">Search</span>
          <kbd>{shortcutLabel}</kbd>
        </button>
      </CollapsedRailTooltip>
    </div>
  );
}

function LearnerProfile({ active, collapsed, onNavigate }: { active: boolean; collapsed: boolean; onNavigate: (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <a
      href="/profile"
      onClick={onNavigate}
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
  const router = useRouter();
  const { sidebarPreference, setSidebarPreference } = useLearnerShellState();
  const activeId = routeToId[pathname] || "home";
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [learningView, setLearningView] = useState<LearningView>("overview");
  const [learningActivity, setLearningActivity] = useState<LearningActivityId>("video-learning");

  useEffect(() => {
    if (activeId !== "learning") {
      setLearningView("overview");
    }
  }, [activeId]);

  const collapsed = sidebarPreference === "collapsed";

  const handleCollapseChange = (nextCollapsed: boolean) => {
    setSidebarPreference(nextCollapsed ? "collapsed" : "expanded");
  };

  const handleRouteNavigation = (event: React.MouseEvent<HTMLAnchorElement>, item: SidebarItem) => {
    if (!item.href || item.external || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.push(item.href);
  };

  const routedNavigationItems = navigationItems.map((item) => ({
    ...item,
    onClick: (event: React.MouseEvent) => handleRouteNavigation(event as React.MouseEvent<HTMLAnchorElement>, item),
  }));

  const allItems = [...navigationItems, ...secondaryItems];
  const activeItem = allItems.find((item) => item.id === activeId);
  const activeLabel = activeId === "profile" ? "Profile" : (activeItem?.label || "Home");

  if (activeId === "learning" && learningView === "studio") {
    return <LearningExperience view={learningView} onViewChange={setLearningView} activityId={learningActivity} onActivityChange={setLearningActivity} />;
  }

  return (
    <div className="learner-shell">
      <Sidebar
        className="learner-sidebar"
        items={routedNavigationItems}
        activeId={activeId}
        collapsed={collapsed}
        onCollapseChange={handleCollapseChange}
        collapsible
        collapsedTooltips
        width={280}
        collapsedWidth={70}
        header={<LearnerBrand collapsed={collapsed} onSearch={() => setSpotlightOpen(true)} />}
        footer={
          <div className="learner-sidebar-footer">
            {secondaryItems.map((item) => (
              <CollapsedRailTooltip key={item.id} collapsed={collapsed} content={item.label}>
                <a
                  href={item.href}
                  onClick={(event) => handleRouteNavigation(event, item)}
                  className={`learner-footer-link ${activeId === item.id ? "is-active" : ""}`}
                >
                  <Icon name={item.icon as any} size="md" />
                  <span className="learner-footer-label">{item.label}</span>
                </a>
              </CollapsedRailTooltip>
            ))}
            <CollapsedRailTooltip collapsed={collapsed} content="Profile">
              <LearnerProfile active={activeId === "profile"} collapsed={collapsed} onNavigate={(event) => handleRouteNavigation(event, { id: "profile", label: "Profile", href: "/profile" })} />
            </CollapsedRailTooltip>
          </div>
        }
      />

      <Spotlight
        open={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        onOpen={() => setSpotlightOpen(true)}
        actions={[]}
      />

      <main className="learner-main">
        {activeId === "learning" ? (
          <LearningExperience view={learningView} onViewChange={setLearningView} activityId={learningActivity} onActivityChange={setLearningActivity} />
        ) : (
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
        )}
      </main>
    </div>
  );
}
