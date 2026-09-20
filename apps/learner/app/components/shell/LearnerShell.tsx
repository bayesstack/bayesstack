"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Badge, Dropdown, Icon, LoadingBar, Sidebar, Tooltip, type DropdownMenuItem, type SidebarGroup, type SidebarItem } from "@bayesstack/ui";
import { useLearnerShellState } from "./state";
import { ROUTE_PROGRESS_START_EVENT } from "./route-progress";
import { learnerIdentity } from "../learning/data";
import { learnerNotifications } from "../workspace/data";

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

const prefetchRoutes = [
  "/learning",
  "/learning/machine-learning",
  "/learning/machine-learning/studio/video",
  "/learning/machine-learning/studio/coding",
  "/labs", "/projects", "/discussions", "/calendar", "/progress", "/help", "/profile",
];

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

type HeaderBreadcrumb = { label: string; href?: string };

function getHeaderBreadcrumbs(pathname: string, routeTitle: string): HeaderBreadcrumb[] {
  const crumbs: HeaderBreadcrumb[] = [{ label: "BayesStack", href: appRoute("/") }];

  if (!pathname.startsWith("/learning")) {
    return [...crumbs, { label: routeTitle }];
  }

  if (pathname === "/learning") {
    return [...crumbs, { label: "Learning" }];
  }

  crumbs.push({ label: "Learning", href: appRoute("/learning") });
  if (pathname === "/learning/machine-learning") {
    return [...crumbs, { label: "Machine Learning" }];
  }

  return [...crumbs, { label: "Machine Learning", href: appRoute("/learning/machine-learning") }, { label: routeTitle }];
}

