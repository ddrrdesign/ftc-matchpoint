import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { EventAwardsGrid, EventRankingsTable } from "@/components/events/event-rich-blocks";
import type {
  AwardAssignmentModelV2,
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
import {
  FIRST_FTC_API_DOCS_URL,
  eventFormatChips,
  firstEventWebUrl,
  firstSeasonHubUrl,
  formatEventTypeLine,
  formatEventVenueLine,
} from "@/lib/ftc-api/event-presentation";
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

export type EventDivisionSlice = {
  code: string;
  meta: SeasonEventModelV2;
  rankings: TeamRankingModel[];
  awards: AwardAssignmentModelV2[];
};

type Props = {
  seasonYear: number;
  event: SeasonEventModelV2;
  eventCode: string;
  divisions: EventDivisionSlice[];
  teams: SeasonTeamModelV2[];
  matches: MatchResultModelV2[];
};

function divisionLabel(d: EventDivisionSlice): string {
  const div = d.meta.divisionCode?.trim();
  if (div) return div;
  return d.meta.name?.trim() || d.code;
}

export function EventDetailApi({
  seasonYear,
  event,
  eventCode,
  divisions,
  teams,
  matches,
}: Props) {
  const status = deriveEventStatus(event);
  const location = formatEventLocation(event);
  const venueLine = formatEventVenueLine(event);
  const typeLine = formatEventTypeLine(event);
  const formatChips = eventFormatChips(event);
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
  const latest = played.slice(0, 50);

  const rankingsForPreview =
    divisions.find((d) => d.rankings.length > 0)?.rankings ??
    divisions[0]?.rankings ??
    [];

  const statsMap = statsMapFromRankings(rankingsForPreview);
  const byRank = [...rankingsForPreview]
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

  const totalRankRows = divisions.reduce((a, d) => a + d.rankings.length, 0);
  const totalAwards = divisions.reduce((a, d) => a + d.awards.length, 0);
  const multiDiv = divisions.length > 1;

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-14">
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/50 via-[#0a0614] to-[#05030a] p-6 shadow-[0_0_80px_-30px_rgba(139,92,246,0.45)] sm:p-8">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl"
            aria-hidden
          />
          <Link
            href="/events"
            className="relative text-sm text-violet-300/80 hover:text-violet-200"
          >
            ← All events
          </Link>
          <div className="relative mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {name}
            </h1>
            {statusBadgeUi(status)}
          </div>
          <p className="relative mt-2 font-mono text-sm text-violet-300/70">
            {event.code ?? eventCode}
            {event.divisionCode ? (
              <span className="text-white/40"> · {event.divisionCode}</span>
            ) : null}
          </p>
          {event.regionCode ? (
            <p className="relative mt-1 text-xs uppercase tracking-wider text-white/40">
              Region {event.regionCode}
            </p>
          ) : null}
          <p className="relative mt-2 text-lg text-white/70">{location}</p>
          {event.address?.trim() ? (
            <p className="relative mt-1 text-sm text-white/45">
              {event.address}
            </p>
          ) : null}
          {venueLine && venueLine !== location ? (
            <p className="relative mt-1 text-sm text-white/40">
              <span className="text-white/30">Venue: </span>
              {venueLine}
            </p>
          ) : null}
          <p className="relative mt-3 text-sm text-violet-200/75">{typeLine}</p>
          {formatChips.length > 0 ? (
            <p className="relative mt-2 flex flex-wrap gap-2">
              {formatChips.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-white/65"
                >
                  {c}
                </span>
              ))}
            </p>
          ) : null}
          <div className="relative mt-5 flex flex-wrap gap-2.5 text-sm">
            <a
              href={firstEventWebUrl(seasonYear, eventCode)}
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 font-medium text-emerald-100 hover:bg-emerald-500/25"
              target="_blank"
              rel="noopener noreferrer"
            >
              FIRST Event Web ↗
            </a>
            {event.liveStreamUrl?.trim() ? (
              <a
                href={event.liveStreamUrl}
                className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-2 font-medium text-red-100 hover:bg-red-500/25"
                target="_blank"
                rel="noopener noreferrer"
              >
                Live stream ↗
              </a>
            ) : null}
            {event.website?.trim() ? (
              <a
                href={event.website}
                className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-white/80 hover:bg-white/[0.1]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Event website ↗
              </a>
            ) : null}
            <a
              href={firstSeasonHubUrl(seasonYear)}
              className="rounded-xl border border-white/10 px-4 py-2 text-white/60 hover:bg-white/[0.06]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Season hub ↗
            </a>
            <a
              href={`https://ftcscout.org/events/${encodeURIComponent(eventCode)}`}
              className="rounded-xl border border-violet-400/25 bg-violet-500/15 px-4 py-2 text-violet-100 hover:bg-violet-500/25"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Scout ↗
            </a>
            <a
              href={FIRST_FTC_API_DOCS_URL}
              className="rounded-xl border border-white/10 px-4 py-2 text-white/55 hover:bg-white/[0.06]"
              target="_blank"
              rel="noopener noreferrer"
            >
              API docs ↗
            </a>
          </div>
          <p className="relative mt-4 max-w-2xl text-xs leading-relaxed text-white/40">
            Data below is loaded from the{" "}
            <a
              href={FIRST_FTC_API_DOCS_URL}
              className="text-violet-400/90 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FIRST FTC Events API
            </a>
            : qualification rankings, awards, matches, and team list. OPR and
            community analytics are often deeper on{" "}
            <a
              href={`https://ftcscout.org/events/${encodeURIComponent(eventCode)}`}
              className="text-violet-400/90 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Scout
            </a>
            .
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
              ["#links", "Streams"],
            ] as const
          ).map(([href, label]) => (
            <a key={href} href={href} className="hover:text-violet-200">
              {label}
            </a>
          ))}
        </nav>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { k: "Teams", v: teams.length },
            { k: "Matches loaded", v: matches.length },
            { k: "Played (timed)", v: played.length },
            { k: "Ranking rows", v: totalRankRows },
            { k: "Awards", v: totalAwards },
            {
              k: "Divisions",
              v: multiDiv ? divisions.length : 1,
            },
          ].map((x) => (
            <GlassCard
              key={x.k}
              className="border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent p-5"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                {x.k}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-white/95">
                {x.v}
              </p>
            </GlassCard>
          ))}
        </div>

        <section id="matches" className="mb-14 scroll-mt-28">
          <h2 className="text-xl font-semibold">Matches</h2>
          <p className="mt-1 text-sm text-white/45">
            Completed matches from the FIRST API (newest first, up to 50).
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
                const win = rf > bf ? "red" : bf > rf ? "blue" : null;
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
          <h2 className="text-xl font-semibold">Qualification rankings</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/45">
            Full qualification table from FIRST (per division when the API
            returns multiple event codes for this championship).
          </p>
          <div className="mt-6 space-y-10">
            {divisions.map((d) => (
              <div key={d.code}>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-medium text-white/90">
                    {divisionLabel(d)}
                  </h3>
                  <span className="font-mono text-xs text-white/40">
                    {d.code}
                  </span>
                </div>
                <EventRankingsTable
                  rankings={d.rankings}
                  divisionTitle={divisionLabel(d)}
                />
              </div>
            ))}
          </div>
        </section>

        <section id="teams" className="mb-14 scroll-mt-28">
          <h2 className="text-xl font-semibold">Teams</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/45">
            Registered for this event code per FIRST team list API. Tap a number
            for Scout stats when available.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teams.slice(0, 72).map((t) => (
              <Link key={t.teamNumber} href={`/teams/${t.teamNumber}`}>
                <GlassCard
                  glow="violet"
                  className="h-full border-white/[0.07] p-4 transition hover:border-violet-400/30 hover:bg-white/[0.06]"
                >
                  <p className="font-mono text-lg font-semibold text-violet-100">
                    {t.teamNumber}
                  </p>
                  <p className="line-clamp-2 text-sm font-medium text-white/80">
                    {t.nameShort ?? t.nameFull ?? "-"}
                  </p>
                  {t.nameFull &&
                  t.nameShort &&
                  t.nameFull.trim() !== t.nameShort.trim() ? (
                    <p className="mt-1 line-clamp-2 text-xs text-white/40">
                      {t.nameFull}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-white/45">
                    {[t.city, t.stateProv, t.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </GlassCard>
              </Link>
            ))}
          </div>
          {teams.length > 72 && (
            <p className="mt-3 text-sm text-white/45">
              Showing 72 of {teams.length} teams.
            </p>
          )}
        </section>

        <section id="insights" className="mb-14 scroll-mt-28">
          <h2 className="text-xl font-semibold">Insights</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/45">
            Toy preview: ranks #1–#2 vs #3–#4 on the first division that has
            rankings, using qual average as strength — same logistic as the home
            demo. Not a replacement for real scouting.
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
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/45">
            From{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
              /v2.0/&#123;season&#125;/awards/&#123;eventCode&#125;
            </code>{" "}
            — Inspire, Think, Connect, Dean’s List, and other official winners.
          </p>
          <div className="mt-6 space-y-10">
            {divisions.map((d) => (
              <div key={`aw-${d.code}`}>
                {multiDiv ? (
                  <h3 className="mb-4 text-lg font-medium text-white/90">
                    {divisionLabel(d)}{" "}
                    <span className="font-mono text-sm font-normal text-white/40">
                      ({d.code})
                    </span>
                  </h3>
                ) : null}
                <EventAwardsGrid awards={d.awards} />
              </div>
            ))}
          </div>
        </section>

        <section id="links" className="scroll-mt-28">
          <h2 className="text-xl font-semibold">Streams & extra links</h2>
          <GlassCard className="mt-4 space-y-3 p-5 text-sm text-white/65">
            {event.liveStreamUrl?.trim() ? (
              <p>
                <span className="text-white/45">Primary stream: </span>
                <a
                  href={event.liveStreamUrl}
                  className="text-violet-300 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {event.liveStreamUrl}
                </a>
              </p>
            ) : null}
            {event.webcasts?.length ? (
              <ul className="list-inside list-disc space-y-1 text-white/55">
                {event.webcasts.map((w) => (
                  <li key={w}>
                    <a
                      href={w}
                      className="text-violet-300 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {w}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            {!event.liveStreamUrl?.trim() &&
            (!event.webcasts || event.webcasts.length === 0) ? (
              <p>
                No stream URLs in this API payload — check{" "}
                <a
                  href={firstEventWebUrl(seasonYear, eventCode)}
                  className="text-violet-300 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FIRST Event Web
                </a>{" "}
                or{" "}
                <a
                  href={`https://ftcscout.org/events/${encodeURIComponent(eventCode)}`}
                  className="text-violet-300 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FTC Scout
                </a>
                .
              </p>
            ) : null}
          </GlassCard>
        </section>
      </main>
    </PageShell>
  );
}
