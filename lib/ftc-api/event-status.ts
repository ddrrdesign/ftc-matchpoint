import type { SeasonEventModelV2 } from "./types";

export type UiEventStatus = "live" | "upcoming" | "completed";

const MS_DAY = 86400000;

/**
 * FTC often returns `date-time` but sometimes date-only strings.
 * Date-only end is treated as end of that calendar day (UTC) so same-day
 * events don't flip to "completed" at 00:00 UTC.
 */
function parseApiInstant(
  raw: string | undefined,
  role: "start" | "end"
): number {
  if (raw == null) return NaN;
  const s = raw.trim();
  if (!s) return NaN;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(
      role === "start" ? `${s}T00:00:00.000Z` : `${s}T23:59:59.999Z`
    ).getTime();
  }
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? NaN : t;
}

/** When API omits `dateEnd`, infer a window so events don't stay "live" forever. */
function inferEndFromStart(startMs: number, e: SeasonEventModelV2): number {
  const hay = `${e.type ?? ""} ${e.typeName ?? ""} ${e.name ?? ""}`.toLowerCase();
  const longEvent =
    /\b(championship|champ|cmp|regional|district|super[\s-]?qual|interleague|festival)\b/.test(
      hay
    );
  const days = longEvent ? 8 : 2;
  return startMs + days * MS_DAY;
}

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
  let start = parseApiInstant(e.dateStart, "start");
  let end = parseApiInstant(e.dateEnd, "end");

  if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    start = lo;
    end = hi;
  }

  if (!Number.isNaN(start) && Number.isNaN(end)) {
    end = inferEndFromStart(start, e);
  }

  if (Number.isNaN(start)) {
    if (!Number.isNaN(end)) return now > end ? "completed" : "upcoming";
    return "upcoming";
  }

  if (!Number.isNaN(end) && now > end) return "completed";
  if (now < start) return "upcoming";
  if (!Number.isNaN(end) && now >= start && now <= end) return "live";
  return "upcoming";
}

export function formatEventLocation(e: SeasonEventModelV2): string {
  const parts = [e.city, e.stateprov, e.country].filter(Boolean);
  return parts.length ? parts.join(", ") : e.venue ?? "-";
}
