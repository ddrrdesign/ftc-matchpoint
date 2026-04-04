import type { SeasonEventModelV2 } from "./types";

export type MergedListingEvent = {
  event: SeasonEventModelV2;
  sourceRowCount: number;
};

export function dedupeEventsByCode(
  events: SeasonEventModelV2[]
): MergedListingEvent[] {
  const groups = new Map<string, SeasonEventModelV2[]>();
  for (const e of events) {
    const key = (e.code ?? "").trim() || e.eventId || "";
    if (!key) continue;
    const g = groups.get(key) ?? [];
    g.push(e);
    groups.set(key, g);
  }
  const out: MergedListingEvent[] = [];
  for (const [, rows] of groups) {
    if (rows.length === 1) {
      out.push({ event: rows[0]!, sourceRowCount: 1 });
    } else {
      out.push({ event: mergeEventRows(rows), sourceRowCount: rows.length });
    }
  }
  return out;
}

function mergeEventRows(rows: SeasonEventModelV2[]): SeasonEventModelV2 {
  const base = rows.reduce((best, cur) => {
    const curMain = !cur.divisionCode?.trim();
    const bestMain = !best.divisionCode?.trim();
    if (curMain && !bestMain) return cur;
    return best;
  });
  let minStart = Infinity;
  let maxEnd = -Infinity;
  for (const r of rows) {
    if (r.dateStart) {
      const t = new Date(r.dateStart).getTime();
      if (!Number.isNaN(t)) minStart = Math.min(minStart, t);
    }
    if (r.dateEnd) {
      const t = new Date(r.dateEnd).getTime();
      if (!Number.isNaN(t)) maxEnd = Math.max(maxEnd, t);
    }
  }
  return {
    ...base,
    divisionCode: null,
    dateStart:
      minStart !== Infinity
        ? new Date(minStart).toISOString()
        : base.dateStart,
    dateEnd:
      maxEnd !== -Infinity ? new Date(maxEnd).toISOString() : base.dateEnd,
  };
}

export function compareEventsByStartDesc(
  a: SeasonEventModelV2,
  b: SeasonEventModelV2
): number {
  const ta = a.dateStart ? new Date(a.dateStart).getTime() : 0;
  const tb = b.dateStart ? new Date(b.dateStart).getTime() : 0;
  return tb - ta;
}
