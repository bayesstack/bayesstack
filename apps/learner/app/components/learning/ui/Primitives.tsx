"use client";

import React from "react";

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <span className="learning-progress">
      <i><b style={{ width: `${value}%` }} /></i>
      {label && <small>{label}</small>}
    </span>
  );
}
