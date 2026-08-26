import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ScoreInput, type ScoreGrade } from "./ScoreInput";

const meta: Meta<typeof ScoreInput> = {
  title: "Atoms/Inputs/ScoreInput",
  component: ScoreInput,
  argTypes: {
    variant: {
      control: "select",
      options: ["boxes", "stars", "pills"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ScoreInput>;

export const BoxesDefault: Story = {
  render: () => {
    const [score, setScore] = useState<number | ScoreGrade>(3);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ScoreInput value={score} onChange={(val) => setScore(val.score)} grades={5} />
        <div style={{ fontSize: 12, color: "#68807D" }}>Selected score: {typeof score === "number" ? score : score.score}</div>
      </div>
    );
  },
};

export const StarRating: Story = {
  render: () => {
    const [score, setScore] = useState<number | ScoreGrade>(4);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ScoreInput variant="stars" value={score} onChange={(val) => setScore(val.score)} grades={5} />
        <div style={{ fontSize: 12, color: "#68807D" }}>Rating: {typeof score === "number" ? score : score.score} / 5</div>
      </div>
    );
  },
};

export const NumericPills: Story = {
  render: () => {
    const [score, setScore] = useState<number | ScoreGrade>(8);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ScoreInput variant="pills" value={score} onChange={(val) => setScore(val.score)} grades={10} />
        <div style={{ fontSize: 12, color: "#68807D" }}>Selected: {typeof score === "number" ? score : score.score} / 10</div>
      </div>
    );
  },
};

export const LetterGrades: Story = {
  render: () => {
    const letterGrades: ScoreGrade[] = [
      { score: 1, letter: "F", label: "Fail" },
      { score: 2, letter: "D", label: "Poor" },
      { score: 3, letter: "C", label: "Average" },
      { score: 4, letter: "B", label: "Good" },
      { score: 5, letter: "A", label: "Excellent" },
    ];

    const [selectedGrade, setSelectedGrade] = useState<ScoreGrade>(letterGrades[4]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ScoreInput
          grades={letterGrades}
          value={selectedGrade}
          onChange={setSelectedGrade}
          showLetters
        />
        <div style={{ fontSize: 12, color: "#68807D" }}>
          Selected grade: <strong>{selectedGrade.letter}</strong> ({selectedGrade.label})
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Small (sm)</div>
        <ScoreInput size="sm" defaultValue={2} grades={5} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Medium (md)</div>
        <ScoreInput size="md" defaultValue={3} grades={5} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Large (lg)</div>
        <ScoreInput size="lg" defaultValue={4} grades={5} />
      </div>
    </div>
  ),
};
