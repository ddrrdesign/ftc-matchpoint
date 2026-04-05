/** Query keys for four team inputs (per-alliance, one field per robot). */
export type AllianceQuery = {
  r?: string;
  b?: string;
  r1?: string;
  r2?: string;
  b1?: string;
  b2?: string;
};

function parseOne(raw: string | undefined): number | null {
  if (raw == null) return null;
  const t = String(raw).trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  return Number.isNaN(n) || n <= 0 ? null : n;
}

function parsePairLegacy(raw: string | undefined): [number, number] | null {
  if (!raw?.trim()) return null;
  const parts = raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  const nums = parts.map((p) => Number.parseInt(p, 10));
  if (nums.length !== 2 || nums.some((n) => Number.isNaN(n) || n <= 0)) {
    return null;
  }
  return [nums[0]!, nums[1]!];
}

/**
 * Prefer `r1`–`b2`; fall back to legacy `r` / `b` comma pairs for shared URLs.
 */
export function parseAlliancesFromQuery(q: AllianceQuery): {
  red: [number, number] | null;
  blue: [number, number] | null;
} {
  const r1 = parseOne(q.r1);
  const r2 = parseOne(q.r2);
  const b1 = parseOne(q.b1);
  const b2 = parseOne(q.b2);
  if (r1 != null && r2 != null && b1 != null && b2 != null) {
    return { red: [r1, r2], blue: [b1, b2] };
  }
  return {
    red: parsePairLegacy(q.r),
    blue: parsePairLegacy(q.b),
  };
}

/** Defaults for form fields (hydrates legacy `r`/`b` into four boxes). */
export function defaultAllianceFieldValues(q: AllianceQuery): {
  r1: string;
  r2: string;
  b1: string;
  b2: string;
} {
  const { red, blue } = parseAlliancesFromQuery(q);
  if (red && blue) {
    return {
      r1: String(red[0]),
      r2: String(red[1]),
      b1: String(blue[0]),
      b2: String(blue[1]),
    };
  }
  const legacyR = parsePairLegacy(q.r);
  const legacyB = parsePairLegacy(q.b);
  return {
    r1: q.r1?.trim() ?? (legacyR ? String(legacyR[0]) : ""),
    r2: q.r2?.trim() ?? (legacyR ? String(legacyR[1]) : ""),
    b1: q.b1?.trim() ?? (legacyB ? String(legacyB[0]) : ""),
    b2: q.b2?.trim() ?? (legacyB ? String(legacyB[1]) : ""),
  };
}

export function alliancesQueryTouched(q: AllianceQuery): boolean {
  return Boolean(
    q.r?.trim() ||
      q.b?.trim() ||
      q.r1?.trim() ||
      q.r2?.trim() ||
      q.b1?.trim() ||
      q.b2?.trim()
  );
}

export function alliancesQueryComplete(q: AllianceQuery): boolean {
  const { red, blue } = parseAlliancesFromQuery(q);
  return red != null && blue != null;
}

/**
 * Swap only the second robot in each alliance: [A,B] vs [C,D] → [A,D] vs [C,B].
 * First slots (r1, b1) stay put.
 */
export function swapSecondPartnersQueryString(
  red: [number, number],
  blue: [number, number]
): string {
  const p = new URLSearchParams({
    r1: String(red[0]),
    r2: String(blue[1]),
    b1: String(blue[0]),
    b2: String(red[1]),
  });
  return p.toString();
}
