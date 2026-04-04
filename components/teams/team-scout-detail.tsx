import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { TeamScoutStatCard } from "@/components/matchup/team-scout-stat-card";
import { formatFtcSeasonRangeLabel } from "@/lib/ftc-api/season-label";
import type {
  QuickStats,
  ScoutEventListItem,
  ScoutTeam,
  TeamEventParticipation,
} from "@/lib/ftc-scout/types";
import { maxOprTotalNp } from "@/lib/ftc-scout/queries";

const MAX_EVENT_ROWS = 24;
const EVENT_ANALYTICS_HASH = "#event-overview";

const chipBase =
  "touch-manipulation inline-flex min-h-[40px] shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold tabular-nums transition-colors sm:min-h-0 sm:px-3 sm:py-1.5";

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
  /** All participations across loaded Scout seasons (deduped). */
  events: TeamEventParticipation[];
  eventCatalog: ScoutEventListItem[];
  /** Season used for the quick-stats card (URL or default). */
  selectedSeason: number;
  /** “Current” Scout season for ordering and copy. */
  anchorSeason: number;
  /** Years shown in the season picker (newest first). */
  seasonPickerYears: number[];
};

export function TeamScoutDetail({
  team,
  stats,
  events,
  eventCatalog,
  selectedSeason,
  anchorSeason,
  seasonPickerYears,
}: Props) {
  const bestOpr = maxOprTotalNp(events);
  const lookup = catalogLookup(eventCatalog);

  const enriched = [...events].map((p) => {
    const meta = lookup(p.season, p.eventCode ?? "");
    const start = meta?.start?.trim() ?? "";
    const name = meta?.name?.trim() || null;
    const seasonY = p.season ?? 0;
    const anchorFirst = seasonY === anchorSeason ? 1 : 0;
    return { p, start, name, seasonY, anchorFirst };
  });

  enriched.sort((a, b) => {
    if (b.anchorFirst !== a.anchorFirst) return b.anchorFirst - a.anchorFirst;
    if (a.start && b.start) return b.start.localeCompare(a.start);
    if (a.start) return -1;
    if (b.start) return 1;
    return (b.p.eventCode ?? "").localeCompare(a.p.eventCode ?? "");
  });

  const seen = new Set<string>();
  const rows: typeof enriched = [];
  for (const row of enriched) {
    const k = `${row.p.season}:${(row.p.eventCode ?? "").trim().toLowerCase()}`;
    if (seen.has(k)) continue;
    seen.add(k);
    rows.push(row);
    if (rows.length >= MAX_EVENT_ROWS) break;
  }

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/teams" className="text-sm text-violet-300/80">
            ← Teams
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

        <section className="mt-8 max-w-2xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/35">
            Scout season (stats card)
          </p>
          <p className="mt-1 text-sm text-white/45">
            Pick a year to refresh Total NP / phase breakdown. Events below list
            every season we loaded (current season first, then by date).
          </p>
          <div className="mt-3 flex w-full min-w-0 max-w-full flex-wrap gap-2">
            {seasonPickerYears.map((y) => {
              const on = y === selectedSeason;
              return (
                <Link
                  key={y}
                  prefetch
                  href={`/teams/${team.number}?season=${y}`}
                  className={`${chipBase} ${
                    on
                      ? "border-violet-400/50 bg-violet-500/25 text-violet-50"
                      : "border-white/14 bg-white/[0.06] text-white/75 hover:border-white/22 hover:bg-white/[0.1]"
                  }`}
                >
                  {formatFtcSeasonRangeLabel(y)}
                </Link>
              );
            })}
          </div>
        </section>

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
            Tap a row for in-app analytics on FIRST data. Your team stays{" "}
            <span className="text-violet-200/90">highlighted</span> on that page.
          </p>
          <div className="mt-4 space-y-5">
            {rows.length === 0 ? (
              <GlassCard className="p-4 text-sm text-white/50">
                No event participation in FTC Scout for the seasons we checked.
                Try another year above or confirm the team number.
              </GlassCard>
            ) : (
              rows
                .filter(({ p }) => (p.eventCode ?? "").trim().length > 0)
                .map(({ p: e, name, start, seasonY }) => {
                const code = (e.eventCode ?? "").trim();
                const href = `/events/${encodeURIComponent(code)}?season=${encodeURIComponent(String(seasonY))}&focusTeam=${encodeURIComponent(String(team.number))}${EVENT_ANALYTICS_HASH}`;
                return (
                  <Link
                    key={`${seasonY}-${code}`}
                    prefetch
                    href={href}
                    className="perf-list-row block"
                  >
                    <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-violet-400/25 hover:bg-white/[0.04]">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug text-white/90">
                          {name ?? code}
                        </p>
                        {start ? (
                          <p className="mt-0.5 text-xs text-white/38">{start}</p>
                        ) : null}
                        <p className="mt-1 font-mono text-xs text-white/40">
                          {name ? `${code} · ` : ""}
                          {formatFtcSeasonRangeLabel(seasonY)}
                          {seasonY === anchorSeason ? (
                            <span className="ml-1.5 text-violet-300/80">
                              · current season
                            </span>
                          ) : null}
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
                      ) : (
                        <span className="shrink-0 text-xs text-violet-300/70">
                          Analytics →
                        </span>
                      )}
                    </GlassCard>
                  </Link>
                );
              })
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
              Predictions
            </Link>
            .
          </p>
        </GlassCard>
      </main>
    </PageShell>
  );
}
