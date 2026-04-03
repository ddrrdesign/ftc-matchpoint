/** Season year as used in FTC API paths, e.g. 2026 for 2025–2026 season */
export function getFtcSeasonYear(): number {
  const raw = process.env.FTC_SEASON_YEAR;
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) return n;
  }
  return new Date().getFullYear();
}

export function getFtcCredentials(): { username: string; key: string } | null {
  const username = process.env.FTC_API_USERNAME?.trim();
  const key = process.env.FTC_API_KEY?.trim();
  if (!username || !key) return null;
  return { username, key };
}

export function isFtcApiConfigured(): boolean {
  return getFtcCredentials() !== null;
}
