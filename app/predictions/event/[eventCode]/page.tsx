import Link from "next/link";
import { notFound } from "next/navigation";
import { AllianceScoutDeepDive } from "@/components/predictions/alliance-scout-deep-dive";
import { connection } from "next/server";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getFtcSeasonYear,
  isFtcApiConfigured,
  parseFtcSeasonQueryParam,
} from "@/lib/ftc-api/env";
import { firstEventWebUrl } from "@/lib/ftc-api/event-presentation";
import { formatFtcSeasonRangeLabel } from "@/lib/ftc-api/season-label";
import { deriveEventStatus, formatEventLocation } from "@/lib/ftc-api/event-status";
import {
  fetchAllMatchesForEvent,
  fetchEventDetailContext,
  fetchRankings,
  fetchTeamsAtEvent,
} from "@/lib/ftc-api/service";
import {
  allianceScoresByTeam,
  avgMatchesPerTeamOnRoster,
  buildEventStatsMap,
  countPlayedMatches,
  predictAllianceMatchup,
} from "@/lib/predictions/event-prediction";
import {
  alliancesQueryComplete,
  alliancesQueryTouched,
  defaultAllianceFieldValues,
  parseAlliancesFromQuery,
  swapAlliancesQueryString,
  type AllianceQuery,
} from "@/lib/predictions/alliance-params";

/** Align with match/ranking cache; page still feels fresh for live events. */
export const revalidate = 120;

function firstStr(
  v: string | string[] | undefined
): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? "";
  return "";
}

function richnessLabel(r: string): string {
  switch (r) {
    case "sparse":
      return "Early event — few matches in the API; probabilities stay close to 50/50.";
    case "moderate":
      return "Building data — qual matches are filling in; treat edges as directional.";
    case "rich":
      return "Deep sample — many played matches; model confidence can run higher.";
    default:
      return "";
  }
}

type Search = {
  season?: string | string[];
  r?: string | string[];
  b?: string | string[];
  r1?: string | string[];
  r2?: string | string[];
  b1?: string | string[];
  b2?: string | string[];
};

