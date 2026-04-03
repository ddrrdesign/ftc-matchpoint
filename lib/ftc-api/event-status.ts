import type { SeasonEventModelV2 } from "./types";

export type UiEventStatus = "live" | "upcoming" | "completed";

/** User-facing status (avoid vague "Live" on listings). */
export function uiEventStatusLabel(s: UiEventStatus): string {
  switch (s) {
    case "live":
      return "Ongoing now";
    case "upcoming":
      return "Coming up";
    case "completed":
      return "Ended";
    default:
      return "Coming up";
  }
}

export function deriveEventStatus(e: SeasonEventModelV2): UiEventStatus {
  const now = Date.now();
  const start = e.dateStart ? new Date(e.dateStart).getTime() : NaN;
  const end = e.dateEnd ? new Date(e.dateEnd).getTime() : NaN;
  if (!Number.isNaN(end) && now > end) return "completed";
  if (!Number.isNaN(start) && now < start) return "upcoming";
  if (!Number.isNaN(start) && !Number.isNaN(end) && now >= start && now <= end)
    return "live";
  if (!Number.isNaN(start) && Number.isNaN(end) && now >= start) return "live";
  return "upcoming";
}

export function formatEventLocation(e: SeasonEventModelV2): string {
  const parts = [e.city, e.stateprov, e.country].filter(Boolean);
  return parts.length ? parts.join(", ") : e.venue ?? "-";
}
