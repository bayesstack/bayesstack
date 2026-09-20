"use client";

import { LoadingBar } from "@bayesstack/ui";

export default function RouteLoading() {
  return (
    <div className="learner-route-progress learner-route-progress--indeterminate" role="status" aria-label="Loading workspace">
      <LoadingBar height={3} />
    </div>
  );
}
