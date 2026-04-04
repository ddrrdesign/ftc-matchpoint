import { Suspense } from "react";
import Link from "next/link";
import {
  EventBrowseList,
  type EventBrowseListRow,
} from "@/components/events/event-browse-list";
import { EventsCategoryHub } from "@/components/events/events-category-hub";
import { EventsViewScroll } from "@/components/events/events-view-scroll";
import { SeasonYearFilter } from "@/components/events/season-year-filter";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { MOCK_EVENTS } from "@/lib/mock-data";
import type { Event } from "@/lib/types";
import {
  getFtcSeasonYear,
  getFtcSeasonYearsForEventIndex,
  isFtcApiConfigured,
} from "@/lib/ftc-api/env";
import {
  compareEventsByStartDesc,
  dedupeEventsByCode,
} from "@/lib/ftc-api/events-listing";
import {
  isPremierTierMockEvent,
  isPremierTierApiEvent,
  isPremierTierScoutEvent,
  isWorldsLevelScoutEvent,
  isWorldsMockEvent,
} from "@/lib/ftc-api/event-buckets";
import {
  formatEventDateRange,
  formatEventTypeLine,
  formatEventVenueLine,
  isWorldsLevelEvent,
} from "@/lib/ftc-api/event-presentation";
import { formatFtcSeasonRangeLabel } from "@/lib/ftc-api/season-label";
import { deriveEventStatus, formatEventLocation } from "@/lib/ftc-api/event-status";
import {
  fetchEventListingsForSeasons,
  fetchTeamCountsForSeasonCodePairs,
  teamCountCacheKey,
} from "@/lib/ftc-api/service";
import type { SeasonEventModelV2 } from "@/lib/ftc-api/types";
import {
  fetchScoutEventsForSeasons,
  getEffectiveScoutSeason,
  scoutEventWebUrl,
} from "@/lib/ftc-scout/queries";
import type { ScoutEventListItem } from "@/lib/ftc-scout/types";

const OFFICIAL_EVENTS_URL = "https://ftc-events.firstinspires.org/#allevents";
const SCOUT_HUB = "https://ftcscout.org";

const MAX_TEAM_PAIR_LOOKUPS = 100;

function buildEventsListHref(parts: {
  q?: string;
  view?: string | null;
  season?: number | null;
}): string {
  const p = new URLSearchParams();
  if (parts.q) p.set("q", parts.q);
  if (parts.view) p.set("view", parts.view);
  if (parts.season != null) p.set("season", String(parts.season));
  const s = p.toString();
  return s ? `/events?${s}` : "/events";
}

function uniqueSeasonsDescending(rows: EventBrowseListRow[]): number[] {
  return [...new Set(rows.map((r) => r.seasonYear))].sort((a, b) => b - a);
}

function filterMockEvents(q: string): Event[] {
  if (!q) return MOCK_EVENTS;
  return MOCK_EVENTS.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
  );
}

