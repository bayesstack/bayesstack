"use client";

import { useParams } from "next/navigation";
import { ActivityStudio } from "../../../../components/learning/ActivityStudio";

export default function MachineLearningActivityPage() {
  const params = useParams<{ activityId: string }>();
  return <ActivityStudio activityId={params.activityId ?? ""} />;
}
