import "server-only";

const BASE = "https://api.ftcscout.org/rest/v1";

export type ScoutResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export type ScoutFetchOpts = { revalidate?: number; tags?: string[] };

export async function scoutGet<T>(
  path: string,
  opts?: ScoutFetchOpts
): Promise<ScoutResult<T>> {
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const revalidate = opts?.revalidate ?? 300;
  const next: { revalidate: number; tags?: string[] } = { revalidate };
  if (opts?.tags?.length) next.tags = opts.tags;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next,
  });

  if (res.status === 404) {
    return { ok: false, status: 404, message: "Not found" };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, message: text.slice(0, 400) };
  }

  const data = (await res.json()) as T;
  return { ok: true, data };
}
