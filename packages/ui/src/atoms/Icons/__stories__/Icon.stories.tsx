import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from ".././Icon";
import { ICON_CATALOGUE, ICON_CATEGORIES } from ".././icons";

const meta: Meta<typeof Icon> = {
  title: "Atoms/Icons/Icon",
  component: Icon,
  parameters: {
    layout: "padded",
    controls: {
      include: ["name", "size", "color", "strokeWidth", "interactive"],
    },
    docs: {
      description: {
        component:
          "Icon Atom primitive powered by Hugeicons (Free Stroke Rounded set). Clean, enterprise-grade icons with customizable size, stroke width, and colors.",
      },
    },
  },
  argTypes: {
    name: {
      control: { type: "text" },
      description: "Icon name string (refer to Icon Library story)",
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl", 16, 20, 24, 32, 48],
      description: "Icon size scale or explicit pixel number",
    },
    color: {
      control: { type: "color" },
      description: "Icon stroke/fill color",
    },
    strokeWidth: {
      control: { type: "number", min: 1, max: 3, step: 0.25 },
      description: "Stroke width for outline path",
    },
    interactive: {
      control: { type: "boolean" },
      description: "Interactive hover style",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Interactive Single Icon Playground (No code block, string input control for name)
export const Playground: Story = {
  args: {
    name: "BookOpen",
    size: "lg",
    color: "#0B6763",
    strokeWidth: 1.75,
    interactive: false,
  },
  render: (args) => (
    <div style={{ padding: 24, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
      <Icon {...args} />
    </div>
  ),
};

// 2. Comprehensive Searchable & Filterable Icon Library Gallery
export const IconLibrary: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [copiedName, setCopiedName] = useState<string | null>(null);

    const filteredIcons = ICON_CATALOGUE.filter((icon) => {
      const matchesSearch =
        search === "" ||
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        icon.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        activeCategory === "All" || icon.category === activeCategory;

      return matchesSearch && matchesCategory;
    });

    const handleCopy = (name: string) => {
      const code = `<Icon name="${name}" />`;
      navigator.clipboard.writeText(code);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 2000);
    };

    return (
      <div style={{ fontFamily: "Outfit, Inter, sans-serif", padding: "12px 16px", maxWidth: 1150, margin: "0 auto" }}>
        {/* Search & Category Filter Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          {/* Search Input */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Search icons across all categories (e.g. 'book', 'chart', 'ai', 'user', 'search')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                fontSize: 14,
                borderRadius: 8,
                border: "1px solid #D7E8E4",
                outline: "none",
                backgroundColor: "#FFFFFF",
                boxSizing: "border-box",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0B6763")}
              onBlur={(e) => (e.target.style.borderColor = "#D7E8E4")}
            />
            <div style={{ position: "absolute", left: 14, top: 13, color: "#4A6360" }}>
              <Icon name="Search" size={18} />
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 14,
                  top: 12,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#4A6360",
                }}
              >
                <Icon name="Close" size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["All", ...ICON_CATEGORIES].map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 20,
                    border: isActive ? "1px solid #0B6763" : "1px solid #D7E8E4",
                    backgroundColor: isActive ? "#0B6763" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : "#123333",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Copy Feedback */}
        <div style={{ fontSize: 13, color: "#4A6360", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Showing <strong>{filteredIcons.length}</strong> of {ICON_CATALOGUE.length} icons</span>
          {copiedName && (
            <span style={{ color: "#0B6763", fontWeight: 600, fontSize: 13 }}>
              ✓ Copied <code>{`<Icon name="${copiedName}" />`}</code>
            </span>
          )}
        </div>

        {/* Icon Grid Cards (Clean: Visual Icon + Name only) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 150px))",
            gap: 12,
            alignItems: "stretch",
          }}
        >
          {filteredIcons.map((iconDef) => {
            const isJustCopied = copiedName === iconDef.name;
            return (
              <div
                key={iconDef.name}
                onClick={() => handleCopy(iconDef.name)}
                title={`Click to copy: <Icon name="${iconDef.name}" />`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px 12px",
                  backgroundColor: isJustCopied ? "#E4F2EF" : "#FFFFFF",
                  border: isJustCopied ? "1.5px solid #0B6763" : "1px solid #E2ECEB",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  textAlign: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
                onMouseEnter={(e) => {
                  if (!isJustCopied) {
                    e.currentTarget.style.borderColor = "#0B6763";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(11,103,99,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isJustCopied) {
                    e.currentTarget.style.borderColor = "#E2ECEB";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
                  }
                }}
              >
                <div style={{ marginBottom: 8, color: isJustCopied ? "#0B6763" : "#123333" }}>
                  <Icon name={iconDef.name as any} size={28} strokeWidth={1.75} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#123333", wordBreak: "break-word" }}>
                  {iconDef.name}
                </span>
              </div>
            );
          })}
        </div>

        {filteredIcons.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#4A6360" }}>
            <Icon name="Search" size={32} />
            <p style={{ marginTop: 12, fontSize: 15 }}>No icons found matching "{search}"</p>
          </div>
        )}
      </div>
    );
  },
};
