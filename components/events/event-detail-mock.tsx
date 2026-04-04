import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import {
  MOCK_MATCHES_HOME,
  MOCK_RANKINGS_CA,
  MOCK_STATS_CA,
  MOCK_TEAMS,
} from "@/lib/mock-data";
import { allianceStrength, winProbabilities } from "@/lib/prediction";
import { formatAlliance } from "@/lib/format";
import type { Event, EventStatus } from "@/lib/types";
import { uiEventStatusLabel } from "@/lib/ftc-api/event-status";
import { FIRST_FTC_API_DOCS_URL } from "@/lib/ftc-api/event-presentation";

function statusBadge(s: EventStatus) {
  const map: Record<EventStatus, string> = {
    live: "border-emerald-400/30 bg-emerald-500/12 text-emerald-200",
    upcoming: "border-blue-400/25 bg-blue-500/12 text-blue-200",
    completed: "border-white/15 bg-white/[0.06] text-white/65",
  };
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${map[s]}`}
    >
      {uiEventStatusLabel(s)}
    </span>
  );
}

export function EventDetailMock({ event }: { event: Event }) {
  const t27772 = MOCK_STATS_CA.find((s) => s.teamId === "t27772")!;
  const t25002 = MOCK_STATS_CA.find((s) => s.teamId === "t25002")!;
  const t25004 = MOCK_STATS_CA.find((s) => s.teamId === "t25004")!;
  const t25003 = MOCK_STATS_CA.find((s) => s.teamId === "t25003")!;

  const upcomingPreview = {
    red: [27772, 25002] as [number, number],
    blue: [25004, 25003] as [number, number],
  };
  const rS = allianceStrength(t27772, t25002);
  const bS = allianceStrength(t25004, t25003);
  const probs = winProbabilities(rS, bS);

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/events"
              className="text-sm text-violet-300/80 hover:text-violet-200"
            >
              ← All events
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {event.name}
              </h1>
              {statusBadge(event.status)}
            </div>
            <p className="mt-2 font-mono text-sm text-violet-300/70">
              {event.code}
            </p>
            <p className="mt-1 text-white/50">{event.location}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-200/85">
              Sample storyline only — teams and scores are fictional placeholders
              for the UI. For real registrations, rankings, and match results use{" "}
              <a
                href={FIRST_FTC_API_DOCS_URL}
                className="text-violet-300 underline hover:text-violet-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                FIRST FTC Events API
              </a>{" "}
              or{" "}
              <a
                href="https://ftc-events.firstinspires.org/#allevents"
                className="text-violet-300 underline hover:text-violet-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                FTC Event Web
              </a>
              .
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <a
                href={`https://ftcscout.org/events/${encodeURIComponent(event.code)}`}
                className="rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-violet-200/95 hover:bg-violet-500/20"
                target="_blank"
                rel="noopener noreferrer"
              >
                FTC Scout ↗
              </a>
              <a
                href={FIRST_FTC_API_DOCS_URL}
                className="rounded-xl border border-white/10 px-3 py-1.5 text-white/55 hover:bg-white/[0.06]"
                target="_blank"
                rel="noopener noreferrer"
              >
                API docs ↗
              </a>
            </div>
          </div>
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { k: "Teams", v: event.teamCount },
            { k: "Matches", v: event.matchCount },
            { k: "Played", v: Math.floor(event.matchCount * 0.72) },
            { k: "Upcoming", v: Math.ceil(event.matchCount * 0.28) },
            { k: "Predictions", v: event.predictionCount },
          ].map((x) => (
            <GlassCard key={x.k} className="p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                {x.k}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{x.v}</p>
            </GlassCard>
          ))}
        </div>

        <section className="mb-14">
          <h2 className="text-xl font-semibold">Rankings preview</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {MOCK_RANKINGS_CA.map((r) => (
              <GlassCard key={r.rank} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/45">#{r.rank}</span>
                  <span
                    className={
                      r.trend === "up"
                        ? "text-emerald-400"
                        : r.trend === "down"
                          ? "text-red-400"
                          : "text-white/40"
                    }
                  >
                    {r.trend === "up" ? "↑" : r.trend === "down" ? "↓" : "-"}
                  </span>
                </div>
                <p className="mt-2 font-mono text-lg font-medium">
                  {r.teamNumber}
                </p>
                <p className="text-xs text-white/40">
                  {MOCK_TEAMS.find((t) => t.number === r.teamNumber)?.name ??
                    "—"}
                </p>
                <p className="text-sm text-white/45">
                  Avg {r.avgScore}{" "}
                  <span className="text-white/30">pts</span>
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-xl font-semibold">Teams</h2>
          <p className="mt-1 text-sm text-white/45">
            Per-event aggregates - 2v2 alliances use pairs of these strengths.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MOCK_STATS_CA.map((s) => {
              const t = MOCK_TEAMS.find((x) => x.id === s.teamId);
              return (
                <GlassCard key={s.teamId} glow="violet" className="p-5">
                  <p className="font-mono text-lg font-semibold">
                    {t?.number ?? "-"}
                  </p>
                  <p className="text-sm text-white/55">{t?.name}</p>
                  <div className="mt-4 space-y-1.5 text-sm">
                    <div className="flex justify-between text-white/45">
                      <span>Avg total</span>
                      <span className="tabular-nums text-white/85">
                        {s.avgTotal}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/45">
                      <span>Auto</span>
                      <span className="tabular-nums">{s.avgAuto}</span>
                    </div>
                    <div className="flex justify-between text-white/45">
                      <span>Teleop</span>
                      <span className="tabular-nums">{s.avgTeleop}</span>
                    </div>
                    <div className="flex justify-between text-white/45">
                      <span>Endgame</span>
                      <span className="tabular-nums">{s.avgEndgame}</span>
                    </div>
                    <div className="flex justify-between text-white/45">
                      <span>Consistency</span>
                      <span className="tabular-nums">
                        {Math.round(s.consistency * 100)}%
                      </span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>

        <section id="matches" className="mb-14">
          <h2 className="text-xl font-semibold">Latest matches</h2>
          <GlassCard className="mt-4 overflow-hidden p-0">
            <div className="grid grid-cols-[0.7fr_1fr_1fr_0.9fr_0.65fr] border-b border-white/[0.07] bg-white/[0.03] px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-white/40 md:px-6">
              <div>Match</div>
              <div>Red</div>
              <div>Blue</div>
              <div>Score</div>
              <div>Winner</div>
            </div>
            {MOCK_MATCHES_HOME.map((m) => (
              <Link
                key={m.id}
                href={`/matches/demo/${m.slug ?? m.id}`}
                className="grid grid-cols-[0.7fr_1fr_1fr_0.9fr_0.65fr] items-center border-b border-white/[0.05] px-4 py-3.5 text-sm transition hover:bg-white/[0.03] md:px-6"
              >
                <span className="font-medium text-violet-200/90">
                  {m.label}
                </span>
                <span className="font-mono text-[13px] text-red-200/80">
                  {formatAlliance(m.red.teamNumbers)}
                </span>
                <span className="font-mono text-[13px] text-blue-200/80">
                  {formatAlliance(m.blue.teamNumbers)}
                </span>
                <span className="tabular-nums text-white/75">
                  {m.redScore} – {m.blueScore}
                </span>
                <span
                  className={
                    m.winner === "red" ? "text-red-300" : "text-blue-300"
                  }
                >
                  {m.winner === "red" ? "Red" : "Blue"}
                </span>
              </Link>
            ))}
          </GlassCard>
        </section>

        <section className="mb-14">
          <h2 className="text-xl font-semibold">Upcoming — prediction</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/45">
            Demo model: each robot gets a strength score from the sample stats
            card; alliance strength is the sum of partners, then a logistic maps
            the gap to win odds. Tune weights on the real site — this is for
            layout only.
          </p>
          <GlassCard glow="violet" className="mt-6 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.08] p-5 shadow-[0_0_40px_-12px_rgba(239,68,68,0.25)]">
                <p className="text-xs uppercase tracking-[0.2em] text-red-300/80">
                  Red alliance
                </p>
                <p className="mt-2 font-mono text-lg">
                  {formatAlliance(upcomingPreview.red)}
                </p>
                <p className="mt-4 text-4xl font-semibold tabular-nums text-red-200">
                  {Math.round(probs.red * 100)}%
                </p>
                <p className="text-sm text-white/45">Win probability</p>
              </div>
              <div className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.08] p-5 shadow-[0_0_40px_-12px_rgba(59,130,246,0.22)]">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-300/80">
                  Blue alliance
                </p>
                <p className="mt-2 font-mono text-lg">
                  {formatAlliance(upcomingPreview.blue)}
                </p>
                <p className="mt-4 text-4xl font-semibold tabular-nums text-blue-200">
                  {Math.round(probs.blue * 100)}%
                </p>
                <p className="text-sm text-white/45">Win probability</p>
              </div>
            </div>
          </GlassCard>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Event insights</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              "Strongest autonomous split in sample data: 27772 + TalTech-style profiles",
              "Most consistent match-to-match: 25004 Almaty Constructors",
              "Highest combined alliance total in table: Red in QF 38 (27772 & 25001)",
              "Watch 25003: lower average but pairs well with a high-peak partner",
            ].map((line) => (
              <GlassCard key={line} className="p-4 text-sm text-white/70">
                {line}
              </GlassCard>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
