export function formatAlliance(pair: [number, number]): string {
  return `${pair[0]} · ${pair[1]}`;
}

export function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
