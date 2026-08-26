import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";
import { Button } from "../Buttons/Button";
import { Switch } from "../Inputs/Switch";
import { Badge } from "../Badges/Badge";
import { Avatar } from "../Badges/Avatar";
import { TextInput } from "../Inputs/TextInput";
import { Title } from "../Title/Title";
import { Paragraph } from "../Paragraph/Paragraph";

const meta: Meta<typeof Skeleton> = {
  title: "Atoms/Loading/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    active: { control: { type: "boolean" } },
    loading: { control: { type: "boolean" } },
    round: { control: { type: "boolean" } },
    avatar: { control: { type: "boolean" } },
    title: { control: { type: "boolean" } },
    paragraph: { control: { type: "boolean" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    active: true,
    avatar: true,
    title: true,
    paragraph: true,
    round: false,
  },
  render: (args) => (
    <div style={{ maxWidth: 520, padding: 24, background: "#FFFFFF", borderRadius: 12, border: "1px solid #D7E8E4" }}>
      <Skeleton {...args} />
    </div>
  ),
};

export const Showcase: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 680 }}>
        {/* Top Control Bar */}
        <div style={{ background: "#FFFFFF", padding: "16px 24px", borderRadius: 12, border: "1px solid #D7E8E4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#123333" }}>Interactive Wireframe Transition</div>
            <div style={{ fontSize: 12, color: "#68807D" }}>Toggle state to see seamless transitions between Skeleton placeholders and real rendered components.</div>
          </div>
          <Switch
            checked={loading}
            onChange={(e) => setLoading(e.target.checked)}
            label={loading ? "Loading (Active)" : "Loaded (Ready)"}
          />
        </div>

        {/* 1. Compound Skeleton Card */}
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
          <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#123333" }}>
            1. Compound Skeleton & Content Wrapper
          </h4>
          <Skeleton loading={loading} avatar title paragraph={{ rows: 3 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <Avatar name="BayesStack Studio" size="md" color="primary" />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#123333" }}>
                    BayesStack Neural Engine
                  </h4>
                  <Badge color="primary">V2.0 Active</Badge>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "#59716E", lineHeight: 1.6 }}>
                  High-dimensional probabilistic inference framework running continuous online gradient updates across monorepo compute clusters.
                </p>
                <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                  <Button size="sm">Inspect Logs</Button>
                  <Button size="sm" variant="outline">
                    Metrics
                  </Button>
                </div>
              </div>
            </div>
          </Skeleton>
        </div>

        {/* 2. Sub-Components Showcase (Avatars, Buttons, Inputs, Image Media Box) */}
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
          <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#123333" }}>
            2. Sub-Component Wireframe Primitives
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Avatars & Buttons */}
            <div>
              <div style={{ fontSize: 12, color: "#68807D", fontWeight: 600, marginBottom: 8 }}>Avatars & Buttons</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                {loading ? (
                  <>
                    <Skeleton.Avatar size="sm" />
                    <Skeleton.Avatar size="md" />
                    <Skeleton.Avatar size="lg" />
                    <Skeleton.Button size="sm" />
                    <Skeleton.Button size="md" shape="pill" />
                    <Skeleton.Button size="lg" />
                  </>
                ) : (
                  <>
                    <Avatar name="Alpha" size="sm" />
                    <Avatar name="Beta" size="md" />
                    <Avatar name="Gamma" size="lg" />
                    <Button size="sm">Small Action</Button>
                    <Button size="md" rounded>Pill Button</Button>
                    <Button size="lg">Large Action</Button>
                  </>
                )}
              </div>
            </div>

            {/* Image Placeholder & Form Inputs */}
            <div>
              <div style={{ fontSize: 12, color: "#68807D", fontWeight: 600, marginBottom: 8 }}>Image Media & Form Inputs</div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
                {loading ? (
                  <>
                    <Skeleton.Image width={180} height={120} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 200 }}>
                      <Skeleton.Input size="sm" block />
                      <Skeleton.Input size="md" block />
                      <Skeleton.Input size="lg" block />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ width: 180, height: 120, borderRadius: 10, background: "#E4F2EF", display: "flex", alignItems: "center", justifyContent: "center", color: "#0B6763", fontWeight: 700, fontSize: 13 }}>
                      Loaded Media Preview
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 200 }}>
                      <TextInput size="sm" defaultValue="Small Input Field" />
                      <TextInput size="md" defaultValue="Standard Input Field" />
                      <TextInput size="lg" defaultValue="Large Input Field" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Typography Wireframe */}
            <div>
              <div style={{ fontSize: 12, color: "#68807D", fontWeight: 600, marginBottom: 8 }}>Title & Paragraph Lines</div>
              {loading ? (
                <>
                  <Skeleton.Title width="45%" />
                  <Skeleton.Paragraph rows={3} width={["100%", "92%", "60%"]} />
                </>
              ) : (
                <>
                  <Title as="h4">Enterprise Component Architecture</Title>
                  <Paragraph style={{ margin: 0 }}>
                    Fully polymorphic React UI primitive adhering to strict atomic design guidelines, accessibility standard WAI-ARIA 1.2, and CSS token systems.
                  </Paragraph>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
