import {
  EventBrowseList,
  type EventBrowseListRow,
} from "@/components/events/event-browse-list";
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
  firstEventWebUrl,
  formatEventDateRange,
  formatEventTypeLine,
  formatEventVenueLine,
} from "@/lib/ftc-api/event-presentation";
import { deriveEventStatus, formatEventLocation } from "@/lib/ftc-api/event-status";
import {
  fetchEventListingsForSeasons,
  fetchTeamCountsForSeasonCodePairs,
  teamCountCacheKey,
} from "@/lib/ftc-api/service";
import type { SeasonEventModelV2 } from "@/lib/ftc-api/types";

const OFFICIAL_EVENTS_URL = "https://ftc-events.firstinspires.org/#allevents";

/** Max (season, code) pairs for which we load team totals (keeps the page fast). */
const MAX_TEAM_PAIR_LOOKUPS = 100;

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

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.q;
  const q = typeof raw === "string" ? raw.trim().toLowerCase() : "";

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
      /* all seasons empty — still use API mode with empty table */
    }
  }

  const showApi =
    apiOn &&
    succeededChunks.length > 0 &&
    succeededChunks.some((c) => c.events.length > 0);

  type RowSource = {
    seasonYear: number;
    m: ReturnType<typeof dedupeEventsByCode>[number];
  };

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

  const apiRows: EventBrowseListRow[] = showApi
    ? rowSources.map(({ seasonYear, m }, i) => {
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
          internalHref: `/events/${encodeURIComponent(code || "unknown")}?${qs.toString()}`,
          firstWebUrl: code ? firstEventWebUrl(seasonYear, code) : null,
          divisionsNote:
            m.sourceRowCount > 1
              ? `${m.sourceRowCount} divisions (merged)`
              : null,
        };
      })
    : [];

  const filteredMock = [...filterMockEvents(q)].sort(compareMockByStartDesc);

  const mockRows: EventBrowseListRow[] = !showApi
    ? filteredMock.map((e) => {
        const qs = new URLSearchParams();
        qs.set("season", String(defaultSeason));
        return {
          rowKey: e.id,
          seasonYear: defaultSeason,
          code: e.code,
          name: e.name,
          dates: mockDateRangeDisplay(e),
          location: e.location,
          venueExtra: null,
          typeLine: null,
          teams: String(e.teamCount),
          status: e.status,
          internalHref: `/events/${encodeURIComponent(e.code)}?${qs.toString()}`,
          firstWebUrl: firstEventWebUrl(defaultSeason, e.code),
          divisionsNote: null,
        };
      })
    : [];

  const totalShown = showApi ? apiRows.length : mockRows.length;
  const yearsLoaded = showApi
    ? [...new Set(succeededChunks.map((c) => c.season))].sort((a, b) => b - a)
    : [];

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:py-16">
        <header className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-300/55">
            Events
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            All competitions
          </h1>
          <p className="mt-2 text-xs text-white/35">
            {showApi ? (
              <>
                Loaded{" "}
                <span className="text-white/50">{yearsLoaded.length}</span> API
                season{yearsLoaded.length === 1 ? "" : "s"}:{" "}
                <span className="font-mono text-white/55">
                  {yearsLoaded.join(", ")}
                </span>
                . Override with{" "}
                <span className="font-mono">FTC_SEASON_YEARS</span> or{" "}
                <span className="font-mono">FTC_SEASON_INDEX_SPAN</span>.
              </>
            ) : (
              <>Default season {defaultSeason} · demo rows when API is off.</>
            )}
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/45">
            Merged index from the same FIRST listings as{" "}
            <a
              href={OFFICIAL_EVENTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300/90 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200"
            >
              FTC Event Web
            </a>
            , one row per event code per season. Use search to narrow; Analytics
            opens this app with the correct season in the URL.
          </p>
          {showApi && rowSources.length > MAX_TEAM_PAIR_LOOKUPS ? (
            <p className="mt-3 max-w-2xl text-xs text-white/35">
              Team counts load in batches. More than{" "}
              {MAX_TEAM_PAIR_LOOKUPS} rows after search — Teams shows “—” until
              you filter further.
            </p>
          ) : null}
        </header>

        {apiError && (
          <GlassCard className="mt-8 border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100/90">
            <p className="font-medium">
              Could not load events ({apiError.status})
            </p>
            <p className="mt-2 text-red-200/70">
              Showing demo rows below if available.
            </p>
          </GlassCard>
        )}

        {partialSeasonLoadFail && showApi ? (
          <GlassCard className="mt-6 border-amber-400/15 bg-amber-500/8 p-3 text-xs text-amber-100/85">
            Some season requests failed; the table shows seasons that loaded
            successfully.
          </GlassCard>
        ) : null}

        <form className="mt-10 max-w-xl" method="get" action="/events">
          <label htmlFor="q" className="sr-only">
            Search events
          </label>
          <div className="flex gap-2">
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Filter by name, code, city, country…"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none ring-violet-500/40 focus:border-violet-500/40 focus:ring-2"
            />
            <button
              type="submit"
              className="shrink-0 rounded-2xl border border-violet-400/35 bg-violet-500/20 px-5 py-3 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
            >
              Search
            </button>
          </div>
        </form>

        {showApi ? (
          <>
            {rowSources.length === 0 ? (
              <p className="mt-10 text-white/50">No events match “{q}”.</p>
            ) : (
              <>
                <p className="mt-6 text-sm text-white/40">
                  Showing{" "}
                  <span className="font-medium text-white/60 tabular-nums">
                    {totalShown}
                  </span>{" "}
                  {totalShown === 1 ? "row" : "rows"}
                  {q ? ` for “${q}”` : ""}
                </p>
                <EventBrowseList rows={apiRows} />
              </>
            )}
          </>
        ) : null}

        {!showApi || apiError ? (
          <>
            {filteredMock.length === 0 ? (
              <p className="mt-10 text-white/50">
                No demo events match “{q}”.
              </p>
            ) : (
              <>
                <p className="mt-6 text-sm text-white/40">
                  Demo data ·{" "}
                  <span className="tabular-nums font-medium text-white/55">
                    {totalShown}
                  </span>{" "}
                  {totalShown === 1 ? "row" : "rows"}
                </p>
                <EventBrowseList rows={mockRows} />
              </>
            )}
          </>
        ) : null}
      </main>
    </PageShell>
  );
}
