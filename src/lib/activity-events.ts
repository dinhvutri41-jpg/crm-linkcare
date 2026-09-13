export type ActivityTone = "coral" | "mint" | "blue";
export type ActivityKind = "created" | "updated" | "deleted";
export type ActivityEvent = {
  id: string;
  label: string;
  detail: string;
  time: string;
  tone: ActivityTone;
  href: "/complaints" | "/technical-reports" | "/learning";
  kind: ActivityKind;
};

export const ACTIVITY_EVENTS_KEY = "vip_booking_activity_events";
export const ACTIVITY_FEED_KEY = "vip_booking_activity_feed";

export function recordActivityEvent(event: ActivityEvent) {
  if (typeof window === "undefined") return;
  try {
    const stored = JSON.parse(localStorage.getItem(ACTIVITY_EVENTS_KEY) || "[]") as Array<ActivityEvent & { timestamp: number }>;
    localStorage.setItem(ACTIVITY_EVENTS_KEY, JSON.stringify([...stored, { ...event, timestamp: Date.now() }].slice(-5)));
  } catch {
    // Activity history is best-effort when storage is unavailable.
  }
}
