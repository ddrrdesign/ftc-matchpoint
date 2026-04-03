import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getEventByCode,
  getMatchBySlug,
  MOCK_PREDICTION_SHOWCASE,
  MOCK_STATS_CA,
  MOCK_TEAMS,
} from "@/lib/mock-data";
import {
  allianceStrength,
  confidenceFromStrengthGap,
  winProbabilities,
} from "@/lib/prediction";
import { formatAlliance } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export default async function DemoMatchPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const match = getMatchBySlug(slug);
  if (!match) notFound();

  const event = getEventByCode("CA-2026");
  const t = (num: number) =>
    MOCK_STATS_CA.find(
      (s) => MOCK_TEAMS.find((x) => x.id === s.teamId)?.number === num
    );

  const redStats = match.red.teamNumbers
    .map((n) => t(n))
    .filter((s): s is NonNullable<typeof s> => s != null);
  const blueStats = match.blue.teamNumbers
    .map((n) => t(n))
    .filter((s): s is NonNullable<typeof s> => s != null);

  let redP = 0.5;
  let blueP = 0.5;
  let confidence: "low" | "medium" | "high" = "low";
  let favored: "red" | "blue" = "red";
  let reasons: string[] = [
    "Alliance strength gap from event-weighted team stats",
    "Recent form and consistency drive the probability spread",
    "Early-event predictions carry lower confidence",
  ];

  if (redStats.length === 2 && blueStats.length === 2) {
    const rS = allianceStrength(redStats[0], redStats[1]);
    const bS = allianceStrength(blueStats[0], blueStats[1]);
    const w = winProbabilities(rS, bS);
    redP = w.red;
    blueP = w.blue;
    favored = w.red >= w.blue ? "red" : "blue";
    confidence = confidenceFromStrengthGap(rS, bS);
  } else if (match.id === MOCK_PREDICTION_SHOWCASE.matchId) {
    redP = MOCK_PREDICTION_SHOWCASE.redWinProbability;
    blueP = MOCK_PREDICTION_SHOWCASE.blueWinProbability;
    favored = MOCK_PREDICTION_SHOWCASE.favored;
    confidence = MOCK_PREDICTION_SHOWCASE.confidence;
    reasons = MOCK_PREDICTION_SHOWCASE.reasons;
  } else {
    reasons = [
      "Sample dataset does not include stats for all four teams in this match.",
      "Connect real event data to unlock full alliance strength and probabilities.",
    ];
  }

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <Link
          href="/events/CA-2026#matches"
          className="text-sm text-violet-300/80"
        >
          ← Event matches (sample)
        </Link>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">
            {event?.name ?? "FTC Event"} · {match.phase}
          </p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
            {match.label}
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Red vs blue · two teams per alliance (FTC 2v2) · sample data
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <GlassCard glow="red" className="p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300/80">
              Red alliance
            </p>
            <p className="mt-3 font-mono text-xl">
              {formatAlliance(match.red.teamNumbers)}
            </p>
            <p className="mt-6 text-sm text-white/45">Combined event strength</p>
            <p className="text-3xl font-semibold text-red-200/90">
              {Math.round(redP * 100)}%
            </p>
            <p className="text-xs text-white/40">Win probability</p>
          </GlassCard>
          <GlassCard glow="blue" className="p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300/80">
              Blue alliance
            </p>
            <p className="mt-3 font-mono text-xl">
              {formatAlliance(match.blue.teamNumbers)}
            </p>
            <p className="mt-6 text-sm text-white/45">Combined event strength</p>
            <p className="text-3xl font-semibold text-blue-200/90">
              {Math.round(blueP * 100)}%
            </p>
            <p className="text-xs text-white/40">Win probability</p>
          </GlassCard>
        </div>

        <GlassCard glow="violet" className="mt-8 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                Favored alliance
              </p>
              <p className="mt-2 text-2xl font-semibold capitalize">
                {favored === "red" ? "Red" : "Blue"}
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70">
              Confidence:{" "}
              <span className="font-medium text-white">{confidence}</span>
            </div>
          </div>
        </GlassCard>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Why this side is ahead</h2>
          <ul className="mt-4 space-y-3">
            {reasons.map((r) => (
              <li
                key={r}
                className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white/70"
              >
                <span className="text-violet-400/90">▸</span>
                {r}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Comparison axes</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["Auto", "Teleop", "Endgame", "Consistency", "Avg total"].map(
              (axis) => (
                <GlassCard key={axis} className="p-4 text-sm">
                  <p className="text-white/45">{axis}</p>
                  <p className="mt-2 text-white/80">
                    Side-by-side bars can plug in here when charts ship.
                  </p>
                </GlassCard>
              )
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
