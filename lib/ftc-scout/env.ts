/**
 * FTC Scout REST uses a season year (e.g. 2025 for the current Decode season).
 * See https://ftcscout.org/api/rest - seasons are year numbers.
 */
export function getFtcScoutSeason(): number {
  const raw = process.env.FTC_SCOUT_SEASON?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) return n;
  }
  return 2025;
}
