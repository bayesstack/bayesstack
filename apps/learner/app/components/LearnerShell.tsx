"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Icon, LoadingBar, Sidebar, Tooltip, type SidebarGroup, type SidebarItem } from "@bayesstack/ui";
import { useLearnerShellState } from "./learner-shell-state";
import { learnerIdentity } from "./learner-identity";

const APP_BASE_PATH = "/learner";
const appRoute = (path: string) => path === "/" ? APP_BASE_PATH : `${APP_BASE_PATH}${path}`;

const navigationGroups: SidebarGroup[] = [
  {
    title: "Workspace",
    items: [
      { id: "home", label: "Home", icon: "Home", href: appRoute("/") },
      { id: "learning", label: "Learning", icon: "BookOpen", href: appRoute("/learning") },
    ],
  },
  {
    title: "Practice",
    items: [
      { id: "labs", label: "Labs", icon: "CheckCircle", href: appRoute("/labs") },
      { id: "projects", label: "Projects", icon: "Folder", href: appRoute("/projects") },
    ],
  },
  {
    title: "Plan & connect",
    items: [
      { id: "discussions", label: "Discussions", icon: "Comment", href: appRoute("/discussions") },
      { id: "calendar", label: "Calendar", icon: "Calendar", href: appRoute("/calendar") },
      { id: "progress", label: "Progress", icon: "ChartLine", href: appRoute("/progress") },
    ],
  },
];

const utilityItems: SidebarItem[] = [
  { id: "help", label: "Support", icon: "HelpCircle", href: appRoute("/help") },
];

const searchableRoutes = [
  { label: "Home", detail: "Your learning action hub", icon: "Home", href: appRoute("/") },
  { label: "Learning", detail: "Courses, concepts, and sessions", icon: "BookOpen", href: appRoute("/learning") },
  { label: "Labs", detail: "Applied practice and lab work", icon: "CheckCircle", href: appRoute("/labs") },
  { label: "Projects", detail: "Project work and feedback", icon: "Folder", href: appRoute("/projects") },
  { label: "Discussions", detail: "Questions and cohort conversations", icon: "Comment", href: appRoute("/discussions") },
  { label: "Calendar", detail: "Sessions and deadlines", icon: "Calendar", href: appRoute("/calendar") },
  { label: "Progress", detail: "Course pace and capability growth", icon: "ChartLine", href: appRoute("/progress") },
  { label: "Support", detail: "Guidance and platform help", icon: "HelpCircle", href: appRoute("/help") },
  { label: "Profile", detail: learnerIdentity.fullName, icon: "User", href: appRoute("/profile") },
];

const prefetchRoutes = ["/learning", "/labs", "/projects", "/discussions", "/calendar", "/progress", "/help", "/profile"];

const routeToId: Record<string, string> = {
  "/": "home",
  "/learning": "learning",
  "/labs": "labs",
  "/projects": "projects",
  "/discussions": "discussions",
  "/calendar": "calendar",
  "/progress": "progress",
  "/help": "help",
  "/profile": "profile",
};

const routeTitles: Record<string, string> = {
  "/": "Home",
  "/learning": "Learning",
  "/labs": "Labs",
  "/projects": "Projects",
  "/discussions": "Discussions",
  "/calendar": "Calendar",
  "/progress": "Progress",
  "/help": "Support",
  "/profile": "Profile",
};

function LearnerBrand({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, href: string) => void }) {
  return (
    <a className="learner-brand" href={appRoute("/")} onClick={(event) => onNavigate(event, appRoute("/"))} aria-label="BayesStack learner home">
      <span className="learner-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M7 9.5 16 5l9 4.5v12L16 27l-9-5.5v-12Z" />
          <path d="m7 9.5 9 5 9-5M16 14.5V27" />
          <circle cx="7" cy="9.5" r="2" fill="currentColor" />
          <circle cx="16" cy="14.5" r="2" fill="currentColor" />
          <circle cx="25" cy="9.5" r="2" fill="currentColor" />
        </svg>
      </span>
      <span className={collapsed ? "learner-brand-copy is-hidden" : "learner-brand-copy"}>
        <strong>BayesStack</strong>
        <small>Learner</small>
      </span>
    </a>
  );
}

function UtilityLink({ item, collapsed, active, onNavigate }: { item: SidebarItem; collapsed: boolean; active: boolean; onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, href: string) => void }) {
  const link = (
    <a className={`learner-utility-link ${active ? "is-active" : ""}`} href={item.href} onClick={(event) => onNavigate(event, item.href!)} aria-current={active ? "page" : undefined}>
      <Icon name={item.icon as any} size="md" />
      <span>{item.label}</span>
    </a>
  );

  return (
    <Tooltip
      content={item.label}
      placement="right"
      className={`learner-sidebar-tooltip ${collapsed ? "" : "learner-sidebar-tooltip--inactive"}`}
    >
      {link}
    </Tooltip>
  );
}

