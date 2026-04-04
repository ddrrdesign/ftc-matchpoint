import type { SeasonEventModelV2 } from "./types";

/** Public FTC Event Web URL for a season + event code (see ftc-events.firstinspires.org). */
export function firstEventWebUrl(seasonYear: number, eventCode: string): string {
  const c = encodeURIComponent(eventCode.trim());
  return `https://ftc-events.firstinspires.org/${seasonYear}/${c}`;
}

/** Link to season hub on FIRST Event Web. */
export function firstSeasonHubUrl(seasonYear: number): string {
  return `https://ftc-events.firstinspires.org/${seasonYear}`;
}

/** API docs landing (v2.0 REST). */
export const FIRST_FTC_API_DOCS_URL =
  "https://ftc-events.firstinspires.org/api-docs/index.html";

export function formatEventVenueLine(e: SeasonEventModelV2): string | null {
  const v = e.venue?.trim();
  if (!v) return null;
  const city = e.city?.trim();
  if (city && v.toLowerCase().includes(city.toLowerCase())) return v;
  return v;
}

/** Extra subtitle: event type + format hints (not dates). */
export function formatEventTypeLine(e: SeasonEventModelV2): string {
  const parts: string[] = [];
  const type = e.typeName?.trim() || e.type?.trim();
  if (type) parts.push(type);
  if (e.remote) parts.push("Remote");
  if (e.hybrid) parts.push("Hybrid");
  return parts.join(" · ") || "FTC event";
}

export function eventFormatChips(e: SeasonEventModelV2): string[] {
  const chips: string[] = [];
  if (e.remote) chips.push("Remote");
  if (e.hybrid) chips.push("Hybrid");
  if (e.published === false) chips.push("Unpublished");
  return chips;
}
