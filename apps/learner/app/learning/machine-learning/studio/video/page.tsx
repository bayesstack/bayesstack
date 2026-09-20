"use client";

import Link from "next/link";
import { Icon } from "@bayesstack/ui";
import { VideoStudio } from "@bayesstack/studio-video";
import { gradientDescentVideoActivity } from "../../../../components/learning/studioActivities";

export default function VideoStudioPage() {
  return (
    <main className="learning-activity-studio learning-activity-studio--video">
      <div className="learning-video-studio-shell">
        <Link href="/learning/machine-learning" className="learning-video-studio-back">
          <Icon name="ArrowLeft" size={17} />
          <span>Learning path</span>
        </Link>
        <VideoStudio activity={gradientDescentVideoActivity} />
      </div>
    </main>
  );
}