function LearnerBrand({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, href: string) => void }) {
  return (
    <a className="learner-brand" href={appRoute("/")} onClick={(event) => onNavigate(event, appRoute("/"))} aria-label={`${learnerIdentity.institutionName} learner home`}>
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
        <strong>{learnerIdentity.institutionName}</strong>
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
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const collapsed = isCompactViewport ? !mobileMenuOpen : sidebarPreference === "collapsed";
  const activeId = pathname.startsWith("/learning") ? "learning" : routeToId[pathname] ?? "home";
  const isStudio = pathname.startsWith("/learning/machine-learning/studio/");
  const routeTitle = isStudio ? "Learning studio" : pathname === "/learning/machine-learning" ? "Machine Learning" : routeTitles[pathname] ?? "Workspace";
  const unreadNotifications = learnerNotifications.filter((item) => item.unread);
  const headerBreadcrumbs = getHeaderBreadcrumbs(pathname, routeTitle);
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

  const beginRouteProgress = (destination: string) => {
    if (destination === pathname) return;
    setPendingPath(destination);
    setRouteProgress(12);
  };

  useEffect(() => {
    prefetchRoutes.forEach((route) => router.prefetch(route));
  }, [router]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const syncViewport = () => {
      setIsCompactViewport(media.matches);
      if (!media.matches) setMobileMenuOpen(false);
    };
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

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
        setMobileMenuOpen(false);
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

  useEffect(() => {
    const handleRouteProgress = (event: Event) => {
      const destination = (event as CustomEvent<{ destination?: string }>).detail?.destination;
      if (destination) beginRouteProgress(destination);
    };
    window.addEventListener(ROUTE_PROGRESS_START_EVENT, handleRouteProgress);
    return () => window.removeEventListener(ROUTE_PROGRESS_START_EVENT, handleRouteProgress);
  }, [pathname]);

  const navigateToHref = (href: string) => {
    const internalPath = href === APP_BASE_PATH ? "/" : href.replace(new RegExp(`^${APP_BASE_PATH}`), "");
    const destination = internalPath || "/";
    setSearchOpen(false);
    setNotificationsOpen(false);
    setMobileMenuOpen(false);
    if (destination === pathname) return;
    beginRouteProgress(destination);
    router.push(destination);
  };

  const handleCanvasNavigationIntent = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || destination.pathname === pathname) return;
    beginRouteProgress(destination.pathname);
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

  const profileMenuItems: DropdownMenuItem[] = [
    { key: "profile", label: "Your profile", icon: "User", onClick: () => navigateToHref(appRoute("/profile")) },
    { key: "progress", label: "Progress & capabilities", icon: "ChartLine", onClick: () => navigateToHref(appRoute("/progress")) },
    { key: "calendar", label: "Sessions & schedule", icon: "Calendar", onClick: () => navigateToHref(appRoute("/calendar")) },
    { key: "help", label: "Support & help", icon: "HelpCircle", onClick: () => navigateToHref(appRoute("/help")) },
  ];

  const profileMenuHeader = (
    <button
      type="button"
      className="learner-dropdown-profile-header"
      onClick={() => navigateToHref(appRoute("/profile"))}
      aria-label={`Open profile for ${learnerIdentity.fullName}`}
    >
      <Avatar name={learnerIdentity.fullName} size="sm" />
      <div className="learner-dropdown-profile-meta">
        <strong className="learner-dropdown-profile-name">{learnerIdentity.fullName}</strong>
        <span className="learner-dropdown-profile-role">Learner · View Profile</span>
      </div>
      <Icon name="ChevronRight" size="xs" className="learner-dropdown-profile-chevron" />
    </button>
  );

  return (
    <div className={`learner-app-shell ${isStudio ? "is-learning-studio" : ""}`} aria-busy={Boolean(pendingPath)}>
      {isCompactViewport && mobileMenuOpen && (
        <button className="learner-mobile-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />
      )}
      <Sidebar
        className="learner-sidebar"
        variant="dark"
        items={routedNavigationGroups}
        activeId={activeId}
        collapsed={collapsed}
        onCollapseChange={(nextCollapsed) => {
          if (isCompactViewport) setMobileMenuOpen(!nextCollapsed);
          else setSidebarPreference(nextCollapsed ? "collapsed" : "expanded");
        }}
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
      <div className="learner-canvas" onClickCapture={handleCanvasNavigationIntent}>
        {pendingPath && (
          <div className="learner-route-progress" role="status" aria-label="Loading your next workspace">
            <LoadingBar progress={routeProgress} height={3} />
          </div>
        )}
        <header className="learner-app-header">
          <div className="learner-app-header-inner">
            <nav className="learner-app-location" aria-label="Breadcrumb">
              {headerBreadcrumbs.map((crumb, index) => (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && <Icon name="ChevronRight" size="xs" aria-hidden="true" />}
                  {crumb.href ? (
                    <a href={crumb.href} onClick={(event) => handleRouteNavigation(event, crumb.href!)}>{crumb.label}</a>
                  ) : <strong aria-current="page">{crumb.label}</strong>}
                </React.Fragment>
              ))}
            </nav>
            <div className="learner-app-actions" ref={topbarControlsRef}>
              <form className="learner-global-search" role="search" onSubmit={handleSearchSubmit}>
                <Icon name="Search" size="sm" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => { setSearchOpen(true); setNotificationsOpen(false); }}
                  placeholder="Search workspace..."
                  aria-label="Search learner workspace"
                  aria-expanded={searchOpen}
                  aria-controls="learner-search-results"
                  autoComplete="off"
                />
                {searchOpen && (
                  <div className="learner-search-results" id="learner-search-results">
                    <p>{normalizedSearch ? "Search results" : "Quick navigation"}</p>
                    {searchResults.length > 0 ? searchResults.map((item) => (
                      <a key={item.href} href={item.href} onClick={(event) => { setSearchQuery(""); handleRouteNavigation(event, item.href); }}>
                        <Icon name={item.icon} size="sm" />
                        <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                      </a>
                    )) : <span className="learner-search-empty">No workspace destination matches that search.</span>}
                  </div>
                )}
              </form>

              <div className="learner-notifications">
                <Badge count={unreadNotifications.length} color="danger" variant="solid" size="sm" offset={[0, 4]}>
                  <button
                    type="button"
                    className="learner-topbar-icon-button"
                    aria-label={`Open notifications; ${unreadNotifications.length} unread`}
                    aria-expanded={notificationsOpen}
                    aria-controls="learner-notification-panel"
                    onClick={() => { setNotificationsOpen((open) => !open); setSearchOpen(false); }}
                  >
                    <Icon name="Bell" size="sm" />
                  </button>
                </Badge>
                {notificationsOpen && (
                  <div className="learner-notification-panel" id="learner-notification-panel">
                    <div><strong>Notifications</strong><span>{unreadNotifications.length} unread</span></div>
                    {learnerNotifications.map((item) => {
                      const href = appRoute(item.href);
                      return <a key={item.id} href={href} onClick={(event) => handleRouteNavigation(event, href)}>
                        <span className="learner-notification-icon"><Icon name={item.icon} size="sm" /></span>
                        <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                      </a>;
                    })}
                  </div>
                )}
              </div>

              <Dropdown
                className="learner-profile-dropdown"
                items={profileMenuItems}
                placement="bottomRight"
                trigger="click"
                menuHeader={profileMenuHeader}
                style={{ minWidth: 230 }}
              >
                <button
                  type="button"
                  className={`learner-topbar-profile ${activeId === "profile" ? "is-active" : ""}`}
                  aria-label={`Open account menu for ${learnerIdentity.fullName}`}
                  aria-current={activeId === "profile" ? "page" : undefined}
                  title={learnerIdentity.fullName}
                >
                  <Avatar name={learnerIdentity.fullName} size="sm" />
                </button>
              </Dropdown>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
