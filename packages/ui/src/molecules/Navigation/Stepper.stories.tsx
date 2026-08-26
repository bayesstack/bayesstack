import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "./Stepper";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Stepper> = {
  title: "Molecules/Navigation/Stepper",
  component: Stepper,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleSteps = [
  { title: "Select Model", description: "Choose base LLM checkpoint" },
  { title: "Upload Training Data", description: "Format CSV / JSONL datasets" },
  { title: "Hyperparameters", description: "Set learning rate & epochs" },
  { title: "Launch Fine-Tuning", description: "Deploy training job to GPU cluster" },
];

export const Playground: Story = {
  args: {
    activeStep: 1,
    orientation: "horizontal",
    steps: sampleSteps,
  },
  render: (args) => (
    <div style={{ maxWidth: 720, padding: 24, margin: "16px 0 0 16px" }}>
      <Stepper {...args} />
    </div>
  ),
};

export const InteractiveStepper: Story = {
  render: () => {
    const [active, setActive] = useState(1);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720, padding: 24, margin: "16px 0 0 16px" }}>
        <Stepper
          activeStep={active}
          steps={sampleSteps}
          onStepClick={(stepIdx) => setActive(stepIdx)}
        />

        <div style={{ display: "flex", gap: 12 }}>
          <Button
            size="sm"
            variant="outline"
            disabled={active === 0}
            onClick={() => setActive((prev) => Math.max(0, prev - 1))}
          >
            Previous Step
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={active === sampleSteps.length - 1}
            onClick={() => setActive((prev) => Math.min(sampleSteps.length - 1, prev + 1))}
          >
            Next Step
          </Button>
        </div>
      </div>
    );
  },
};
