import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PinInput } from ".././PinInput";

const meta: Meta<typeof PinInput> = {
  title: "Atoms/Inputs/PinInput",
  component: PinInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Enterprise PinInput / OTPInput primitive for verification codes, 2FA auth, and security PINs with unified separator prop, pop micro-animations, mask reveal toggle, success/error verification glows, auto-advance, and paste handling.",
      },
    },
  },
  argTypes: {
    length: {
      control: { type: "number", min: 3, max: 8 },
      description: "Number of pin slot inputs",
    },
    type: {
      control: { type: "select" },
      options: ["number", "text", "alphanumeric"],
      description: "Valid character input type constraint",
    },
    mask: {
      control: { type: "boolean" },
      description: "Mask values for security PINs",
    },
    showMaskToggle: {
      control: { type: "boolean" },
      description: "Shows eye button to toggle mask visibility",
    },
    separator: {
      control: { type: "boolean" },
      description: "Groups slots with a separator (e.g. true or '–')",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder symbol in empty slots",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size scale variant",
    },
    error: {
      control: { type: "boolean" },
      description: "Highlight error state",
    },
    success: {
      control: { type: "boolean" },
      description: "Highlight success state",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables interactive editing",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    length: 6,
    type: "number",
    mask: false,
    showMaskToggle: true,
    separator: true,
    groupSize: 3,
    size: "md",
    error: false,
    success: false,
    disabled: false,
    autoFocus: false,
  },
  render: (args) => {
    const [pin, setPin] = useState<string>("");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PinInput
          {...args}
          value={pin}
          onChange={(val) => setPin(val)}
        />
        <div style={{ fontSize: 13, color: "#4A6360", fontFamily: "monospace" }}>
          Entered Code: <strong>{pin || "(empty)"}</strong>
        </div>
      </div>
    );
  },
};

export const Showcase: Story = {
  render: () => {
    const [otp, setOtp] = useState<string>("492");
    const [secPin, setSecPin] = useState<string>("1234");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 520, padding: 10 }}>
        {/* Card 1: 6-Digit 2FA Verification Code with Grouping Separator */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2ECEB", borderRadius: 14, padding: 24, boxShadow: "0 4px 16px rgba(11, 103, 99, 0.05)" }}>
          <h4 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700, color: "#123333" }}>
            2FA Verification Code
          </h4>
          <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#4A6360" }}>
            Enter the 6-digit authentication code sent to your device.
          </p>
          <PinInput
            length={6}
            separator
            groupSize={3}
            value={otp}
            onChange={(val) => setOtp(val)}
            onComplete={() => alert(`OTP Submitted: ${otp}`)}
          />
        </div>

        {/* Card 2: Security PIN with Mask Reveal Eye Toggle */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2ECEB", borderRadius: 14, padding: 24 }}>
          <h4 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700, color: "#123333" }}>
            Masked Security PIN
          </h4>
          <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#4A6360" }}>
            4-digit PIN with mask reveal toggle button.
          </p>
          <PinInput
            length={4}
            mask
            showMaskToggle
            value={secPin}
            onChange={(val) => setSecPin(val)}
          />
        </div>

        {/* Card 3: Error & Success Verification States */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2ECEB", borderRadius: 14, padding: 24 }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: 15, fontWeight: 700, color: "#123333" }}>
            Verification States (Error vs Success)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#CF1322", marginBottom: 8 }}>
                Invalid Code (Error Glow)
              </div>
              <PinInput length={4} defaultValue="9999" error />
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#278800", marginBottom: 8 }}>
                Verified (Success Glow)
              </div>
              <PinInput length={4} defaultValue="8888" success />
            </div>
          </div>
        </div>
      </div>
    );
  },
};
