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

/** Houston / Detroit–style FIRST Championship & CMP codes */
export function isWorldsLevelEvent(e: SeasonEventModelV2): boolean {
  const code = (e.code ?? "").toUpperCase();
  const name = (e.name ?? "").toLowerCase();
  if (/^FTCCMP\d*/.test(code)) return true;
  if (/FIRST\s+CHAMPIONSHIP|WORLD\s+FESTIVAL/.test(name)) return true;
  if (
    name.includes("championship") &&
    (name.includes("houston") || name.includes("detroit"))
  ) {
    return true;
  }
  return false;
}

/** Sort bucket for events without a clear country / region in the API */
export const EVENT_REGION_FALLBACK = "Global / other";

/**
 * Bucket key for browse UI: worlds first in sort order via `__WORLDS__`,
 * otherwise country, then region code, then fallback.
 */
export function eventRegionGroupKey(e: SeasonEventModelV2): string {
  if (isWorldsLevelEvent(e)) return "__WORLDS__";
  const country = e.country?.trim();
  if (country) return country;
  const rc = e.regionCode?.trim();
  if (rc) return rc;
  return EVENT_REGION_FALLBACK;
}

export function eventRegionSectionTitle(key: string): string {
  if (key === "__WORLDS__") return "World Championship";
  return key;
}

export function sortRegionGroupKeys(a: string, b: string): number {
  if (a === "__WORLDS__") return -1;
  if (b === "__WORLDS__") return 1;
  if (a === EVENT_REGION_FALLBACK && b !== EVENT_REGION_FALLBACK) return 1;
  if (b === EVENT_REGION_FALLBACK && a !== EVENT_REGION_FALLBACK) return -1;
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export function formatEventDateRange(e: SeasonEventModelV2): string | null {
  const rawS = e.dateStart?.trim();
  if (!rawS) return null;
  try {
    const s = new Date(rawS);
    if (Number.isNaN(s.getTime())) return null;
    const rawE = e.dateEnd?.trim();
    const en = rawE ? new Date(rawE) : null;
    const endOk = en && !Number.isNaN(en.getTime());
    const full: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    if (!endOk) return s.toLocaleDateString("en-US", full);
    if (s.getTime() === en!.getTime()) return s.toLocaleDateString("en-US", full);
    const sameYear = s.getFullYear() === en!.getFullYear();
    const startOpt: Intl.DateTimeFormatOptions = sameYear
      ? { month: "short", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" };
    return `${s.toLocaleDateString("en-US", startOpt)} – ${en!.toLocaleDateString("en-US", full)}`;
  } catch {
    return null;
  }
}

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
