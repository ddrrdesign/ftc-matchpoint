import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { TeamScoutStatCard } from "@/components/matchup/team-scout-stat-card";
import type { QuickStats, ScoutTeam, TeamEventParticipation } from "@/lib/ftc-scout/types";
import { maxOprTotalNp } from "@/lib/ftc-scout/queries";

type Props = {
  team: ScoutTeam;
  stats: QuickStats;
  events: TeamEventParticipation[];
};

export function TeamScoutDetail({ team, stats, events }: Props) {
  const bestOpr = maxOprTotalNp(events);

  const ranked = events
    .filter((e) => e.stats?.rank != null)
    .sort((a, b) => (a.stats?.rank ?? 999) - (b.stats?.rank ?? 999));

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/predictor" className="text-sm text-violet-300/80">
            ← Predictor
          </Link>
          <a
            href={`https://ftcscout.org/teams/${team.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/45 hover:text-white/70"
          >
            Open on FTC Scout ↗
          </a>
        </div>

        <div className="mt-8 max-w-xl">
          <p className="font-mono text-4xl font-semibold tabular-nums">
            {team.number}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{team.name}</h1>
          <p className="mt-2 text-white/55">
            {[team.city, team.state, team.country].filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="mt-10 max-w-md">
          <TeamScoutStatCard
            team={team}
            stats={stats}
            bestOprNp={bestOpr}
          />
        </div>

        <section className="mt-14">
          <h2 className="text-xl font-semibold">Events</h2>
          <p className="mt-1 text-sm text-white/45">
            From FTC Scout - use this to see how a team trended across
            qualifiers.
          </p>
          <div className="mt-4 space-y-2">
            {ranked.length === 0 ? (
              <GlassCard className="p-4 text-sm text-white/50">
                No ranked event stats in API response yet.
              </GlassCard>
            ) : (
              ranked.map((e) => (
                <GlassCard key={e.eventCode} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-mono text-sm text-violet-200/90">
                      {e.eventCode}
                    </p>
                    {e.stats?.opr?.totalPointsNp != null && (
                      <p className="text-xs text-white/45">
                        Event OPR (NP):{" "}
                        <span className="font-mono text-white/70">
                          {e.stats.opr.totalPointsNp.toFixed(1)}
                        </span>
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-white/55">
                    Rank #{e.stats?.rank ?? "-"}
                  </span>
                </GlassCard>
              ))
            )}
          </div>
        </section>

        <GlassCard className="mt-10 p-5 text-sm text-white/55">
          Stats and ranks are from{" "}
          <a
            href="https://ftcscout.org"
            className="text-violet-300 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            FTC Scout
          </a>
          . This app focuses on alliance predictions - go to{" "}
          <Link href="/predictor" className="text-violet-300 hover:underline">
            Predictor
          </Link>{" "}
          to model Red vs Blue.
        </GlassCard>
      </main>
    </PageShell>
  );
}
