/** Season year as used in FTC API paths, e.g. 2026 for 2025–2026 season */
export function getFtcSeasonYear(): number {
  const raw = process.env["FTC_SEASON_YEAR"];
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) return n;
  }
  return new Date().getFullYear();
}

/**
 * Which API season years to load on the events index (newest first).
 * `FTC_SEASON_YEARS=2025,2024,2023` overrides. Otherwise `FTC_SEASON_INDEX_SPAN`
 * (default 10) seasons back from `getFtcSeasonYear()`, capped at 25.
 */
export function getFtcSeasonYearsForEventIndex(): number[] {
  const raw = process.env["FTC_SEASON_YEARS"]?.trim();
  if (raw) {
    const ys = raw
      .split(/[\s,]+/)
      .map((p) => Number.parseInt(p.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 1990 && n <= 2100);
    if (ys.length) return [...new Set(ys)].sort((a, b) => b - a);
  }
  const anchor = getFtcSeasonYear();
  let span = Number.parseInt(process.env["FTC_SEASON_INDEX_SPAN"] ?? "15", 10);
  if (Number.isNaN(span) || span < 1) span = 15;
  span = Math.min(span, 25);
  return Array.from({ length: span }, (_, i) => anchor - i);
}

/**
 * API season years used for the Predictions “pick an event” catalog.
 * Defaults to the configured FTC season year plus the previous year (FIRST
 * sometimes keys the same game under adjacent integers). Override with
 * `FTC_PREDICTIONS_API_SEASONS=2025,2024` (comma-separated, newest first).
 */
export function getFtcSeasonYearsForPredictionsCatalog(): number[] {
  const raw = process.env["FTC_PREDICTIONS_API_SEASONS"]?.trim();
  if (raw) {
    const ys = raw
      .split(/[\s,]+/)
      .map((p) => Number.parseInt(p.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 1990 && n <= 2100);
    if (ys.length) return [...new Set(ys)].sort((a, b) => b - a);
  }
  const y = getFtcSeasonYear();
  return [...new Set([y, y - 1])]
    .filter((n) => n >= 2000 && n <= 2100)
    .sort((a, b) => b - a);
}

/** Optional `?season=` on event detail — must stay in sync with API/Event Web. */
export function parseFtcSeasonQueryParam(
  raw: string | string[] | undefined
): number | null {
  const s = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const n = Number.parseInt(String(s).trim(), 10);
  if (Number.isNaN(n) || n < 1990 || n > 2100) return null;
  return n;
}

export function getFtcCredentials(): { username: string; key: string } | null {
  // Bracket access so Next.js does not inline undefined at build time (Vercel runtime env).
  const username = process.env["FTC_API_USERNAME"]?.trim();
  const key = process.env["FTC_API_KEY"]?.trim();
  if (!username || !key) return null;
  return { username, key };
}

export function isFtcApiConfigured(): boolean {
  return getFtcCredentials() !== null;
}
