import "server-only";

import { getFtcSeasonYearsForPredictionsCatalog } from "@/lib/ftc-api/env";
import { deriveEventStatus, type UiEventStatus } from "@/lib/ftc-api/event-status";
import { fetchEventListingsForSeasons } from "@/lib/ftc-api/service";
import type { SeasonEventModelV2 } from "@/lib/ftc-api/types";

export type PredictionsEventRow = {
  season: number;
  code: string;
  name: string;
  status: UiEventStatus;
  dateStart?: string;
  dateEnd?: string;
  location: string;
};

function locationLine(e: SeasonEventModelV2): string {
  const parts = [e.city, e.stateprov, e.country].filter(Boolean);
  return parts.length ? parts.join(", ") : e.venue?.trim() || "—";
}

function parseInstant(raw: string | undefined): number {
  if (raw == null) return NaN;
  const s = raw.trim();
  if (!s) return NaN;
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? NaN : t;
}

function sortKeyForCompleted(row: PredictionsEventRow): number {
  const end = parseInstant(row.dateEnd);
  const start = parseInstant(row.dateStart);
  if (!Number.isNaN(end)) return end;
  if (!Number.isNaN(start)) return start;
  return 0;
}

const DEFAULT_MAX_EVENTS = 1500;

/**
 * Full-season FTC event catalog for Predictions (current API season(s) only).
 * Includes live, upcoming, and completed — same universe as FTC Event Web for
 * that season year, not only “active right now”.
 */
export async function fetchPredictionsSeasonEvents(): Promise<PredictionsEventRow[]> {
  const seasons = getFtcSeasonYearsForPredictionsCatalog();
  const chunks = await fetchEventListingsForSeasons(seasons);
  const rows: PredictionsEventRow[] = [];
  const seen = new Set<string>();

  const maxRaw = process.env.FTC_PREDICTIONS_EVENT_LIMIT?.trim();
  const maxEvents = maxRaw
    ? Math.min(
        5000,
        Math.max(100, Number.parseInt(maxRaw, 10) || DEFAULT_MAX_EVENTS)
      )
    : DEFAULT_MAX_EVENTS;

  for (const ch of chunks) {
    if (!ch.ok) continue;
    for (const e of ch.events ?? []) {
      if (e.published === false) continue;
      const code = (e.code ?? "").trim();
      if (!code) continue;
      const k = `${ch.season}:${code.toLowerCase()}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const st = deriveEventStatus(e);
      rows.push({
        season: ch.season,
        code,
        name: (e.name ?? code).trim() || code,
        status: st,
        dateStart: e.dateStart,
        dateEnd: e.dateEnd,
        location: locationLine(e),
      });
    }
  }

  rows.sort((a, b) => {
    const rank = (s: UiEventStatus) =>
      s === "live" ? 0 : s === "upcoming" ? 1 : 2;
    const ra = rank(a.status);
    const rb = rank(b.status);
    if (ra !== rb) return ra - rb;
    if (ra < 2) {
      const ta = a.dateStart ? new Date(a.dateStart).getTime() : 0;
      const tb = b.dateStart ? new Date(b.dateStart).getTime() : 0;
      return ta - tb;
    }
    return sortKeyForCompleted(b) - sortKeyForCompleted(a);
  });

  return rows.slice(0, maxEvents);
}

/** @deprecated Use fetchPredictionsSeasonEvents — kept for short-term grep compatibility */
export type ActiveEventRow = PredictionsEventRow;

/** @deprecated Use fetchPredictionsSeasonEvents */
export async function fetchActiveEventsForPredictions(): Promise<PredictionsEventRow[]> {
  return fetchPredictionsSeasonEvents();
}

export function filterPredictionsEventsByQuery(
  rows: PredictionsEventRow[],
  q: string
): PredictionsEventRow[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((r) => {
    const hay = `${r.name} ${r.code} ${r.location}`.toLowerCase();
    return hay.includes(needle);
  });
}
