import type { SeasonEventModelV2 } from "./types";

/**
 * ftc-events.firstinspires.org paths use the hub year (e.g. `/2025/KZCMP` for DECODE
 * 2025–26 — see [all events](https://ftc-events.firstinspires.org/#allevents)). The REST
 * API `season` path may be the following calendar year (`2026`) for the same season;
 * `/2026/KZCMP` 404s, so we map unless overridden.
 */
export function apiSeasonToFirstInspiresPathYear(apiSeasonYear: number): number {
  const raw = process.env.FTC_EVENT_WEB_PATH_DELTA?.trim();
  if (raw !== undefined && raw !== "") {
    const delta = Number.parseInt(raw, 10);
    if (!Number.isNaN(delta)) return apiSeasonYear + delta;
  }
  return apiSeasonYear >= 2026 ? apiSeasonYear - 1 : apiSeasonYear;
}

/** Direct event page on FTC Event Web (not the #allevents list). */
export function firstEventWebUrl(seasonYear: number, eventCode: string): string {
  const y = apiSeasonToFirstInspiresPathYear(seasonYear);
  const c = encodeURIComponent(eventCode.trim());
  return `https://ftc-events.firstinspires.org/${y}/${c}`;
}

/** Season hub on FIRST Event Web (same path year as event pages). */
export function firstSeasonHubUrl(seasonYear: number): string {
  const y = apiSeasonToFirstInspiresPathYear(seasonYear);
  return `https://ftc-events.firstinspires.org/${y}`;
}

/** API docs landing (v2.0 REST). */
export const FIRST_FTC_API_DOCS_URL =
  "https://ftc-events.firstinspires.org/api-docs/index.html";

/** World Championship: FTCCMP* codes or names with FIRST Championship / World Festival. */
export function isWorldsFromCodeAndName(
  code?: string | null,
  name?: string | null
): boolean {
  const c = (code ?? "").toUpperCase();
  const n = (name ?? "").toLowerCase();
  if (/^FTCCMP\d*/.test(c)) return true;
  if (/first\s+championship|world\s+festival/.test(n)) return true;
  return false;
}

export function isWorldsLevelEvent(e: SeasonEventModelV2): boolean {
  return isWorldsFromCodeAndName(e.code, e.name);
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
