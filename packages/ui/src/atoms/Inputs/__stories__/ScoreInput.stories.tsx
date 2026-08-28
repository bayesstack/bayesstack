import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ScoreInput, type ScoreGrade } from "../ScoreInput";

const meta: Meta<typeof ScoreInput> = {
  title: "Atoms/Inputs/ScoreInput",
  component: ScoreInput,
  parameters: {
    layout: "padded",
  },
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
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ScoreInput>;

export const Playground: Story = {
  args: {
    variant: "boxes",
    size: "md",
    defaultValue: 3,
    grades: 5,
    disabled: false,
    error: false,
  },
  render: (args) => {
    const [score, setScore] = useState<number | ScoreGrade>(args.defaultValue ?? 3);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ScoreInput {...args} value={score} onChange={(val) => setScore(val.score)} />
        <div style={{ fontSize: 12, color: "#4A6360" }}>
          Selected score: {typeof score === "number" ? score : score.score}
        </div>
      </div>
    );
  },
};

export const Ex1_StarRating: Story = {
  name: "01: Interactive Star Rating",
  render: () => {
    const [score, setScore] = useState<number | ScoreGrade>(4);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ScoreInput variant="stars" value={score} onChange={(val) => setScore(val.score)} grades={5} />
        <div style={{ fontSize: 12, color: "#4A6360" }}>Rating: {typeof score === "number" ? score : score.score} / 5</div>
      </div>
    );
  },
};

export const Ex2_NumericPills: Story = {
  name: "02: Numeric 10-Point Pills",
  render: () => {
    const [score, setScore] = useState<number | ScoreGrade>(8);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ScoreInput variant="pills" value={score} onChange={(val) => setScore(val.score)} grades={10} />
        <div style={{ fontSize: 12, color: "#4A6360" }}>Selected: {typeof score === "number" ? score : score.score} / 10</div>
      </div>
    );
  },
};

export const Ex3_LetterGrades: Story = {
  name: "03: Academic Letter Grades",
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
        <div style={{ fontSize: 12, color: "#4A6360" }}>
          Selected grade: <strong>{selectedGrade.letter}</strong> ({selectedGrade.label})
        </div>
      </div>
    );
  },
};
