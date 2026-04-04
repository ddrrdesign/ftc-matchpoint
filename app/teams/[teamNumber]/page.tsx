import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { TeamScoutDetail } from "@/components/teams/team-scout-detail";
import { MOCK_STATS_CA, MOCK_TEAMS } from "@/lib/mock-data";
import { formatAlliance } from "@/lib/format";
import { getFtcSeasonYear, isFtcApiConfigured } from "@/lib/ftc-api/env";
import {
  FIRST_FTC_API_DOCS_URL,
  firstSeasonHubUrl,
} from "@/lib/ftc-api/event-presentation";
import { fetchTeamByNumber } from "@/lib/ftc-api/service";
import { getFtcScoutSeason } from "@/lib/ftc-scout/env";
import {
  fetchQuickStats,
  fetchScoutEventsSearch,
  fetchScoutTeam,
  fetchTeamEvents,
} from "@/lib/ftc-scout/queries";

type Props = { params: Promise<{ teamNumber: string }> };

export default async function TeamDetailPage({ params }: Props) {
  const { teamNumber } = await params;
  const n = Number.parseInt(teamNumber, 10);
  if (Number.isNaN(n)) notFound();

  const season = getFtcScoutSeason();
  const [scoutTeam, scoutQs, scoutEv, catalogRes] = await Promise.all([
    fetchScoutTeam(n),
    fetchQuickStats(n, season),
    fetchTeamEvents(n, season),
    fetchScoutEventsSearch(season),
  ]);

  if (scoutTeam.ok && scoutQs.ok) {
    return (
      <TeamScoutDetail
        team={scoutTeam.data}
        stats={scoutQs.data}
        events={scoutEv.ok ? scoutEv.data : []}
        eventCatalog={catalogRes.ok ? catalogRes.data : []}
      />
    );
  }

  const team = MOCK_TEAMS.find((t) => t.number === n);
  const stats = MOCK_STATS_CA.find(
    (s) => MOCK_TEAMS.find((x) => x.id === s.teamId)?.number === n
  );

  if (!team || !stats) {
    if (isFtcApiConfigured()) {
      const res = await fetchTeamByNumber(getFtcSeasonYear(), n);
      const apiTeam = res?.ok ? res.data.teams?.[0] : undefined;
      if (apiTeam) {
        return (
          <PageShell>
            <SiteHeader />
            <main className="mx-auto max-w-3xl px-6 py-16">
              <Link href="/events" className="text-sm text-violet-300/80">
                ← Events
              </Link>
              <p className="mt-6 font-mono text-4xl font-semibold">
                {apiTeam.teamNumber ?? n}
              </p>
              <h1 className="mt-2 text-2xl font-semibold">
                {apiTeam.nameShort ?? apiTeam.nameFull ?? "FTC Team"}
              </h1>
              <p className="mt-3 text-white/55">
                {[apiTeam.city, apiTeam.stateProv, apiTeam.country]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
              <GlassCard className="mt-8 space-y-3 p-5 text-sm text-white/65">
                <p>
                  This page shows{" "}
                  <span className="font-medium text-white/85">
                    official registration fields
                  </span>{" "}
                  from the FIRST FTC Events API (team list search). We could not
                  load FTC Scout quick stats for this number — try Scout directly
                  or confirm the team is active this season.
                </p>
                <p className="text-xs text-white/40">
                  Season hub:{" "}
                  <a
                    href={firstSeasonHubUrl(getFtcSeasonYear())}
                    className="text-violet-300 underline hover:text-violet-200"
                    target="_blank"
                    rel="noreferrer"
                  >
                    FTC Event Web
                  </a>
                  · API:{" "}
                  <a
                    href={FIRST_FTC_API_DOCS_URL}
                    className="text-violet-300 underline hover:text-violet-200"
                    target="_blank"
                    rel="noreferrer"
                  >
                    docs
                  </a>
                </p>
              </GlassCard>
              <Link
                href={`/events?q=${n}`}
                className="mt-6 inline-flex rounded-xl border border-violet-400/30 bg-violet-500/15 px-4 py-2.5 text-sm font-medium text-violet-100"
              >
                Search events for this team
              </Link>
            </main>
          </PageShell>
        );
      }
    }

    return (
      <PageShell>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-20">
          <h1 className="text-2xl font-semibold">Team {n}</h1>
          <p className="mt-4 text-white/55">
            No FTC Scout data for this number. Try{" "}
            <Link href="/teams?q=27772" className="text-violet-300 hover:underline">
              team search
            </Link>
            ,{" "}
            <Link href="/predictor" className="text-violet-300 hover:underline">
              Predictor
            </Link>
            , or check the number on{" "}
            <a
              href={`https://ftcscout.org/teams/${n}`}
              className="text-violet-300 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              FTC Scout
            </a>
            .
          </p>
        </main>
      </PageShell>
    );
  }

  const recent = [
    {
      allies: [25001, 27772],
      opp: [25002, 25003],
      score: "214 – 186",
      result: "W" as const,
    },
    {
      allies: [27772, 25003],
      opp: [25004, 25001],
      score: "196 – 208",
      result: "L" as const,
    },
  ];

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <Link href="/predictor" className="text-sm text-violet-300/80">
          ← Predictor
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-3xl font-semibold">{team.number}</p>
            <h1 className="mt-1 text-2xl font-semibold">{team.name}</h1>
            {team.region && (
              <p className="mt-2 text-sm text-white/45">{team.region}</p>
            )}
          </div>
          <p className="text-xs text-amber-200/80">
            Demo sandbox - live teams use FTC Scout above.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "Avg total", v: stats.avgTotal },
            { k: "Avg auto", v: stats.avgAuto },
            { k: "Avg teleop", v: stats.avgTeleop },
            { k: "Avg endgame", v: stats.avgEndgame },
          ].map((x) => (
            <GlassCard key={x.k} glow="violet" className="p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                {x.k}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{x.v}</p>
            </GlassCard>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <GlassCard className="p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              Consistency
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {Math.round(stats.consistency * 100)}%
            </p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              Recent form
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {stats.recentForm >= 0 ? "+" : ""}
              {(stats.recentForm * 100).toFixed(0)} vs event avg
            </p>
          </GlassCard>
        </div>

        <section className="mt-14">
          <h2 className="text-xl font-semibold">Recent matches (sample)</h2>
          <div className="mt-4 space-y-3">
            {recent.map((m, i) => (
              <GlassCard
                key={i}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="text-xs text-white/45">Alliance</p>
                  <p className="font-mono text-sm text-white/90">
                    {formatAlliance(m.allies as [number, number])}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/45">vs</p>
                  <p className="font-mono text-sm text-white/70">
                    {formatAlliance(m.opp as [number, number])}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums text-white/80">{m.score}</p>
                  <p
                    className={
                      m.result === "W" ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {m.result}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <GlassCard glow="violet" className="mt-10 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Insight
          </p>
          <p className="mt-3 text-white/75">
            Strong autonomous contributor at this event; pairs well with a
            steady teleop partner for consistent playoff alliances.
          </p>
        </GlassCard>
      </main>
    </PageShell>
  );
}
