/**
 * Human label for an FTC API / Scout season key: `2025` → DECODE 2025–2026.
 */
export function formatFtcSeasonRangeLabel(apiSeasonStartYear: number): string {
  const y = apiSeasonStartYear;
  return `${y}–${y + 1}`;
}