export function LearnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarPreference, setSidebarPreference } = useLearnerShellState();
  const collapsed = sidebarPreference === "collapsed";
  const activeId = routeToId[pathname] ?? "home";
  const routeTitle = routeTitles[pathname] ?? "Workspace";
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [routeProgress, setRouteProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const topbarControlsRef = useRef<HTMLDivElement>(null);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchResults = searchableRoutes.filter((item) =>
    `${item.label} ${item.detail}`.toLowerCase().includes(normalizedSearch),
  ).slice(0, 6);

  useEffect(() => {
    prefetchRoutes.forEach((route) => router.prefetch(route));
  }, [router]);

  useEffect(() => {
    const closeTopbarPanels = (event: MouseEvent) => {
      if (!topbarControlsRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeTopbarPanels);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeTopbarPanels);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!pendingPath || pathname !== pendingPath) return;
    setRouteProgress(100);
    const finishTimer = window.setTimeout(() => {
      setPendingPath(null);
      setRouteProgress(0);
    }, 220);
    return () => window.clearTimeout(finishTimer);
  }, [pathname, pendingPath]);

  useEffect(() => {
    if (!pendingPath) return;
    const advanceTimer = window.setTimeout(() => setRouteProgress(78), 140);
    const safetyTimer = window.setTimeout(() => {
      setRouteProgress(100);
      window.setTimeout(() => {
        setPendingPath(null);
        setRouteProgress(0);
      }, 220);
    }, 8000);
    return () => {
      window.clearTimeout(advanceTimer);
      window.clearTimeout(safetyTimer);
    };
  }, [pendingPath]);

  const navigateToHref = (href: string) => {
    // Next applies `basePath` for client navigation. Anchors retain the public
    // `/learner/...` URL so copy/open-in-new-tab still works as expected.
    const internalPath = href === APP_BASE_PATH ? "/" : href.replace(new RegExp(`^${APP_BASE_PATH}`), "");
    const destination = internalPath || "/";
    setSearchOpen(false);
    setNotificationsOpen(false);
    if (destination === pathname) return;
    setPendingPath(destination);
    setRouteProgress(12);
    router.push(destination);
  };

  const handleRouteNavigation = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateToHref(href);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchResults[0]) {
      setSearchQuery("");
      navigateToHref(searchResults[0].href);
    }
  };

  const routedNavigationGroups = navigationGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      onClick: (event: React.MouseEvent) => handleRouteNavigation(event as React.MouseEvent<HTMLAnchorElement>, item.href!),
    })),
  }));

  return (
    <div className="learner-app-shell" aria-busy={Boolean(pendingPath)}>
      <Sidebar
        className="learner-sidebar"
        variant="dark"
        items={routedNavigationGroups}
        activeId={activeId}
        collapsed={collapsed}
        onCollapseChange={(nextCollapsed) => setSidebarPreference(nextCollapsed ? "collapsed" : "expanded")}
        collapsible
        collapsedTooltips
        preserveCollapsedLayout
        width="var(--learner-sidebar-width)"
        collapsedWidth="var(--learner-sidebar-collapsed-width)"
        header={<LearnerBrand collapsed={collapsed} onNavigate={handleRouteNavigation} />}
        footer={
          <div className="learner-sidebar-footer">
            {utilityItems.map((item) => (
              <UtilityLink key={item.id} item={item} collapsed={collapsed} active={activeId === item.id} onNavigate={handleRouteNavigation} />
            ))}
          </div>
        }
      />
      <div className="learner-canvas">
        {pendingPath && (
          <div className="learner-route-progress" role="status" aria-label="Loading your next workspace">
            <LoadingBar progress={routeProgress} height={3} />
          </div>
        )}
        <header className="learner-app-header">
          <div className="learner-app-location">
            <a href={appRoute("/")} onClick={(event) => handleRouteNavigation(event, appRoute("/"))}>BayesStack</a>
            <Icon name="ChevronRight" size="xs" />
            <strong>{routeTitle}</strong>
          </div>
          <div className="learner-app-actions" ref={topbarControlsRef}>
            <form className="learner-global-search" role="search" onSubmit={handleSearchSubmit}>
              <Icon name="Search" size="sm" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => {
                  setSearchOpen(true);
                  setNotificationsOpen(false);
                }}
                placeholder="Search workspace"
                aria-label="Search learner workspace"
                aria-expanded={searchOpen}
                aria-controls="learner-search-results"
                autoComplete="off"
              />
              {searchOpen && (
                <div className="learner-search-results" id="learner-search-results">
                  <p>{normalizedSearch ? "Search results" : "Quick navigation"}</p>
                  {searchResults.length > 0 ? searchResults.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(event) => {
                        setSearchQuery("");
                        handleRouteNavigation(event, item.href);
                      }}
                    >
                      <Icon name={item.icon} size="sm" />
                      <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                    </a>
                  )) : <span className="learner-search-empty">No workspace destination matches that search.</span>}
                </div>
              )}
            </form>

            <div className="learner-notifications">
              <button
                type="button"
                className="learner-topbar-icon-button"
                aria-label="Open notifications; 1 unread"
                aria-expanded={notificationsOpen}
                aria-controls="learner-notification-panel"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setSearchOpen(false);
                }}
              >
                <Icon name="Bell" size="sm" />
                <span className="learner-notification-dot" aria-hidden="true" />
              </button>
              {notificationsOpen && (
                <div className="learner-notification-panel" id="learner-notification-panel">
                  <div><strong>Notifications</strong><span>1 unread</span></div>
                  <a href={appRoute("/labs")} onClick={(event) => handleRouteNavigation(event, appRoute("/labs"))}>
                    <span className="learner-notification-icon"><Icon name="CheckCircle" size="sm" /></span>
                    <span><strong>Applied practice lab</strong><small>Due tomorrow at 3:30 PM</small></span>
                  </a>
                </div>
              )}
            </div>

            <a
              className={`learner-topbar-profile ${activeId === "profile" ? "is-active" : ""}`}
              href={appRoute("/profile")}
              onClick={(event) => handleRouteNavigation(event, appRoute("/profile"))}
              aria-label={`Open ${learnerIdentity.fullName}'s profile`}
              aria-current={activeId === "profile" ? "page" : undefined}
              title={learnerIdentity.fullName}
            >
              <Avatar name={learnerIdentity.fullName} size="xs" />
            </a>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
