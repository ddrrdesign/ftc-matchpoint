import "server-only";

import { getFtcCredentials } from "./env";

/**
 * Host only (no `/v2.0`). Request paths already start with `/v2.0/...`.
 * `FTC_API_BASE_URL` may be set to `https://…/v2.0` — trailing `/v2.0` is stripped.
 */
function ftcApiOrigin(): string {
  let raw =
    process.env["FTC_API_ORIGIN"]?.trim() ||
    process.env["FTC_API_BASE_URL"]?.trim();
  if (!raw) return "https://ftc-api.firstinspires.org";
  raw = raw.replace(/\/$/, "");
  if (raw.endsWith("/v2.0")) raw = raw.slice(0, -"/v2.0".length);
  return raw.replace(/\/$/, "") || "https://ftc-api.firstinspires.org";
}

function authHeader(): string | null {
  const c = getFtcCredentials();
  if (!c) return null;
  const raw = `${c.username}:${c.key}`;
  return `Basic ${Buffer.from(raw, "utf8").toString("base64")}`;
}

export type FtcFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

/**
 * Authenticated GET to FTC Events API. Returns null if credentials missing.
 */
export async function ftcGet<T>(
  path: string,
  options?: { revalidate?: number }
): Promise<FtcFetchResult<T> | null> {
  const auth = authHeader();
  if (!auth) return null;

  const revalidate = options?.revalidate ?? 120;
  const url = `${ftcApiOrigin()}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    headers: {
      Authorization: auth,
      Accept: "application/json",
    },
    next: { revalidate },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      status: res.status,
      message: text.slice(0, 500) || res.statusText,
    };
  }

  const data = (await res.json()) as T;
  return { ok: true, data };
}
