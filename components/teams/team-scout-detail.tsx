import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { TeamScoutStatCard } from "@/components/matchup/team-scout-stat-card";
import type {
  QuickStats,
  ScoutEventListItem,
  ScoutTeam,
  TeamEventParticipation,
} from "@/lib/ftc-scout/types";
import { maxOprTotalNp } from "@/lib/ftc-scout/queries";

const MAX_RECENT_EVENTS = 12;

function catalogLookup(catalog: ScoutEventListItem[]) {
  const map = new Map<string, ScoutEventListItem>();
  for (const e of catalog) {
    const k = `${e.season}:${(e.code ?? "").trim().toLowerCase()}`;
    if (!map.has(k)) map.set(k, e);
  }
  return (season: number, code: string) =>
    map.get(`${season}:${code.trim().toLowerCase()}`);
}

type Props = {
  team: ScoutTeam;
  stats: QuickStats;
  events: TeamEventParticipation[];
  eventCatalog: ScoutEventListItem[];
};

export function TeamScoutDetail({ team, stats, events, eventCatalog }: Props) {
  const bestOpr = maxOprTotalNp(events);
  const lookup = catalogLookup(eventCatalog);

  const sorted = [...events]
    .map((p) => {
      const meta = lookup(p.season, p.eventCode);
      const start = meta?.start?.trim() ?? "";
      const name = meta?.name?.trim() || null;
      return { p, start, name };
    })
    .sort((a, b) => {
      if (a.start && b.start) return b.start.localeCompare(a.start);
      if (a.start) return -1;
      if (b.start) return 1;
      return (b.p.eventCode ?? "").localeCompare(a.p.eventCode ?? "");
    });

  const seen = new Set<string>();
  const recentRows: typeof sorted = [];
  for (const row of sorted) {
    const k = `${row.p.season}:${(row.p.eventCode ?? "").trim().toLowerCase()}`;
    if (seen.has(k)) continue;
    seen.add(k);
    recentRows.push(row);
    if (recentRows.length >= MAX_RECENT_EVENTS) break;
  }

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/predictions" className="text-sm text-violet-300/80">
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
          <h2 className="text-xl font-semibold">Recent events</h2>
          <p className="mt-1 text-sm text-white/45">
            Up to {MAX_RECENT_EVENTS} most recent competitions by start date on
            FTC Scout (not by rank). Names come from the event catalog; code
            shown small for reference.
          </p>
          <div className="mt-4 space-y-2">
            {events.length === 0 ? (
              <GlassCard className="p-4 text-sm text-white/50">
                No event participation in Scout for this season yet.
              </GlassCard>
            ) : (
              recentRows.map(({ p: e, name, start }) => (
                <GlassCard
                  key={`${e.season}-${e.eventCode}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug text-white/90">
                      {name ?? e.eventCode}
                    </p>
                    {start ? (
                      <p className="mt-0.5 text-xs text-white/38">{start}</p>
                    ) : null}
                    <p className="mt-1 font-mono text-xs text-white/40">
                      {name ? `${e.eventCode} · ` : ""}season {e.season}
                    </p>
                    {e.stats?.opr?.totalPointsNp != null && (
                      <p className="mt-1 text-xs text-white/45">
                        Event OPR (NP):{" "}
                        <span className="font-mono text-white/70">
                          {e.stats.opr.totalPointsNp.toFixed(1)}
                        </span>
                      </p>
                    )}
                  </div>
                  {e.stats?.rank != null ? (
                    <span className="shrink-0 text-sm tabular-nums text-white/55">
                      Qual rank #{e.stats.rank}
                    </span>
                  ) : null}
                </GlassCard>
              ))
            )}
          </div>
        </section>

        <GlassCard className="mt-10 space-y-2 p-5 text-sm text-white/55">
          <p>
            Stats and ranks are from{" "}
            <a
              href="https://ftcscout.org"
              className="text-violet-300 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              FTC Scout
            </a>
            . Official registration and event lists live on{" "}
            <a
              href="https://ftc-events.firstinspires.org/#allevents"
              className="text-violet-300 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              FTC Event Web
            </a>
            .
          </p>
          <p>
            For Red vs Blue odds from the same Scout slice, open{" "}
            <Link href="/predictions" className="text-violet-300 hover:underline">
              Predictor
            </Link>
            .
          </p>
        </GlassCard>
      </main>
    </PageShell>
  );
}
