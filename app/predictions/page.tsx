import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { OverallPredictorPanel } from "@/components/predictions/overall-predictor-panel";
import {
  getFtcSeasonYear,
  getFtcSeasonYearsForPredictionsCatalog,
  isFtcApiConfigured,
} from "@/lib/ftc-api/env";
import { formatFtcSeasonRangeLabel } from "@/lib/ftc-api/season-label";
import { uiEventStatusLabel } from "@/lib/ftc-api/event-status";
import {
  fetchPredictionsSeasonEvents,
  filterPredictionsEventsByQuery,
} from "@/lib/predictions/active-events";
import {
  FirstApiSetupGuide,
  FirstApiSetupPointer,
} from "@/components/predictions/first-api-setup-guide";
import { FIRST_FTC_API_DOCS_URL } from "@/lib/ftc-api/event-presentation";

export const revalidate = 120;

const FTC_API_DOCS = FIRST_FTC_API_DOCS_URL;
const FTC_EVENTS_HOME = "https://ftc-events.firstinspires.org/#allevents";
const FTC_SCOUT = "https://ftcscout.org";
const FTC_SCOUT_API = "https://ftcscout.org/api/rest";

type Search = {
  r?: string;
  b?: string;
  r1?: string;
  r2?: string;
  b1?: string;
  b2?: string;
  q?: string;
};

function hiddenOverallFields(sp: Search): ReactNode {
  const keys = ["r1", "r2", "b1", "b2", "r", "b"] as const;
  return keys.map((key) => {
    const v = sp[key];
    if (typeof v !== "string" || !v.trim()) return null;
    return <input type="hidden" key={key} name={key} value={v} />;
  });
}

function resetEventSearchHref(sp: Search): string {
  const p = new URLSearchParams();
  for (const key of ["r1", "r2", "b1", "b2", "r", "b"] as const) {
    const v = sp[key];
    if (typeof v === "string" && v.trim()) p.set(key, v);
  }
  const qs = p.toString();
  return qs ? `/predictions?${qs}` : "/predictions";
}

