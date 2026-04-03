import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import type { MatchResultModelV2 } from "@/lib/ftc-api/types";
import { matchLabel, teamsToAlliances } from "@/lib/ftc-api/match-utils";
import { formatAlliance } from "@/lib/format";
import { allianceStrength, confidenceFromStrengthGap, winProbabilities } from "@/lib/prediction";
import type { TeamEventStats } from "@/lib/types";

type Props = {
  eventCode: string;
  eventName?: string;
  match: MatchResultModelV2;
  /** Optional team stats keyed by team number for MVP probability */
  statsByTeamNumber?: Map<number, TeamEventStats>;
};

function statsFromRanking(
  teamNumber: number,
  qualAverage: number
): TeamEventStats {
  const base = qualAverage;
  return {
    teamId: `t${teamNumber}`,
    eventId: "api",
    avgTotal: base,
    avgAuto: base * 0.25,
    avgTeleop: base * 0.55,
    avgEndgame: base * 0.2,
    consistency: 0.7,
    recentForm: 0,
  };
}

export function MatchDetail({
  eventCode,
  eventName,
  match,
  statsByTeamNumber,
}: Props) {
  const { red, blue } = teamsToAlliances(match.teams);
  const redPair: [number, number] = [
    red[0] ?? 0,
    red[1] ?? red[0] ?? 0,
  ];
  const bluePair: [number, number] = [
    blue[0] ?? 0,
    blue[1] ?? blue[0] ?? 0,
  ];

  const rs0 = statsByTeamNumber?.get(redPair[0]);
  const rs1 = statsByTeamNumber?.get(redPair[1]);
  const bs0 = statsByTeamNumber?.get(bluePair[0]);
  const bs1 = statsByTeamNumber?.get(bluePair[1]);

  let redP = 0.5;
  let blueP = 0.5;
  let confidence: "low" | "medium" | "high" = "low";
  let favored: "red" | "blue" = "red";

  if (rs0 && rs1 && bs0 && bs1) {
    const rS = allianceStrength(rs0, rs1);
    const bS = allianceStrength(bs0, bs1);
    const w = winProbabilities(rS, bS);
    redP = w.red;
    blueP = w.blue;
    favored = w.red >= w.blue ? "red" : "blue";
    confidence = confidenceFromStrengthGap(rS, bS);
  } else if (
    match.scoreRedFinal != null &&
    match.scoreBlueFinal != null
  ) {
    const r = match.scoreRedFinal;
    const b = match.scoreBlueFinal;
    favored = r >= b ? "red" : "blue";
    const t = r + b || 1;
    redP = r / t;
    blueP = b / t;
    confidence = "low";
  }

  const label = matchLabel(match);
  const winner =
    match.scoreRedFinal != null && match.scoreBlueFinal != null
      ? match.scoreRedFinal > match.scoreBlueFinal
        ? "red"
        : match.scoreRedFinal < match.scoreBlueFinal
          ? "blue"
          : null
      : null;

  const reasons = [
    rs0 && rs1 && bs0 && bs1
      ? "Probabilities use alliance strength from qual averages and synthetic splits."
      : "Connect richer per-team stats for full prediction quality.",
    winner
      ? `Final: ${match.scoreRedFinal} – ${match.scoreBlueFinal}.`
      : "Match not played yet - projection only.",
  ];

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <Link
          href={`/events/${encodeURIComponent(eventCode)}#matches`}
          className="text-sm text-violet-300/80"
        >
          ← Event matches
        </Link>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">
            {eventName ?? eventCode}
          </p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{label}</h1>
          <p className="mt-2 text-sm text-white/45">
            Red vs blue · two teams per alliance (FTC)
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <GlassCard glow="red" className="p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300/80">
              Red alliance
            </p>
            <p className="mt-3 font-mono text-xl">
              {red.length >= 2
                ? formatAlliance([red[0]!, red[1]!])
                : red.map(String).join(" · ") || "-"}
            </p>
            <p className="mt-6 text-sm text-white/45">Model / score share</p>
            <p className="text-3xl font-semibold text-red-200/90">
              {Math.round(redP * 100)}%
            </p>
          </GlassCard>
          <GlassCard glow="blue" className="p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300/80">
              Blue alliance
            </p>
            <p className="mt-3 font-mono text-xl">
              {blue.length >= 2
                ? formatAlliance([blue[0]!, blue[1]!])
                : blue.map(String).join(" · ") || "-"}
            </p>
            <p className="mt-6 text-sm text-white/45">Model / score share</p>
            <p className="text-3xl font-semibold text-blue-200/90">
              {Math.round(blueP * 100)}%
            </p>
          </GlassCard>
        </div>

        <GlassCard glow="violet" className="mt-8 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                {winner ? "Result" : "Projection"}
              </p>
              <p className="mt-2 text-2xl font-semibold capitalize">
                {winner
                  ? `${winner === "red" ? "Red" : "Blue"} wins`
                  : `${favored === "red" ? "Red" : "Blue"} favored`}
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70">
              Confidence:{" "}
              <span className="font-medium text-white">{confidence}</span>
            </div>
          </div>
        </GlassCard>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Notes</h2>
          <ul className="mt-4 space-y-3">
            {reasons.map((r) => (
              <li
                key={r}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white/70"
              >
                {r}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PageShell>
  );
}

/** Build stats map from rankings qualAverage */
export function statsMapFromRankings(
  rankings: { teamNumber?: number; qualAverage?: number }[]
): Map<number, TeamEventStats> {
  const m = new Map<number, TeamEventStats>();
  for (const r of rankings) {
    if (r.teamNumber == null || r.qualAverage == null) continue;
    m.set(r.teamNumber, statsFromRanking(r.teamNumber, r.qualAverage));
  }
  return m;
}
