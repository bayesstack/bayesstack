import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

function WelcomeLanding() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAFCFC",
        fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
        color: "#123333",
        padding: "72px 40px 100px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Background Glow */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(11, 103, 99, 0.07) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 880, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Navigation / Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            marginBottom: 48,
            paddingBottom: 24,
            borderBottom: "1px solid #E2ECE9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginRight: "auto" }}>
            <img
              src="/brand/logo-primary.svg"
              alt="BayesStack Logo"
              style={{ height: 18, width: "auto", objectFit: "contain" }}
              onError={(e) => {
                // Fallback SVG mark if image fails to load
                e.currentTarget.style.display = "none";
              }}
            />
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "1px",
                color: "#123333",
                textTransform: "uppercase",
              }}
            >
              BayesStack
            </span>
            <span style={{ color: "#CBD5E1", fontSize: 14 }}>/</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#0B6763",
              }}
            >
              UI Studio
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 24 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 20,
                background: "#E4F2EF",
                color: "#0B6763",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#0B6763",
                  boxShadow: "0 0 6px #0B6763",
                }}
              />
              Internal Monorepo Package
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ marginBottom: 56 }}>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 4.5vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              margin: "0 0 20px",
              color: "#123333",
            }}
          >
            Design system for <br />
            <span
              style={{
                background: "linear-gradient(135deg, #0B6763 0%, #178A84 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              intelligent web applications.
            </span>
          </h1>

          <p
            style={{
              fontSize: 19,
              lineHeight: 1.65,
              color: "#59716E",
              maxWidth: 720,
              margin: 0,
            }}
          >
            The foundational component library powering BayesStack studios and applications. Built on a 4-tier atomic design methodology, token-based CSS variables, polymorphic React APIs, and rigorous accessibility standards.
          </p>
        </div>

        {/* 4-Tier Blueprint Spectrum */}
        <div style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "#0B6763",
              margin: "0 0 24px",
            }}
          >
            4-Tier Component Blueprint
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Tier 1: Atoms */}
            <div style={{ padding: "20px 24px", borderRadius: 14, background: "#FFFFFF", border: "1px solid #E2ECE9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ maxWidth: 520 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#0B6763", textTransform: "uppercase" }}>Tier 1</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#123333" }}>Atoms</span>
                  <span style={{ padding: "2px 8px", borderRadius: 10, background: "#E4F2EF", color: "#0B6763", fontSize: 11, fontWeight: 700 }}>Wave 1 Priority</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#59716E" }}>
                  Foundational UI primitives: Text, Title, Paragraph, Button, IconButton, TextInput, Checkbox, Radio, Switch, Badge, Alert, Skeleton, Box.
                </p>
              </div>
              <code style={{ fontSize: 12, color: "#0B6763", fontFamily: '"JetBrains Mono", monospace', background: "#F1F8F6", padding: "6px 12px", borderRadius: 6 }}>
                packages/ui/src/atoms
              </code>
            </div>

            {/* Tier 2: Molecules */}
            <div style={{ padding: "20px 24px", borderRadius: 14, background: "#FFFFFF", border: "1px solid #E2ECE9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ maxWidth: 520 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#59716E", textTransform: "uppercase" }}>Tier 2</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#123333" }}>Molecules</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#59716E" }}>
                  Composite input groups & pickers: Select, MultiSelect, DatePicker, Autocomplete, Popover, Popconfirm, Menu, Tabs, RadioGroup.
                </p>
              </div>
              <code style={{ fontSize: 12, color: "#59716E", fontFamily: '"JetBrains Mono", monospace', background: "#F8FAFC", padding: "6px 12px", borderRadius: 6 }}>
                packages/ui/src/molecules
              </code>
            </div>

            {/* Tier 3: Organisms */}
            <div style={{ padding: "20px 24px", borderRadius: 14, background: "#FFFFFF", border: "1px solid #E2ECE9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ maxWidth: 520 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#59716E", textTransform: "uppercase" }}>Tier 3</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#123333" }}>Organisms</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#59716E" }}>
                  Complex functional sections & data views: Enterprise Tables, Tree Views, Dual-List Transfer, Modals, Drawers, Code Editors.
                </p>
              </div>
              <code style={{ fontSize: 12, color: "#59716E", fontFamily: '"JetBrains Mono", monospace', background: "#F8FAFC", padding: "6px 12px", borderRadius: 6 }}>
                packages/ui/src/organisms
              </code>
            </div>

            {/* Tier 4: Layouts & Templates */}
            <div style={{ padding: "20px 24px", borderRadius: 14, background: "#FFFFFF", border: "1px solid #E2ECE9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ maxWidth: 520 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#59716E", textTransform: "uppercase" }}>Tier 4</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#123333" }}>Layouts & Templates</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#59716E" }}>
                  Structural scaffolds & full application containers: Page Containers, Page Headers, Resizable Splitters, and Full Application Shells.
                </p>
              </div>
              <code style={{ fontSize: 12, color: "#59716E", fontFamily: '"JetBrains Mono", monospace', background: "#F8FAFC", padding: "6px 12px", borderRadius: 6 }}>
                packages/ui/src/layouts
              </code>
            </div>
          </div>
        </div>

        {/* Typography Multi-Typeface Matrix */}
        <div style={{ padding: 32, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E2ECE9", boxShadow: "0 4px 14px rgba(0,0,0,0.02)" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#123333" }}>
            Typography & Typeface System
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "#59716E" }}>
            Curated typography matrix supporting distinct functional and expressive roles across BayesStack.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
            <div style={{ padding: 16, borderRadius: 10, background: "#F8FCFB", border: "1px solid #E4F2EF" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#59716E", textTransform: "uppercase", marginBottom: 4 }}>Primary Interface</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0B6763", fontFamily: '"Outfit", sans-serif' }}>Outfit</div>
              <div style={{ fontSize: 12, color: "#59716E", marginTop: 4 }}>Geometric Sans-Serif</div>
            </div>

            <div style={{ padding: 16, borderRadius: 10, background: "#F8FCFB", border: "1px solid #E4F2EF" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#59716E", textTransform: "uppercase", marginBottom: 4 }}>Academic & Editorial</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0B6763", fontFamily: '"EB Garamond", serif' }}>EB Garamond</div>
              <div style={{ fontSize: 12, color: "#59716E", marginTop: 4 }}>Classic Serif</div>
            </div>

            <div style={{ padding: 16, borderRadius: 10, background: "#F8FCFB", border: "1px solid #E4F2EF" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#59716E", textTransform: "uppercase", marginBottom: 4 }}>Cursive & Notes</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0B6763", fontFamily: '"Cedarville Cursive", cursive' }}>Cedarville Cursive</div>
              <div style={{ fontSize: 12, color: "#59716E", marginTop: 4 }}>Handwritten Script</div>
            </div>

            <div style={{ padding: 16, borderRadius: 10, background: "#F8FCFB", border: "1px solid #E4F2EF" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#59716E", textTransform: "uppercase", marginBottom: 4 }}>Code & Tabular</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0B6763", fontFamily: '"JetBrains Mono", monospace' }}>JetBrains Mono</div>
              <div style={{ fontSize: 12, color: "#59716E", marginTop: 4 }}>Monospaced Typeface</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Welcome",
  component: WelcomeLanding,
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof WelcomeLanding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Introduction: Story = {};
