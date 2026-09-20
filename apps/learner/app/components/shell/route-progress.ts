export const ROUTE_PROGRESS_START_EVENT = "learner:route-progress-start";

export function startRouteProgress(destination: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ROUTE_PROGRESS_START_EVENT, { detail: { destination } }));
}
