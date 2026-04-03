/** Approximate world percentile from rank and pool size (FTC Scout quick-stats). */
export function percentile(rank: number, pool: number): number | null {
  if (!pool || pool <= 0) return null;
  const p = ((pool - rank) / pool) * 100;
  return Math.round(p * 10) / 10;
}
