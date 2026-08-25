import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider, type SliderValue } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Atoms/Inputs/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Enterprise Slider primitive component inspired by Ant Design, supporting single/dual range handles, discrete step marks, custom tooltip formatters, and vertical orientations with minimal clean props.",
      },
    },
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
    wrapperStyle: {
      control: "object",
      description: "Inline CSS styles applied to root container (e.g. width, maxWidth, height)",
      table: { category: "Layout & Container" },
    },
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
        <div style={{ marginTop: 24, fontSize: 13, color: "#68807D", fontWeight: 600 }}>
          Current Value: <span style={{ color: "#0B6763" }}>{JSON.stringify(val)}</span>
        </div>
      </div>
    );
  },
};

export const Showcase: Story = {
  render: () => {
    // 1. Dual Range State
    const [rangeVal, setRangeVal] = useState<SliderValue>([25, 75]);
    // 2. Temperature Marks State
    const [temp, setTemp] = useState<SliderValue>(37);
    // 3. Discrete Snapping State
    const [stepVal, setStepVal] = useState<SliderValue>(50);
    // 4. Equalizer Mixer States
    const [vol1, setVol1] = useState<SliderValue>(70);
    const [vol2, setVol2] = useState<SliderValue>(45);
    const [vol3, setVol3] = useState<SliderValue>([30, 80]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 40, maxWidth: 600, padding: 10 }}>
        {/* Example 1: Dual Range Interval */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2ECEB", borderRadius: 14, padding: 24 }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700, color: "#123333" }}>
            1. Dual Range Price Filter
          </h4>
          <Slider
            range
            min={0}
            max={500}
            step={5}
            value={rangeVal}
            onChange={(v) => setRangeVal(v)}
            tooltipFormatter={(v) => `$${v}`}
          />
          <div style={{ marginTop: 20, fontSize: 13, color: "#68807D" }}>
            Selected Price Interval: <strong style={{ color: "#0B6763" }}>${(rangeVal as number[])[0]} – ${(rangeVal as number[])[1]}</strong>
          </div>
        </div>

        {/* Example 2: Marks and Ticks */}
        <div
          style={{
            padding: "24px 28px 52px 28px",
            background: "#FFFFFF",
            border: "1px solid #E2ECEB",
            borderRadius: 14,
            boxShadow: "0 4px 16px rgba(11, 103, 99, 0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333" }}>
              2. Thermal Control System
            </h4>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                background: "#E6F7F5",
                color: "#0B6763",
              }}
            >
              Target: {temp}°C
            </span>
          </div>

          <Slider
            min={0}
            max={100}
            value={temp}
            onChange={(v) => setTemp(v)}
            marks={{
              0: (
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#1677FF" }}>0°C</div>
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "#E8F4F8", color: "#1677FF", borderRadius: 4, fontWeight: 600, display: "inline-block", marginTop: 3 }}>
                    Freezing
                  </span>
                </div>
              ),
              25: (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#0B6763" }}>25°C</div>
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "#E6F7F5", color: "#0B6763", borderRadius: 4, fontWeight: 600, display: "inline-block", marginTop: 3 }}>
                    Room
                  </span>
                </div>
              ),
              50: (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#D46B08" }}>50°C</div>
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "#FFF7E6", color: "#D46B08", borderRadius: 4, fontWeight: 600, display: "inline-block", marginTop: 3 }}>
                    Warm
                  </span>
                </div>
              ),
              75: (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#CF1322" }}>75°C</div>
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "#FFF1F0", color: "#CF1322", borderRadius: 4, fontWeight: 600, display: "inline-block", marginTop: 3 }}>
                    Hot
                  </span>
                </div>
              ),
              100: (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#D9381E" }}>100°C</div>
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "#FFF0F0", color: "#D9381E", borderRadius: 4, fontWeight: 600, display: "inline-block", marginTop: 3 }}>
                    Boiling
                  </span>
                </div>
              ),
            }}
            tooltipFormatter={(v) => `${v}°C`}
          />
        </div>

        {/* Example 3: Discrete Mark Snapping */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2ECEB", borderRadius: 14, padding: "24px 28px 40px 28px" }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700, color: "#123333" }}>
            3. Strict Mark Snapping (`step={null}`)
          </h4>
          <Slider
            min={0}
            max={100}
            step={null}
            value={stepVal}
            onChange={(v) => setStepVal(v)}
            marks={{
              0: "0%",
              25: "25%",
              50: "50%",
              75: "75%",
              100: "100%",
            }}
          />
        </div>

        {/* Example 4: Vertical Orientation Equalizer */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2ECEB", borderRadius: 14, padding: 24 }}>
          <h4 style={{ margin: "0 0 20px 0", fontSize: 14, fontWeight: 700, color: "#123333" }}>
            4. Equalizer & Audio Mixer Controls
          </h4>
          <div style={{ display: "flex", gap: 60, alignItems: "center", justifyContent: "center", height: 260 }}>
            <div style={{ textAlign: "center" }}>
              <Slider
                vertical
                value={vol1}
                onChange={(v) => setVol1(v)}
                tooltipFormatter={(v) => `${v}dB`}
              />
              <div style={{ marginTop: 12, fontSize: 12, color: "#68807D", fontWeight: 600 }}>Treble</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <Slider
                vertical
                value={vol2}
                onChange={(v) => setVol2(v)}
                tooltipFormatter={(v) => `${v}dB`}
              />
              <div style={{ marginTop: 12, fontSize: 12, color: "#68807D", fontWeight: 600 }}>Bass</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <Slider
                vertical
                range
                value={vol3}
                onChange={(v) => setVol3(v)}
                tooltipFormatter={(v) => `${v}%`}
              />
              <div style={{ marginTop: 12, fontSize: 12, color: "#68807D", fontWeight: 600 }}>Band Pass</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
