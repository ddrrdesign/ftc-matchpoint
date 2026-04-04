import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ r?: string; b?: string }>;
};

/** Old path - keep links working. */
export default async function MatchupRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (typeof sp.r === "string" && sp.r.trim()) q.set("r", sp.r);
  if (typeof sp.b === "string" && sp.b.trim()) q.set("b", sp.b);
  const s = q.toString();
  redirect(s ? `/predictions?${s}` : "/predictions");
}
