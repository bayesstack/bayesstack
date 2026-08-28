import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider, type SliderValue } from "../Slider";

const meta: Meta<typeof Slider> = {
  title: "Atoms/Inputs/Slider",
  component: Slider,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    min: { control: { type: "number" }, description: "Minimum bound" },
    max: { control: { type: "number" }, description: "Maximum bound" },
    step: { control: { type: "number" }, description: "Step granularity (pass null for mark-only snapping)" },
    range: { control: { type: "boolean" }, description: "Dual range handle mode" },
    vertical: { control: { type: "boolean" }, description: "Vertical layout slider" },
    showTooltip: {
      control: { type: "select" },
      options: [true, false, "always"],
      description: "Floating tooltip bubble display mode",
    },
    disabled: { control: { type: "boolean" }, description: "Disables interaction" },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
    range: false,
    showTooltip: true,
    disabled: false,
    wrapperStyle: { maxWidth: 440 },
  },
  render: (args) => {
    const [val, setVal] = useState<SliderValue>(args.range ? [20, 80] : 42);

    useEffect(() => {
      setVal(args.range ? [20, 80] : 42);
    }, [args.range]);

    return (
      <div style={{ padding: "20px 10px" }}>
        <Slider
          {...args}
          value={val}
          onChange={(v) => setVal(v)}
          tooltipFormatter={(v) => `${v}%`}
        />
        <div style={{ marginTop: 24, fontSize: 13, color: "#4A6360", fontWeight: 600 }}>
          Current Value: <span style={{ color: "#0B6763" }}>{JSON.stringify(val)}</span>
        </div>
      </div>
    );
  },
};

export const Ex1_StandardShowcase: Story = {
  name: "01: Slider Forms Showcase",
  render: () => {
    const [volume, setVolume] = useState<SliderValue>(75);
    const [priceRange, setPriceRange] = useState<SliderValue>([100, 400]);
    const [rating, setRating] = useState<SliderValue>(3);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 48, maxWidth: 600, padding: "20px 10px" }}>
        {/* Card 1: Standard Volume Control */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2ECEB", borderRadius: 12, padding: "24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#123333" }}>System Volume</span>
            <span style={{ fontSize: 13, color: "#0B6763", fontWeight: 700 }}>{volume}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={volume}
            onChange={(v) => setVolume(v)}
            tooltipFormatter={(v) => `${v}%`}
          />
        </div>

        {/* Card 2: Price Range Filter */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2ECEB", borderRadius: 12, padding: "24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#123333" }}>Price Filter</span>
            <span style={{ fontSize: 13, color: "#0B6763", fontWeight: 700 }}>
              ${(priceRange as number[])[0]} - ${(priceRange as number[])[1]}
            </span>
          </div>
          <Slider
            range
            min={0}
            max={1000}
            step={10}
            value={priceRange}
            onChange={(v) => setPriceRange(v)}
            tooltipFormatter={(v) => `$${v}`}
          />
        </div>

        {/* Card 3: Snapping Ratings */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2ECEB", borderRadius: 12, padding: "24px 32px 48px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#123333" }}>Customer Satisfaction</span>
            <span style={{ fontSize: 13, color: "#0B6763", fontWeight: 700 }}>{rating} / 5</span>
          </div>
          <Slider
            min={1}
            max={5}
            step={null}
            value={rating}
            onChange={(v) => setRating(v)}
            marks={{
              1: "Poor",
              2: "Fair",
              3: "Good",
              4: "Great",
              5: "Excellent"
            }}
          />
        </div>
      </div>
    );
  }
};
