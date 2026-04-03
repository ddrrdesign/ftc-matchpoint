/**
 * FTC Scout REST uses a season year (e.g. 2026 for Decode / Houston Championship).
 * See https://ftcscout.org/api/rest — seasons are calendar year numbers.
 *
 * `FTC_SCOUT_SEASON` overrides (e.g. pin to 2025 for historical views).
 */
export function getFtcScoutSeason(): number {
  const raw = process.env.FTC_SCOUT_SEASON?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) return n;
  }
  return 2026;
}

/**
 * When set, the Predictor prefers FTC Scout stats from this single event (same season),
 * e.g. Houston **FIRST Championship** — often `FTCCMP1` on FTC Scout (verify yearly).
 * If a team has no row for this event, we fall back to season quick-stats so matchups still work.
 *
 * Leave unset for season-wide composite (default). Set on Vercel during/after Championship
 * for “Worlds-only” numbers.
 */
export function getFtcScoutPredictorEventCode(): string | null {
  const raw = process.env.FTC_SCOUT_PREDICTOR_EVENT_CODE?.trim();
  return raw || null;
}