function statusTone(status: "live" | "upcoming" | "completed"): string {
  switch (status) {
    case "live":
      return "text-emerald-200/90";
    case "upcoming":
      return "text-sky-200/90";
    default:
      return "text-white/40";
  }
}

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await connection();
  const apiOn = isFtcApiConfigured();
  const sp = await searchParams;
  const eventQuery = typeof sp.q === "string" ? sp.q : "";

  const catalogSeasons = getFtcSeasonYearsForPredictionsCatalog();
  const ftcScoutEventsYear =
    catalogSeasons.length > 0
      ? Math.min(...catalogSeasons)
      : new Date().getFullYear();
  const ftcScoutEventsUrl = `${FTC_SCOUT}/events/${ftcScoutEventsYear}`;

  const allSeasonEvents = apiOn ? await fetchPredictionsSeasonEvents() : [];
  const eventRows = filterPredictionsEventsByQuery(allSeasonEvents, eventQuery);

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto min-w-0 w-full max-w-7xl flex-1 overflow-x-hidden px-3 py-8 sm:px-6 sm:py-12 md:py-16">
        <header className="max-w-3xl min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-300/55">
            Predictions
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Match intelligence
          </h1>
          <p className="mt-4 break-words text-base leading-relaxed text-white/50 sm:text-lg">
            Two modes: <strong className="font-medium text-white/70">Overall</strong>{" "}
            uses{" "}
            <a
              href={FTC_SCOUT_API}
              className="text-sky-300/90 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Scout
            </a>{" "}
            composite stats for any teams.{" "}
            <strong className="font-medium text-white/70">Event</strong> uses{" "}
            <a
              href={FTC_API_DOCS}
              className="text-violet-300/90 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FIRST FTC Events API
            </a>{" "}
            rankings and match history for one competition — predictions tighten as
            more matches are played.
            {!apiOn ? (
              <>
                {" "}
                <span className="text-amber-200/90">
                  Event mode needs API keys on the server — see the setup section on{" "}
                  <a
                    href="#first-api-setup"
                    className="underline hover:text-amber-100"
                  >
                    this page
                  </a>
                  .
                </span>
              </>
            ) : null}
          </p>
          <p className="mt-3 text-sm text-white/40">
            Calendars:{" "}
            <a
              href={FTC_EVENTS_HOME}
              className="text-violet-300/80 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Event Web
            </a>
            {" · "}
            <a
              href={ftcScoutEventsUrl}
              className="text-sky-300/80 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Scout — events ({ftcScoutEventsYear})
            </a>
          </p>
        </header>

        {!apiOn ? (
          <div className="mt-8 sm:mt-10">
            <FirstApiSetupGuide />
          </div>
        ) : null}

        <div className={`space-y-4 ${!apiOn ? "mt-6 sm:mt-8" : "mt-10 sm:mt-12"}`}>
          <details
            id="overall"
            className="group scroll-mt-24 rounded-2xl border border-white/[0.1] bg-white/[0.03] open:border-violet-400/30 open:bg-white/[0.045]"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 touch-manipulation sm:p-6 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0 text-left">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-300/55">
                  1 · Overall
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white/95 sm:text-2xl">
                  Overall analysis
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Four team numbers (one per field), FTC Scout data, not tied to a single
                  event. Expand to open the form and results.
                </p>
              </div>
              <span
                className="mt-1 shrink-0 text-lg text-violet-300/70 transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              >
                ▼
              </span>
            </summary>
            <div className="border-t border-white/[0.08] px-4 pb-6 pt-2 sm:px-6">
              <OverallPredictorPanel
                searchParams={Promise.resolve(sp)}
                routeBase="/predictions"
                embedInPage
              />
            </div>
          </details>

          <details
            id="event-analysis"
            className="group scroll-mt-24 rounded-2xl border border-white/[0.1] bg-white/[0.03] open:border-violet-400/30 open:bg-white/[0.045]"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 touch-manipulation sm:p-6 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0 text-left">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-300/55">
                  2 · Event
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white/95 sm:text-2xl">
                  Event analysis
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  FIRST API season event catalog; predictions from roster and field match
                  history. Expand to open search and the list.
                </p>
              </div>
              <span
                className="mt-1 shrink-0 text-lg text-violet-300/70 transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              >
                ▼
              </span>
            </summary>
            <div className="border-t border-white/[0.08] px-4 pb-6 pt-4 sm:px-6">
              {!apiOn ? (
                <div className="mt-2 max-w-2xl space-y-3 rounded-2xl border border-amber-400/20 bg-amber-500/[0.07] p-5 text-sm text-amber-50/95">
                  <p className="font-medium text-amber-100">
                    FIRST API is not configured on the server
                  </p>
                  <FirstApiSetupPointer />
                  <p className="text-amber-100/75">
                    <strong className="font-medium text-amber-50">Overall</strong> mode
                    above still works via FTC Scout without these keys.
                  </p>
                </div>
              ) : allSeasonEvents.length === 0 ? (
                <GlassCard className="mt-2 max-w-2xl border-white/[0.08] bg-white/[0.03] p-6 text-center">
                  <p className="text-lg font-medium text-white/85">
                    No events in the catalog
                  </p>
                  <p className="mt-2 text-sm text-white/45">
                    The API returned an empty list for the selected seasons. Check{" "}
                    <span className="font-mono">FTC_SEASON_YEAR</span> /{" "}
                    <span className="font-mono">FTC_PREDICTIONS_API_SEASONS</span> and
                    the{" "}
                    <Link href="/events" className="text-violet-300 hover:underline">
                      Events
                    </Link>{" "}
                    page.
                  </p>
                </GlassCard>
              ) : eventRows.length === 0 ? (
                <GlassCard className="mt-2 max-w-2xl border-white/[0.08] bg-white/[0.03] p-6 text-center">
                  <p className="text-lg font-medium text-white/85">
                    No matches
                  </p>
                  <p className="mt-2 text-sm text-white/45">
                    No results for “{eventQuery}” among{" "}
                    {allSeasonEvents.length.toLocaleString("en-US")} events. Clear the
                    search or refine name / code / city.
                  </p>
                </GlassCard>
              ) : (
                <>
                  <p className="mb-4 max-w-2xl text-sm leading-relaxed text-white/40">
                    Season
                    {catalogSeasons.length > 1
                      ? `s: ${catalogSeasons.map((y) => formatFtcSeasonRangeLabel(y)).join(", ")}`
                      : `: ${formatFtcSeasonRangeLabel(
                          catalogSeasons[0] ?? getFtcSeasonYear()
                        )}`}
                    . Calendars:{" "}
                    <a
                      href={FTC_EVENTS_HOME}
                      className="text-violet-300/85 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      FTC Event Web
                    </a>
                    ,{" "}
                    <a
                      href={ftcScoutEventsUrl}
                      className="text-sky-300/85 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      FTC Scout
                    </a>
                    .
                  </p>
                  <form
                    action="/predictions"
                    method="get"
                    className="flex min-w-0 max-w-2xl flex-col gap-3 sm:flex-row sm:items-center"
                  >
                    {hiddenOverallFields(sp)}
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Search events</span>
                      <input
                        type="search"
                        name="q"
                        defaultValue={eventQuery}
                        placeholder="Name, code, city…"
                        className="w-full min-h-12 rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-violet-400/40"
                        autoComplete="off"
                      />
                    </label>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="submit"
                        className="min-h-12 touch-manipulation rounded-xl bg-violet-500/90 px-5 text-sm font-medium text-white hover:bg-violet-500"
                      >
                        Search
                      </button>
                      {eventQuery ? (
                        <Link
                          href={resetEventSearchHref(sp)}
                          className="inline-flex min-h-12 items-center touch-manipulation rounded-xl border border-white/[0.15] px-4 text-sm text-white/70 hover:bg-white/[0.06]"
                        >
                          Clear
                        </Link>
                      ) : null}
                    </div>
                  </form>
                  <p className="mt-3 text-xs text-white/38">
                    Showing {eventRows.length.toLocaleString("en-US")} of{" "}
                    {allSeasonEvents.length.toLocaleString("en-US")} events
                    {eventQuery ? ` · query “${eventQuery}”` : ""}
                  </p>
                  <ul className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {eventRows.map((ev) => {
                      const href = `/predictions/event/${encodeURIComponent(ev.code)}?season=${ev.season}`;
                      return (
                        <li key={`${ev.season}-${ev.code}`} className="min-w-0">
                          <Link
                            prefetch
                            href={href}
                            className="block min-h-[44px] h-full touch-manipulation rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 transition hover:border-violet-400/35 hover:bg-white/[0.07] active:bg-white/[0.1] sm:min-h-0 sm:p-5"
                          >
                            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                              {formatFtcSeasonRangeLabel(ev.season)}
                            </p>
                            <p className="mt-2 font-semibold leading-snug text-white/92">
                              {ev.name}
                            </p>
                            <p className="mt-1 font-mono text-xs text-violet-300/75">
                              {ev.code}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm text-white/45">
                              {ev.location}
                            </p>
                            <p
                              className={`mt-3 text-xs font-medium ${statusTone(ev.status)}`}
                            >
                              {uiEventStatusLabel(ev.status)}
                            </p>
                            <span className="mt-4 inline-flex text-sm font-medium text-violet-300/90">
                              Predict at this event →
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </details>
        </div>
      </main>
    </PageShell>
  );
}
