"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarGroup,
  Dropdown,
  DropdownMenuItem,
  Logo,
  LoadingBar,
} from "@bayesstack/ui";

interface SuperUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  tenant_slug: string;
  tenant_name: string;
}

const superAdminNavGroups: SidebarGroup[] = [
  {
    title: "Platform Core",
    items: [
      {
        id: "database",
        label: "BayesStack DB",
        icon: "Database",
      },
      {
        id: "library",
        label: "Learning Library",
        icon: "BookOpen",
      },
    ],
  },
];

interface SuperAdminLayoutProps {
  ribbon: React.ReactNode;
  children: React.ReactNode;
}

export function SuperAdminLayout({ ribbon, children }: SuperAdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<SuperUser | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeSection = pathname?.startsWith("/library") ? "library" : "database";

  useEffect(() => {
    setIsMounted(true);
    const authFlag = localStorage.getItem("bayes_super_authenticated") === "true";
    if (!authFlag) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      const storedUser = localStorage.getItem("bayes_super_user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch {
          // ignore parse error
        }
      }
    }
  }, [router]);

  // Turn off top loading bar when route transition completes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handleMouseEnterSidebar = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsSidebarHovered(true);
  };

  const handleMouseLeaveSidebar = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(false);
    }, 150);
  };

  const handleLogout = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsSidebarHovered(false);
    localStorage.removeItem("bayes_super_authenticated");
    localStorage.removeItem("bayes_super_user");
    router.push("/login");
  };

  const handleSelectNav = (id: string) => {
    const targetPath = id === "library" ? "/library" : "/db";
    if (pathname !== targetPath) {
      setIsNavigating(true);
      router.push(targetPath);
    }
  };

  // Prevent flash before hydration & auth check
  if (!isMounted || !isAuthenticated) {
    return null;
  }

  const isSidebarCollapsed = !isSidebarHovered;

  const sidebarHeader = (
    <Logo
      variant="full"
      size="md"
      title="BayesStack"
      badge="SuperAdmin"
      logoSrc="/assets/brand/logo-mark.svg"
      classNames={{
        textGroup: isSidebarCollapsed ? "bs-logo-text-group--collapsed" : "bs-logo-text-group--expanded",
      }}
    />
  );

  const profileMenuItems: DropdownMenuItem[] = [
    {
      key: "superadmin-role",
      type: "group",
      label: currentUser?.full_name || "SuperAdmin User",
    },
    {
      key: "email",
      label: currentUser?.email || "admin@bayesstack.com",
      disabled: true,
    },
    {
      key: "div-1",
      type: "divider",
    },
    {
      key: "system-audit",
      label: "System Audit Logs",
      icon: "Shield",
    },
    {
      key: "security-keys",
      label: "Security & RLS Keys",
      icon: "Key",
    },
    {
      key: "div-2",
      type: "divider",
    },
    {
      key: "logout",
      label: "Sign Out",
      icon: "LogOut",
      onClick: handleLogout,
    },
  ];

  const sidebarFooter = (
    <Dropdown items={profileMenuItems} placement="topRight" trigger="click" style={{ width: "220px" }}>
      <button
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: isSidebarCollapsed ? 0 : "0.75rem",
          justifyContent: isSidebarCollapsed ? "center" : "flex-start",
          width: "100%",
          padding: "0.6rem",
          borderRadius: "8px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bs-color-bg-subtle, #f1f5f9)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            minWidth: "36px",
            borderRadius: "50%",
            background: "var(--bs-ui-brand, #0b6763)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.85rem",
          }}
        >
          {currentUser?.full_name?.charAt(0) || "S"}
        </div>
        <div
          style={{
            display: isSidebarCollapsed ? "none" : "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bs-ink)" }}>
            {currentUser?.full_name || "SuperAdmin User"}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--bs-muted)",
              textOverflow: "ellipsis",
              overflow: "hidden",
              display: "block",
              maxWidth: "100%",
              marginTop: "2px",
            }}
          >
            {currentUser?.email || "admin@bayesstack.com"}
          </span>
        </div>
      </button>
    </Dropdown>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bs-canvas, #f8fafc)" }}>
      {/* Top Route Transition Loading Progress Bar */}
      {isNavigating && (
        <LoadingBar
          height={3}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            borderRadius: 0,
          }}
        />
      )}
      {/* 
        Fixed 64px width rail container in page flex layout.
        The main screen canvas positions statically next to this 64px column and NEVER resizes or shifts.
      */}
      <aside
        style={{
          width: "64px",
          minWidth: "64px",
          position: "relative",
          zIndex: 100,
        }}
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100vh",
            width: isSidebarHovered ? "260px" : "64px",
            transition: "width 0.22s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.22s ease",
            boxShadow: isSidebarHovered ? "4px 0 24px rgba(0, 0, 0, 0.08)" : "none",
            zIndex: 100,
            background: "#ffffff",
            borderRight: "1px solid var(--bs-color-border-subtle, #e2e8f0)",
            overflow: isSidebarHovered ? "visible" : "hidden",
          }}
        >
          <Sidebar
            items={superAdminNavGroups}
            activeId={activeSection}
            onSelect={handleSelectNav}
            collapsed={isSidebarCollapsed}
            collapsible={false}
            variant="default"
            header={sidebarHeader}
            footer={sidebarFooter}
            style={{
              height: "100vh",
              width: "100%",
              borderRight: "none",
            }}
          />
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", minWidth: 0 }}>
        {/* Top Workspace Header Ribbon */}
        <div style={{ position: "sticky", top: 0, zIndex: 90, flexShrink: 0 }}>
          {ribbon}
        </div>

        {/* Clean Workspace Canvas */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