export default async function EventPredictionPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventCode: string }>;
  searchParams: Promise<Search>;
}) {
  await connection();
  if (!isFtcApiConfigured()) {
    return (
      <PageShell>
        <SiteHeader />
        <main className="mx-auto min-w-0 max-w-lg px-3 py-12 sm:px-4 sm:py-16">
          <GlassCard className="p-6 text-sm text-white/70">
            <p>FIRST API keys are required for event-scoped predictions.</p>
            <p className="mt-3 text-white/55">
              Full setup (keys, Vercel, verification) is on{" "}
              <Link
                href="/predictions#first-api-setup"
                className="font-medium text-violet-300 hover:underline"
              >
                Predictions → “How to connect the FIRST Events API”
              </Link>
              .
            </p>
            <Link
              href="/predictions#event-analysis"
              className="mt-4 inline-block text-violet-300 hover:underline"
            >
              ← Back to Predictions
            </Link>
          </GlassCard>
        </main>
      </PageShell>
    );
  }

  const { eventCode: rawCode } = await params;
  const code = decodeURIComponent(rawCode);
  const sp = await searchParams;
  const seasonRaw =
    typeof sp.season === "string"
      ? sp.season
      : Array.isArray(sp.season)
        ? sp.season[0]
        : "";
  const seasonQ = parseFtcSeasonQueryParam(seasonRaw);
  const preferred = seasonQ ?? getFtcSeasonYear();
  const ctx = await fetchEventDetailContext(code, preferred);
  if (!ctx) notFound();

  const { season, ev } = ctx;
  const eventCode = (ev.code ?? code).trim();
  const name = (ev.name ?? eventCode).trim() || eventCode;
  const location = formatEventLocation(ev);
  const status = deriveEventStatus(ev);

  const [teamsList, rankRes, matches] = await Promise.all([
    fetchTeamsAtEvent(season, eventCode),
    fetchRankings(season, eventCode),
    fetchAllMatchesForEvent(season, eventCode),
  ]);

  const registered = teamsList
    .map((t) => t.teamNumber)
    .filter((n): n is number => n != null && n > 0);
  const roster = new Set(registered);
  const rankings = rankRes?.ok ? (rankRes.data.rankings ?? []) : [];
  const played = countPlayedMatches(matches);
  const statsMap = buildEventStatsMap(rankings, matches, registered);
  const scoresByTeam = allianceScoresByTeam(matches);
  const avgTeamMatches = avgMatchesPerTeamOnRoster(scoresByTeam, registered);

  const aq: AllianceQuery = {
    r: firstStr(sp.r),
    b: firstStr(sp.b),
    r1: firstStr(sp.r1),
    r2: firstStr(sp.r2),
    b1: firstStr(sp.b1),
    b2: firstStr(sp.b2),
  };
  const fieldDefaults = defaultAllianceFieldValues(aq);
  const { red, blue } = parseAlliancesFromQuery(aq);
  const tried = alliancesQueryTouched(aq);

  let invalidMsg: string | null = null;
  let prediction = null;

  if (red && blue) {
    const outsiders = [...red, ...blue].filter((n) => !roster.has(n));
    if (outsiders.length > 0) {
      invalidMsg = `Not registered at this event: ${outsiders.join(", ")}. Only teams on the official list can be used.`;
    } else {
      prediction = predictAllianceMatchup(
        [red[0]!, red[1]!],
        [blue[0]!, blue[1]!],
        statsMap,
        played,
        avgTeamMatches
      );
    }
  } else if (tried && !alliancesQueryComplete(aq)) {
    invalidMsg =
      "Enter four valid team numbers — one per field (legacy ?r=…&b=… pairs still work).";
  }

  const formAction = `/predictions/event/${encodeURIComponent(eventCode)}`;
  const firstUrl = firstEventWebUrl(season, eventCode);

  const seasonQs = new URLSearchParams();
  seasonQs.set("season", String(season));
  const resetHref = `${formAction}?${seasonQs.toString()}`;
  const swapHref =
    red && blue
      ? (() => {
          const p = new URLSearchParams(seasonQs);
          for (const [k, v] of new URLSearchParams(
            swapAlliancesQueryString(red, blue)
          )) {
            p.set(k, v);
          }
          return `${formAction}?${p.toString()}`;
        })()
      : resetHref;

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto min-w-0 w-full max-w-7xl flex-1 overflow-x-hidden px-3 py-8 sm:px-6 sm:py-12 md:py-16">
        <Link
          href="/predictions#event-analysis"
          className="inline-flex min-h-[44px] items-center text-sm text-violet-300/80 hover:text-violet-200"
        >
          ← All predictions
        </Link>

        <div className="mt-4 max-w-3xl min-w-0 sm:mt-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">
            Event analysis · {formatFtcSeasonRangeLabel(season)}
          </p>
          <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            {name}
          </h1>
          <p className="mt-1 break-all font-mono text-xs text-violet-300/75 sm:text-sm">
            {eventCode}
          </p>
          <p className="mt-2 break-words text-sm text-white/50">{location}</p>
          <p className="mt-3 text-xs leading-relaxed text-white/40">
            {played} matches with scores in API · status: {status}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <a
              href={firstUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/12 px-4 py-2.5 text-sm font-medium text-violet-200/95 hover:bg-violet-500/22 sm:min-h-0 sm:justify-start"
            >
              FIRST Event Web ↗
            </a>
            <a
              href={`https://ftcscout.org/events/${season}/${encodeURIComponent(eventCode)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/12 px-4 py-2.5 text-sm font-medium text-sky-100/95 hover:bg-sky-500/22 sm:min-h-0 sm:justify-start"
            >
              FTC Scout ↗
            </a>
          </div>
        </div>

        <GlassCard className="mt-8 max-w-2xl border-white/[0.08] p-4 text-sm text-white/60 sm:mt-10 sm:p-5">
          <p className="font-medium text-white/80">How this model behaves</p>
          <ul className="mt-3 list-inside list-disc space-y-1.5">
            <li>
              Team strength uses qualification averages when published; otherwise
              average alliance scores from all qual and playoff matches returned by
              the API (results are fetched in full match-number windows, not only the
              first chunk).
            </li>
            <li>
              Win % starts near 50/50 and only separates as match volume grows
              (sparse → moderate → rich).
            </li>
            <li>
              Playoff alliances use the same strength signals — update the page after
              each batch of API results for fresher numbers.
            </li>
          </ul>
        </GlassCard>

        <form className="mt-8 max-w-xl space-y-4 sm:mt-10" action={formAction} method="get">
          <input type="hidden" name="season" value={String(season)} />
          <div className="space-y-4">
            <div className="rounded-2xl border border-red-400/25 bg-red-500/[0.06] p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-200/75">
                Red alliance
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="ev-r1" className="text-xs text-red-200/70">
                    Team 1
                  </label>
                  <input
                    id="ev-r1"
                    name="r1"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    defaultValue={fieldDefaults.r1}
                    placeholder="Team number"
                    className="mt-1.5 min-h-[48px] w-full rounded-xl border border-red-400/30 bg-red-950/20 px-4 py-3 font-mono text-base text-white placeholder:text-white/30 outline-none focus:border-red-400/50 sm:min-h-12 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="ev-r2" className="text-xs text-red-200/70">
                    Team 2
                  </label>
                  <input
                    id="ev-r2"
                    name="r2"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    defaultValue={fieldDefaults.r2}
                    placeholder="Team number"
                    className="mt-1.5 min-h-[48px] w-full rounded-xl border border-red-400/30 bg-red-950/20 px-4 py-3 font-mono text-base text-white placeholder:text-white/30 outline-none focus:border-red-400/50 sm:min-h-12 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-400/25 bg-blue-500/[0.06] p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/75">
                Blue alliance
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="ev-b1" className="text-xs text-blue-200/70">
                    Team 1
                  </label>
                  <input
                    id="ev-b1"
                    name="b1"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    defaultValue={fieldDefaults.b1}
                    placeholder="Team number"
                    className="mt-1.5 min-h-[48px] w-full rounded-xl border border-blue-400/30 bg-blue-950/20 px-4 py-3 font-mono text-base text-white placeholder:text-white/30 outline-none focus:border-blue-400/50 sm:min-h-12 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="ev-b2" className="text-xs text-blue-200/70">
                    Team 2
                  </label>
                  <input
                    id="ev-b2"
                    name="b2"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    defaultValue={fieldDefaults.b2}
                    placeholder="Team number"
                    className="mt-1.5 min-h-[48px] w-full rounded-xl border border-blue-400/30 bg-blue-950/20 px-4 py-3 font-mono text-base text-white placeholder:text-white/30 outline-none focus:border-blue-400/50 sm:min-h-12 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="submit"
              className="min-h-[48px] w-full touch-manipulation select-none rounded-xl border border-violet-400/35 bg-violet-500/15 px-8 text-sm font-medium text-violet-100 hover:bg-violet-500/25 sm:w-auto sm:min-w-[8rem]"
            >
              Run prediction
            </button>
            <Link
              href={swapHref}
              className="flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-white/70 hover:bg-white/[0.06] sm:min-h-12"
            >
              Swap sides
            </Link>
            <Link
              href={resetHref}
              className="flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-white/70 hover:bg-white/[0.06] sm:min-h-12"
            >
              Reset
            </Link>
          </div>
        </form>

        {invalidMsg ? (
          <p className="mt-4 max-w-xl break-words text-sm text-amber-200/90">
            {invalidMsg}
          </p>
        ) : null}

        {prediction && red && blue ? (
          <section
            id="event-prediction-results"
            className="scroll-mt-24 space-y-10 sm:space-y-12"
          >
            <GlassCard glow="violet" className="mt-8 max-w-2xl min-w-0 p-4 sm:mt-10 sm:p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                FIRST API model
              </p>
              <p className="mt-2 text-xl font-medium text-white/90">
                {prediction.favored === "red" ? "Red" : "Blue"} favored
              </p>
              <p className="mt-1 text-sm text-white/45">
                Confidence:{" "}
                <span className="font-medium text-white/75">{prediction.confidence}</span>
                {" · "}
                Data:{" "}
                <span className="text-white/65">{prediction.richness}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {richnessLabel(prediction.richness)}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center">
                  <p className="text-[10px] uppercase text-red-200/80">Red</p>
                  <p className="text-3xl font-semibold tabular-nums text-red-100">
                    {Math.round(prediction.redWin * 100)}%
                  </p>
                </div>
                <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-center">
                  <p className="text-[10px] uppercase text-blue-200/80">Blue</p>
                  <p className="text-3xl font-semibold tabular-nums text-blue-100">
                    {Math.round(prediction.blueWin * 100)}%
                  </p>
                </div>
              </div>
              <p className="mt-6 break-words text-xs text-white/35">
                Raw logistic (before event-volume blend): Red{" "}
                {Math.round(prediction.rawRedWin * 100)}% · {prediction.playedMatches}{" "}
                scored matches · ~{prediction.avgTeamMatches.toFixed(1)} matches per team
                on average (alliance appearances).
              </p>
            </GlassCard>

            <AllianceScoutDeepDive
              red={[red[0]!, red[1]!]}
              blue={[blue[0]!, blue[1]!]}
              scoutSeason={season}
              predictorEventCode={eventCode}
              sectionLabel={
                <p>
                  <span className="font-medium text-white/70">
                    Scout cross-check (same breakdown as Overall analysis)
                  </span>
                  : Total NP sums, phase edges, scouting read, and per-team cards from
                  FTC Scout — independent of the FIRST API matchup model above.
                </p>
              }
            />
          </section>
        ) : null}

      </main>
    </PageShell>
  );
}
