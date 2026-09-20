"use client";

import { CodingStudio } from "@bayesstack/studio-coding";
import { gradientDescentCodingActivity } from "../../../../components/learning/studioActivities";

export default function CodingStudioPage() {
  return (
    <main className="learning-activity-studio learning-activity-studio--coding">
      <CodingStudio
        activity={gradientDescentCodingActivity}
        apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