function filterApiEvents(
  events: SeasonEventModelV2[],
  q: string
): SeasonEventModelV2[] {
  if (!q) return events;
  return events.filter((e) => {
    const hay = [
      e.name,
      e.code,
      e.city,
      e.stateprov,
      e.country,
      e.venue,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

function filterScoutEvents(events: ScoutEventListItem[], q: string) {
  if (!q) return events;
  return events.filter((e) => {
    const hay = [
      e.name,
      e.code,
      e.city,
      e.state,
      e.country,
      e.venue,
      e.regionCode,
      e.type,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

function dedupeScoutEvents(items: ScoutEventListItem[]): ScoutEventListItem[] {
  const seen = new Set<string>();
  const out: ScoutEventListItem[] = [];
  for (const e of items) {
    const c = (e.code ?? "").trim();
    if (!c) continue;
    const k = `${e.season}-${c}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
}

function scoutLocationLine(e: ScoutEventListItem): string {
  const parts = [e.city, e.state, e.country].filter(Boolean);
  return parts.length ? parts.join(", ") : e.venue?.trim() || "—";
}

function scoutVenueExtra(e: ScoutEventListItem): string | null {
  const loc = scoutLocationLine(e);
  const v = e.venue?.trim();
  if (!v || v === loc) return null;
  return v;
}

function scoutTypeLine(e: ScoutEventListItem): string | null {
  const parts = [e.type?.trim()].filter(Boolean);
  if (e.remote) parts.push("Remote");
  if (e.hybrid) parts.push("Hybrid");
  return parts.length ? parts.join(" · ") : null;
}

function mockDateRangeDisplay(e: Event): string {
  if (!e.startDate?.trim()) return "TBA";
  return (
    formatEventDateRange({
      dateStart: e.startDate,
      dateEnd: e.endDate,
    }) ?? "TBA"
  );
}

function compareMockByStartDesc(a: Event, b: Event): number {
  return (b.startDate || "").localeCompare(a.startDate || "");
}

function compareScoutByStartDesc(a: ScoutEventListItem, b: ScoutEventListItem) {
  return (b.start ?? "").localeCompare(a.start ?? "");
}

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    view?: string | string[];
    season?: string | string[];
  }>;
};

type RowSource = {
  seasonYear: number;
  m: ReturnType<typeof dedupeEventsByCode>[number];
};

function mapApiRowSourcesToBrowseRows(
  sources: RowSource[],
  teamCounts: Map<string, number | null>
): EventBrowseListRow[] {
  return sources.map(({ seasonYear, m }, i) => {
    const e = m.event;
    const code = e.code?.trim() ?? "";
    const st = deriveEventStatus(e);
    const key = code ? teamCountCacheKey(seasonYear, code) : "";
    const teamN = key ? teamCounts.get(key) ?? null : null;
    const dates = formatEventDateRange(e) ?? "TBA";
    const loc = formatEventLocation(e);
    const venue = formatEventVenueLine(e);
    const qs = new URLSearchParams();
    qs.set("season", String(seasonYear));
    const detailHref = `/events/${encodeURIComponent(code || "unknown")}?${qs.toString()}`;
    return {
      rowKey: `${seasonYear}-${code || e.eventId || i}`,
      seasonYear,
      code,
      name: (e.name ?? code).trim() || "Event",
      dates,
      location: loc || "—",
      venueExtra: venue && venue !== loc ? venue : null,
      typeLine: formatEventTypeLine(e),
      teams: teamN != null ? String(teamN) : "—",
      status: st,
      detailHref,
      primaryHref: detailHref,
      primaryLabel: "Analytics",
      primaryExternal: false,
      firstWebUrl: OFFICIAL_EVENTS_URL,
      divisionsNote:
        m.sourceRowCount > 1
          ? `${m.sourceRowCount} divisions (merged)`
          : null,
    };
  });
}

function mapScoutEventsToBrowseRows(items: ScoutEventListItem[]): EventBrowseListRow[] {
  return items.map((e, i) => {
    const code = (e.code ?? "").trim();
    const seasonY = e.season;
    const st = deriveEventStatus({
      dateStart: e.start ?? undefined,
      dateEnd: e.end ?? undefined,
    });
    const dates =
      formatEventDateRange({
        dateStart: e.start ?? undefined,
        dateEnd: e.end ?? undefined,
      }) ?? "TBA";
    const qs = new URLSearchParams();
    qs.set("season", String(seasonY));
    const detailHref = `/events/${encodeURIComponent(code || "unknown")}?${qs.toString()}`;
    return {
      rowKey: `${seasonY}-${code}-${i}`,
      seasonYear: seasonY,
      code,
      name: (e.name ?? code).trim() || "Event",
      dates,
      location: scoutLocationLine(e),
      venueExtra: scoutVenueExtra(e),
      typeLine: scoutTypeLine(e),
      teams: "—",
      status: st,
      detailHref,
      primaryHref: scoutEventWebUrl(seasonY, code),
      primaryLabel: "Scout",
      primaryExternal: true,
      firstWebUrl: OFFICIAL_EVENTS_URL,
      divisionsNote: null,
    };
  });
}

function mapMockEventsToBrowseRows(
  events: Event[],
  defaultSeason: number
): EventBrowseListRow[] {
  return events.map((e) => {
    const qs = new URLSearchParams();
    qs.set("season", String(defaultSeason));
    const detailHref = `/events/${encodeURIComponent(e.code)}?${qs.toString()}`;
    return {
      rowKey: e.id,
      seasonYear: defaultSeason,
      code: e.code,
      name: e.name,
      dates: mockDateRangeDisplay(e),
      location: e.location,
      venueExtra: null,
      typeLine: e.firstInspiresUrl ? "Demo" : null,
      teams: String(e.teamCount),
      status: e.status,
      detailHref,
      primaryHref: detailHref,
      primaryLabel: "Analytics",
      primaryExternal: false,
      firstWebUrl: OFFICIAL_EVENTS_URL,
      divisionsNote: null,
    };
  });
}

export default async function EventsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.q;
  const q = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  const rawView = sp.view;
  const view =
    typeof rawView === "string" &&
    (rawView === "past" || rawView === "premier" || rawView === "worlds")
      ? rawView
      : null;

  const rawSeasonQ = sp.season;
  const seasonQuery =
    typeof rawSeasonQ === "string" && /^\d{4}$/.test(rawSeasonQ.trim())
      ? Number.parseInt(rawSeasonQ.trim(), 10)
      : null;

  const apiOn = isFtcApiConfigured();
  const defaultSeason = getFtcSeasonYear();
  const indexSeasons = getFtcSeasonYearsForEventIndex();

  let apiError: { status: number; message: string } | null = null;
  let partialSeasonLoadFail = false;
  let succeededChunks: { season: number; events: SeasonEventModelV2[] }[] =
    [];

  if (apiOn) {
    const chunks = await fetchEventListingsForSeasons(indexSeasons);
    const okChunks = chunks.filter((c) => c.ok);
    const badChunks = chunks.filter((c) => !c.ok);
    partialSeasonLoadFail =
      badChunks.length > 0 && okChunks.some((c) => c.events.length > 0);

    succeededChunks = okChunks.map((c) => ({
      season: c.season,
      events: c.events,
    }));

    const totalEvents = succeededChunks.reduce(
      (n, c) => n + c.events.length,
      0
    );

    if (okChunks.length === 0 && badChunks.length > 0) {
      apiError = {
        status: badChunks[0]?.status ?? 0,
        message: "Could not load any season from the API.",
      };
    } else if (totalEvents === 0 && apiOn && okChunks.length > 0) {
      /* empty seasons */
    }
  }

  const showApi =
    apiOn &&
    succeededChunks.length > 0 &&
    succeededChunks.some((c) => c.events.length > 0);

  const rowSources: RowSource[] = [];
  if (showApi) {
    for (const { season, events } of succeededChunks) {
      const filtered = filterApiEvents(events, q);
      for (const m of dedupeEventsByCode(filtered)) {
        rowSources.push({ seasonYear: season, m });
      }
    }
    rowSources.sort((a, b) => {
      const t = compareEventsByStartDesc(a.m.event, b.m.event);
      if (t !== 0) return t;
      return b.seasonYear - a.seasonYear;
    });
  }

  let teamCounts = new Map<string, number | null>();
  if (showApi && rowSources.length > 0) {
    const pairs = rowSources
      .map(({ seasonYear, m }) => ({
        season: seasonYear,
        code: m.event.code?.trim() ?? "",
      }))
      .filter((p) => p.code.length > 0);

    if (pairs.length > 0 && pairs.length <= MAX_TEAM_PAIR_LOOKUPS) {
      teamCounts = await fetchTeamCountsForSeasonCodePairs(pairs, 10);
    }
  }

  const pastSources = showApi
    ? rowSources.filter(
        ({ m }) => deriveEventStatus(m.event) === "completed"
      )
    : [];
  const premierSources = showApi
    ? rowSources.filter(({ m }) => {
        const st = deriveEventStatus(m.event);
        return (
          (st === "upcoming" || st === "live") &&
          isPremierTierApiEvent(m.event)
        );
      })
    : [];
  const worldsSources = showApi
    ? rowSources.filter(({ m }) => isWorldsLevelEvent(m.event))
    : [];

  let scoutMerged: ScoutEventListItem[] = [];
  let scoutFetchHadError = false;
  if (!showApi) {
    const anchor = await getEffectiveScoutSeason();
    const scoutSeasons = [
      ...new Set([anchor, anchor - 1, anchor - 2]),
    ].filter((y) => y >= 2019);
    const scoutResults = await fetchScoutEventsForSeasons(scoutSeasons);
    for (let i = 0; i < scoutResults.length; i++) {
      const r = scoutResults[i];
      if (r?.ok) {
        scoutMerged.push(...(r.data ?? []));
      } else if (r && !r.ok) {
        scoutFetchHadError = true;
      }
    }
    scoutMerged = dedupeScoutEvents(scoutMerged);
  }

  const scoutFiltered = filterScoutEvents(scoutMerged, q).sort(
    compareScoutByStartDesc
  );

  /** Scout returned at least one event (before search filter). */
  const scoutHasData = !showApi && scoutMerged.length > 0;

  const pastScoutFiltered = scoutHasData
    ? scoutFiltered.filter(
        (e) =>
          deriveEventStatus({
            dateStart: e.start ?? undefined,
            dateEnd: e.end ?? undefined,
          }) === "completed"
      )
    : [];
  const premierScoutFiltered = scoutHasData
    ? scoutFiltered.filter((e) => {
        const st = deriveEventStatus({
          dateStart: e.start ?? undefined,
          dateEnd: e.end ?? undefined,
        });
        return (
          (st === "upcoming" || st === "live") &&
          isPremierTierScoutEvent(e)
        );
      })
    : [];
  const worldsScoutFiltered = scoutHasData
    ? scoutFiltered.filter((e) => isWorldsLevelScoutEvent(e))
    : [];

  const filteredMock = [...filterMockEvents(q)].sort(compareMockByStartDesc);
  const pastMockFiltered = filteredMock.filter((e) => e.status === "completed");
  const premierMockFiltered = filteredMock.filter(
    (e) =>
      (e.status === "upcoming" || e.status === "live") &&
      isPremierTierMockEvent(e)
  );
  const worldsMockFiltered = filteredMock.filter((e) => isWorldsMockEvent(e));

  const listSource: "first" | "scout" | "mock" = showApi
    ? "first"
    : scoutHasData
      ? "scout"
      : "mock";

  const pastRows: EventBrowseListRow[] =
    listSource === "first"
      ? mapApiRowSourcesToBrowseRows(pastSources, teamCounts)
      : listSource === "scout"
        ? mapScoutEventsToBrowseRows(pastScoutFiltered)
        : mapMockEventsToBrowseRows(pastMockFiltered, defaultSeason);
  const premierRows: EventBrowseListRow[] =
    listSource === "first"
      ? mapApiRowSourcesToBrowseRows(premierSources, teamCounts)
      : listSource === "scout"
        ? mapScoutEventsToBrowseRows(premierScoutFiltered)
        : mapMockEventsToBrowseRows(premierMockFiltered, defaultSeason);
  const worldsRows: EventBrowseListRow[] =
    listSource === "first"
      ? mapApiRowSourcesToBrowseRows(worldsSources, teamCounts)
      : listSource === "scout"
        ? mapScoutEventsToBrowseRows(worldsScoutFiltered)
        : mapMockEventsToBrowseRows(worldsMockFiltered, defaultSeason);

  let activeBucketRows: EventBrowseListRow[] =
    view === "past"
      ? pastRows
      : view === "premier"
        ? premierRows
        : view === "worlds"
          ? worldsRows
          : [];

  if (
    (view === "past" || view === "worlds") &&
    seasonQuery != null
  ) {
    activeBucketRows = activeBucketRows.filter(
      (r) => r.seasonYear === seasonQuery
    );
  }

  const pastSeasonsForFilter = uniqueSeasonsDescending(pastRows);
  const worldsSeasonsForFilter = uniqueSeasonsDescending(worldsRows);
  const yearsLoaded = showApi
    ? [...new Set(succeededChunks.map((c) => c.season))].sort((a, b) => b - a)
    : [];

  const scoutSeasonsLoaded = scoutHasData
    ? [...new Set(scoutMerged.map((e) => e.season))].sort((a, b) => b - a)
    : [];

  return (
    <PageShell>
      <SiteHeader />
      <Suspense fallback={null}>
        <EventsViewScroll />
      </Suspense>
      <main className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 md:py-16">
        <header className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-300/55">
            Events
          </p>
          <h1 className="mt-2 text-[1.65rem] font-semibold leading-tight tracking-tight sm:mt-3 sm:text-4xl md:text-5xl">
            All competitions
          </h1>
          <p className="mt-2 break-words text-xs text-white/35">
            {listSource === "first" ? (
              <>
                Source:{" "}
                <span className="text-white/55">FIRST FTC API</span> · seasons{" "}
                <span className="font-mono text-white/55">
                  {yearsLoaded.join(", ")}
                </span>
              </>
            ) : listSource === "scout" ? (
              <>
                Source:{" "}
                <a
                  href={SCOUT_HUB}
                  className="text-sky-300/90 underline hover:text-sky-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FTC Scout
                </a>{" "}
                public REST (same catalog as{" "}
                <span className="font-mono text-white/45">/events/search</span>
                ) · seasons{" "}
                <span className="font-mono text-white/55">
                  {scoutSeasonsLoaded.join(", ")}
                </span>
              </>
            ) : (
              <>Demo rows only · default season {defaultSeason}</>
            )}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/45 sm:mt-4 sm:text-base">
            Official registration and schedules:{" "}
            <a
              href={OFFICIAL_EVENTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300/90 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200"
            >
              FTC Event Web
            </a>
            . Scores and OPR context:{" "}
            <a
              href="https://ftcscout.org/api/rest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-300/90 underline decoration-sky-400/35 underline-offset-2 hover:text-sky-200"
            >
              FTC Scout API
            </a>
            . <span className="text-white/55">FIRST</span> in the table opens
            the Event Web all-events hub; with FIRST API keys we also show{" "}
            <span className="text-white/55">Analytics</span> inside this app.
          </p>
          {showApi && rowSources.length > MAX_TEAM_PAIR_LOOKUPS ? (
            <p className="mt-3 max-w-2xl text-xs text-white/35">
              Team counts load in batches. More than{" "}
              {MAX_TEAM_PAIR_LOOKUPS} rows after search — Teams shows “—” until
              you filter further.
            </p>
          ) : null}
        </header>

        {listSource === "scout" ? (
          <GlassCard className="mt-6 border-sky-400/25 bg-sky-500/10 p-4 text-sm text-sky-50/95 sm:mt-8 sm:p-5">
            <p className="font-medium text-sky-100">
              Full calendar without FIRST API keys
            </p>
            <p className="mt-2 text-sky-100/85">
              This table is loaded from{" "}
              <span className="font-mono text-sky-50/90">api.ftcscout.org</span>{" "}
              (no auth). Use <span className="font-semibold">Scout</span> for
              matches and stats on ftcscout.org. Add{" "}
              <span className="font-mono">FTC_API_USERNAME</span> +{" "}
              <span className="font-mono">FTC_API_KEY</span> on the server to
              enable in-app <span className="font-semibold">Analytics</span>{" "}
              pages here.
            </p>
          </GlassCard>
        ) : null}

        {!apiOn && listSource === "mock" ? (
          <GlassCard className="mt-6 border-amber-400/30 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-50/95 sm:mt-8 sm:p-5">
            <p className="font-semibold text-amber-100">
              FTC Scout did not return events (offline or error)
            </p>
            <p className="mt-2 text-amber-100/80">
              Showing 3 sample rows. For the real list, ensure the deploy can
              reach <span className="font-mono">api.ftcscout.org</span>, or set{" "}
              <span className="font-mono">FTC_API_*</span> for FIRST API. Register
              at{" "}
              <a
                href="https://ftc-events.firstinspires.org/services/API"
                className="text-amber-200 underline hover:text-amber-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                FTC Event Web → API
              </a>
              .
            </p>
            {scoutFetchHadError ? (
              <p className="mt-2 text-xs text-amber-200/70">
                At least one Scout season request failed — check network / API
                status.
              </p>
            ) : null}
          </GlassCard>
        ) : null}

        {apiOn && !showApi ? (
          <GlassCard className="mt-6 border-amber-400/20 bg-amber-500/8 p-4 text-sm text-amber-100/90 sm:mt-8">
            <p className="font-medium">FIRST API did not return event listings</p>
            <p className="mt-2 text-amber-100/75">
              Using FTC Scout below if available, otherwise demo rows.
            </p>
          </GlassCard>
        ) : null}

        {apiError && (
          <GlassCard className="mt-6 border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100/90 sm:mt-8">
            <p className="font-medium">
              Could not load events ({apiError.status})
            </p>
            <p className="mt-2 text-red-200/70">
              Falling back to Scout or demo data.
            </p>
          </GlassCard>
        )}

        {partialSeasonLoadFail && showApi ? (
          <GlassCard className="mt-6 border-amber-400/15 bg-amber-500/8 p-3 text-xs text-amber-100/85">
            Some season requests failed; the table shows seasons that loaded
            successfully.
          </GlassCard>
        ) : null}

        <form
          className="mt-8 w-full max-w-xl sm:mt-10"
          method="get"
          action="/events"
        >
          {view ? (
            <input type="hidden" name="view" value={view} />
          ) : null}
          {(view === "past" || view === "worlds") && seasonQuery != null ? (
            <input type="hidden" name="season" value={String(seasonQuery)} />
          ) : null}
          <label htmlFor="q" className="sr-only">
            Search events
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Name, code, city, country…"
              enterKeyHint="search"
              className="min-h-[48px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-white/35 outline-none ring-violet-500/40 focus:border-violet-500/40 focus:ring-2 sm:min-h-0 sm:text-sm"
            />
            <button
              type="submit"
              className="touch-manipulation min-h-[48px] w-full shrink-0 select-none rounded-2xl border border-violet-400/40 bg-violet-500/22 px-5 py-3 text-sm font-semibold text-violet-100 transition-transform duration-100 hover:bg-violet-500/32 active:scale-[0.98] active:bg-violet-500/42 sm:min-h-0 sm:w-auto"
            >
              Search
            </button>
          </div>
        </form>

        {listSource === "first" && rowSources.length === 0 && q ? (
          <p className="mt-6 text-white/50">
            No events match “{q}”.{" "}
            <Link
              href={buildEventsListHref({
                view,
                season:
                  view === "past" || view === "worlds" ? seasonQuery : null,
              })}
              className="text-violet-300 underline hover:text-violet-200"
            >
              Clear search
            </Link>
          </p>
        ) : null}
        {listSource === "scout" && scoutHasData && scoutFiltered.length === 0 ? (
          <p className="mt-6 text-white/50">
            No events match “{q}”.{" "}
            <Link
              href={buildEventsListHref({
                view,
                season:
                  view === "past" || view === "worlds" ? seasonQuery : null,
              })}
              className="text-violet-300 underline hover:text-violet-200"
            >
              Clear search
            </Link>
          </p>
        ) : null}
        {listSource === "mock" && filteredMock.length === 0 ? (
          <p className="mt-6 text-white/50">
            No demo events match “{q}”.
            {q ? (
              <>
                {" "}
                <Link
                  href={buildEventsListHref({
                    view,
                    season:
                      view === "past" || view === "worlds"
                        ? seasonQuery
                        : null,
                  })}
                  className="text-violet-300 underline hover:text-violet-200"
                >
                  Clear search
                </Link>
              </>
            ) : null}
          </p>
        ) : null}

        <EventsCategoryHub
          q={q}
          activeView={view}
          past={{ total: pastRows.length }}
          premier={{ total: premierRows.length }}
          worlds={{ total: worldsRows.length }}
        />

        {view ? (
          <section
            id="events-results"
            className="mt-6 scroll-mt-4 sm:mt-8 sm:scroll-mt-6 md:mt-10"
          >
            <p className="text-xs text-white/40 sm:text-sm">
              <span className="font-medium text-white/55">
                {activeBucketRows.length}
              </span>{" "}
              {activeBucketRows.length === 1 ? "event" : "events"}
              {view === "past"
                ? " · past"
                : view === "premier"
                  ? " · upcoming premier"
                  : " · world championship"}
              {q ? ` · filtered by “${q}”` : ""}
              {(view === "past" || view === "worlds") && seasonQuery != null
                ? ` · ${formatFtcSeasonRangeLabel(seasonQuery)}`
                : ""}
              {listSource === "first"
                ? " · FIRST API"
                : listSource === "scout"
                  ? " · FTC Scout"
                  : " · demo"}
            </p>
            {view === "past" && pastSeasonsForFilter.length > 0 ? (
              <SeasonYearFilter
                view="past"
                yearsDescending={pastSeasonsForFilter}
                selectedYear={seasonQuery}
                q={q}
              />
            ) : null}
            {view === "worlds" && worldsSeasonsForFilter.length > 0 ? (
              <SeasonYearFilter
                view="worlds"
                yearsDescending={worldsSeasonsForFilter}
                selectedYear={seasonQuery}
                q={q}
              />
            ) : null}
            {activeBucketRows.length > 0 ? (
              <EventBrowseList rows={activeBucketRows} />
            ) : (
              <p className="mt-6 leading-relaxed text-white/45">
                No events match these filters.
                {(view === "past" || view === "worlds") && seasonQuery != null ? (
                  <>
                    {" "}
                    <Link
                      href={buildEventsListHref({ q, view, season: null })}
                      className="text-violet-300 underline hover:text-violet-200"
                    >
                      Show all seasons
                    </Link>
                    {" · "}
                  </>
                ) : null}
                <Link
                  href={buildEventsListHref({
                    view,
                    season:
                      view === "past" || view === "worlds" ? seasonQuery : null,
                  })}
                  className="text-violet-300 underline hover:text-violet-200"
                >
                  Clear search
                </Link>
              </p>
            )}
          </section>
        ) : null}
      </main>
    </PageShell>
  );
}
