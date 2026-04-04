import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    r?: string;
    b?: string;
    r1?: string;
    r2?: string;
    b1?: string;
    b2?: string;
  }>;
};

/** Old path - keep links working. */
export default async function MatchupRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  for (const key of ["r", "b", "r1", "r2", "b1", "b2"] as const) {
    const v = sp[key];
    if (typeof v === "string" && v.trim()) q.set(key, v);
  }
  const s = q.toString();
  redirect(s ? `/predictions?${s}` : "/predictions");
}
