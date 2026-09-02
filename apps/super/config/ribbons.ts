import type { RibbonTab } from "@bayesstack/ui";

export const bayesStackDbRibbonTabs: RibbonTab[] = [
  {
    id: "home",
    label: "Home",
    groups: [
      {
        id: "control",
        label: "Database Control",
        actions: [
          { id: "newTable", label: "New Table", icon: "Add", variant: "primary" },
          { id: "runMigration", label: "Run Migration", icon: "Check" },
          { id: "refreshSchema", label: "Refresh Schema", icon: "Settings" },
        ],
      },
      {
        id: "query",
        label: "SQL Tools",
        actions: [
          { id: "queryEditor", label: "Query Editor", icon: "Code", variant: "primary" },
          { id: "savedQueries", label: "Saved Queries", icon: "Bookmark" },
        ],
      },
    ],
  },
  {
    id: "view",
    label: "View",
    groups: [
      {
        id: "visualizations",
        label: "Schema Diagrams",
        actions: [
          { id: "erDiagram", label: "ER Diagram", icon: "Flowchart", variant: "primary" },
        ],
      },
    ],
  },
];

export const learningLibraryRibbonTabs: RibbonTab[] = [
  {
    id: "templates",
    label: "Master Templates",
    badge: "Library",
    groups: [
      {
        id: "courseMgmt",
        label: "Course Management",
        actions: [
          { id: "newCourse", label: "New Course", icon: "Add", variant: "primary" },
          { id: "importScorm", label: "Import Package", icon: "BookOpen" },
          { id: "duplicateTemplate", label: "Duplicate", icon: "Copy" },
        ],
      },
      {
        id: "publishing",
        label: "Publishing Control",
        actions: [
          { id: "publishTenants", label: "Publish to Tenants", icon: "Check" },
          { id: "unpublish", label: "Unpublish", icon: "Close", variant: "danger" },
          { id: "previewCourse", label: "Preview", icon: "Search" },
        ],
      },
    ],
  },
  {
    id: "assets",
    label: "Content Assets",
    groups: [
      {
        id: "media",
        label: "Media & S3 Storage",
        actions: [
          { id: "uploadAsset", label: "Upload Asset", icon: "Add", variant: "primary" },
          { id: "assetCatalog", label: "Asset Catalog", icon: "BookOpen" },
          { id: "optimizeStorage", label: "Optimize Storage", icon: "Settings" },
        ],
      },
      {
        id: "assessments",
        label: "Assessments",
        actions: [
          { id: "questionBank", label: "Question Bank", icon: "BookOpen" },
          { id: "rubrics", label: "Rubrics & Grading", icon: "Check" },
        ],
      },
    ],
  },
  {
    id: "subscriptions",
    label: "Tenant Subscriptions",
    groups: [
      {
        id: "distribution",
        label: "Distribution",
        actions: [
          { id: "assignTenant", label: "Assign to Tenant", icon: "User" },
          { id: "revokeAccess", label: "Revoke Access", icon: "Close", variant: "danger" },
          { id: "analytics", label: "Usage Analytics", icon: "Settings" },
        ],
      },
    ],
  },
];
