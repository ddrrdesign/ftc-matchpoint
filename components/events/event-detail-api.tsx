import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import type {
  MatchResultModelV2,
  SeasonEventModelV2,
  SeasonTeamModelV2,
  TeamRankingModel,
} from "@/lib/ftc-api/types";
import {
  matchHref,
  matchLabel,
  teamsToAlliances,
} from "@/lib/ftc-api/service";
import {
  deriveEventStatus,
  formatEventLocation,
  uiEventStatusLabel,
} from "@/lib/ftc-api/event-status";
import { formatAlliance } from "@/lib/format";
import { allianceStrength, winProbabilities } from "@/lib/prediction";
import { statsMapFromRankings } from "@/components/matches/match-detail";

function statusBadgeUi(s: ReturnType<typeof deriveEventStatus>) {
  const map = {
    live: "border-emerald-400/30 bg-emerald-500/12 text-emerald-200",
    upcoming: "border-blue-400/25 bg-blue-500/12 text-blue-200",
    completed: "border-white/15 bg-white/[0.06] text-white/65",
  } as const;
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${map[s]}`}
    >
      {uiEventStatusLabel(s)}
    </span>
  );
}

type Props = {
  event: SeasonEventModelV2;
  eventCode: string;
  rankings: TeamRankingModel[];
  teams: SeasonTeamModelV2[];
  matches: MatchResultModelV2[];
};

export function EventDetailApi({
  event,
  eventCode,
  rankings,
  teams,
  matches,
}: Props) {
  const status = deriveEventStatus(event);
  const location = formatEventLocation(event);
  const name = event.name ?? eventCode;
  const played = matches.filter(
    (m) =>
      m.scoreRedFinal != null &&
      m.scoreBlueFinal != null &&
      m.actualStartTime
  );
  played.sort((a, b) => {
    const ta = new Date(a.actualStartTime ?? 0).getTime();
    const tb = new Date(b.actualStartTime ?? 0).getTime();
    return tb - ta;
  });
  const latest = played.slice(0, 40);

  const statsMap = statsMapFromRankings(rankings);
  const byRank = [...rankings]
    .filter((r) => r.teamNumber != null)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  const n1 = byRank[0]?.teamNumber;
  const n2 = byRank[1]?.teamNumber;
  const n3 = byRank[2]?.teamNumber;
  const n4 = byRank[3]?.teamNumber;
  let predRed = 0.5;
  let predBlue = 0.5;
  if (
    n1 != null &&
    n2 != null &&
    n3 != null &&
    n4 != null &&
    statsMap.has(n1) &&
    statsMap.has(n2) &&
    statsMap.has(n3) &&
    statsMap.has(n4)
  ) {
    const w = winProbabilities(
      allianceStrength(statsMap.get(n1)!, statsMap.get(n2)!),
      allianceStrength(statsMap.get(n3)!, statsMap.get(n4)!)
    );
    predRed = w.red;
    predBlue = w.blue;
  }

  const topRankings = [...rankings]
    .filter((r) => r.teamNumber != null)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .slice(0, 8);

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-14">
        <div className="mb-8">
          <Link
            href="/events"
            className="text-sm text-violet-300/80 hover:text-violet-200"
          >
            ← All events
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {name}
            </h1>
            {statusBadgeUi(status)}
          </div>
          <p className="mt-2 font-mono text-sm text-violet-300/70">
            {event.code ?? eventCode}
            {event.divisionCode ? (
              <span className="text-white/40"> · {event.divisionCode}</span>
            ) : null}
          </p>
          <p className="mt-1 text-white/50">
            {location}
            {event.dateStart
              ? ` · ${new Date(event.dateStart).toLocaleDateString()}`
              : ""}
            {event.dateEnd
              ? ` – ${new Date(event.dateEnd).toLocaleDateString()}`
              : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a
              href={`https://ftcscout.org/events/${encodeURIComponent(eventCode)}`}
              className="rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-violet-200/95 hover:bg-violet-500/20"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Scout event ↗
            </a>
            <a
              href="https://ftc-events.firstinspires.org/services/API"
              className="rounded-xl border border-white/10 px-3 py-1.5 text-white/55 hover:bg-white/[0.06]"
              target="_blank"
              rel="noopener noreferrer"
            >
              FIRST Events API ↗
            </a>
          </div>
          <p className="mt-3 text-xs text-white/35">
            Match list and scores below come from the FIRST API. Rankings,
            awards, and stream links for past events are often on{" "}
            <a
              href={`https://ftcscout.org/events/${encodeURIComponent(eventCode)}`}
              className="text-violet-400/90 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Scout
            </a>{" "}
            for this code.
          </p>
        </div>

        <nav
          className="mb-10 flex flex-wrap gap-x-4 gap-y-2 border-b border-white/[0.08] pb-3 text-sm text-white/55"
          aria-label="Event sections"
        >
          {(
            [
              ["#matches", "Matches"],
              ["#rankings", "Rankings"],
              ["#teams", "Teams"],
              ["#insights", "Insights"],
              ["#awards", "Awards"],
              ["#links", "Links"],
            ] as const
          ).map(([href, label]) => (
            <a key={href} href={href} className="hover:text-violet-200">
              {label}
            </a>
          ))}
        </nav>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { k: "Teams", v: teams.length },
            { k: "Matches (loaded)", v: matches.length },
            { k: "Played w/ time", v: played.length },
            { k: "Ranked", v: rankings.length },
            { k: "Type", v: event.typeName ?? event.type ?? "-" },
          ].map((x) => (
            <GlassCard key={x.k} className="p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                {x.k}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{x.v}</p>
            </GlassCard>
          ))}
        </div>

        <section id="matches" className="mb-14 scroll-mt-28">
          <h2 className="text-xl font-semibold">Matches</h2>
          <p className="mt-1 text-sm text-white/45">
            Recent completed matches from the FIRST API (newest first).
          </p>
          <GlassCard className="mt-4 overflow-hidden p-0">
            <div className="grid grid-cols-[1fr_1fr_1fr_0.9fr_0.65fr] border-b border-white/[0.07] bg-white/[0.03] px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-white/40 md:px-6">
              <div>Match</div>
              <div>Red</div>
              <div>Blue</div>
              <div>Score</div>
              <div>Winner</div>
            </div>
            {latest.length === 0 ? (
              <div className="px-6 py-8 text-sm text-white/45">
                No completed matches in API response yet.
              </div>
            ) : (
              latest.map((m, i) => {
                const { red, blue } = teamsToAlliances(m.teams);
                const rf = m.scoreRedFinal ?? 0;
                const bf = m.scoreBlueFinal ?? 0;
                const win =
                  rf > bf ? "red" : bf > rf ? "blue" : null;
                return (
                  <Link
                    key={`${m.tournamentLevel}-${m.series}-${m.matchNumber}-${i}`}
                    href={matchHref(eventCode, m)}
                    className="grid grid-cols-[1fr_1fr_1fr_0.9fr_0.65fr] items-center border-b border-white/[0.05] px-4 py-3.5 text-sm transition hover:bg-white/[0.03] md:px-6"
                  >
                    <span className="font-medium text-violet-200/90">
                      {matchLabel(m)}
                    </span>
                    <span className="font-mono text-[12px] text-red-200/80">
                      {red.length >= 2
                        ? formatAlliance([red[0]!, red[1]!])
                        : red.join(" · ")}
                    </span>
                    <span className="font-mono text-[12px] text-blue-200/80">
                      {blue.length >= 2
                        ? formatAlliance([blue[0]!, blue[1]!])
                        : blue.join(" · ")}
                    </span>
                    <span className="tabular-nums text-white/75">
                      {rf} – {bf}
                    </span>
                    <span
                      className={
                        win === "red"
                          ? "text-red-300"
                          : win === "blue"
                            ? "text-blue-300"
                            : "text-white/40"
                      }
                    >
                      {win === "red" ? "Red" : win === "blue" ? "Blue" : "Tie"}
                    </span>
                  </Link>
                );
              })
            )}
          </GlassCard>
        </section>

        <section id="rankings" className="mb-14 scroll-mt-28">
          <h2 className="text-xl font-semibold">Rankings</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {topRankings.length === 0 ? (
              <p className="text-sm text-white/45">No rankings published yet.</p>
            ) : (
              topRankings.map((r) => (
                <GlassCard key={r.teamNumber} className="p-4">
                  <span className="text-white/45">#{r.rank}</span>
                  <p className="mt-2 font-mono text-lg font-medium">
                    {r.teamNumber}
                  </p>
                  <p className="truncate text-sm text-white/55">{r.teamName}</p>
                  <p className="text-sm text-white/45">
                    Qual avg{" "}
                    <span className="tabular-nums text-white/80">
                      {r.qualAverage?.toFixed(1) ?? "-"}
                    </span>
                  </p>
                </GlassCard>
              ))
            )}
          </div>
        </section>

        <section id="teams" className="mb-14 scroll-mt-28">
          <h2 className="text-xl font-semibold">Teams</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teams.slice(0, 48).map((t) => (
              <Link key={t.teamNumber} href={`/teams/${t.teamNumber}`}>
                <GlassCard glow="violet" className="h-full p-4 transition hover:bg-white/[0.06]">
                  <p className="font-mono text-lg font-semibold">
                    {t.teamNumber}
                  </p>
                  <p className="line-clamp-2 text-sm text-white/60">
                    {t.nameShort ?? t.nameFull ?? "-"}
                  </p>
                  <p className="mt-2 text-xs text-white/40">
                    {[t.city, t.stateProv].filter(Boolean).join(", ")}
                  </p>
                </GlassCard>
              </Link>
            ))}
          </div>
          {teams.length > 48 && (
            <p className="mt-3 text-sm text-white/45">
              Showing 48 of {teams.length} teams.
            </p>
          )}
        </section>

        <section id="insights" className="mb-14 scroll-mt-28">
          <h2 className="text-xl font-semibold">Insights</h2>
          <p className="mt-1 text-sm text-white/45">
            Alliance preview: rank 1-2 vs 3-4 using qual average as strength
            proxy.
          </p>
          <GlassCard glow="violet" className="mt-6 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.08] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-red-300/80">
                  Red (ranks 1–2)
                </p>
                <p className="mt-2 font-mono text-lg">
                  {n1 != null && n2 != null
                    ? formatAlliance([n1, n2])
                    : "-"}
                </p>
                <p className="mt-4 text-4xl font-semibold tabular-nums text-red-200">
                  {Math.round(predRed * 100)}%
                </p>
              </div>
              <div className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.08] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-300/80">
                  Blue (ranks 3–4)
                </p>
                <p className="mt-2 font-mono text-lg">
                  {n3 != null && n4 != null
                    ? formatAlliance([n3, n4])
                    : "-"}
                </p>
                <p className="mt-4 text-4xl font-semibold tabular-nums text-blue-200">
                  {Math.round(predBlue * 100)}%
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        <section id="awards" className="mb-14 scroll-mt-28">
          <h2 className="text-xl font-semibold">Awards</h2>
          <GlassCard className="mt-4 p-4 text-sm text-white/55">
            Award results are not in the FIRST Events API feed used here. Open
            the event on{" "}
            <a
              href={`https://ftcscout.org/events/${encodeURIComponent(eventCode)}`}
              className="text-violet-300 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Scout
            </a>{" "}
            for Inspire, Think, and other awards.
          </GlassCard>
        </section>

        <section id="links" className="scroll-mt-28">
          <h2 className="text-xl font-semibold">Streams & links</h2>
          <GlassCard className="mt-4 p-4 text-sm text-white/65">
            For past events, match videos and streams are often linked from the
            event page on{" "}
            <a
              href={`https://ftcscout.org/events/${encodeURIComponent(eventCode)}`}
              className="text-violet-300 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Scout
            </a>
            . FIRST does not expose a single canonical stream URL in this API.
          </GlassCard>
        </section>
      </main>
    </PageShell>
  );
}
