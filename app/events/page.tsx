import {
  EventBrowseList,
  type EventBrowseListRow,
} from "@/components/events/event-browse-list";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { MOCK_EVENTS } from "@/lib/mock-data";
import type { Event } from "@/lib/types";
import { isFtcApiConfigured, getFtcSeasonYear } from "@/lib/ftc-api/env";
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
  fetchEventListings,
  fetchTeamCountsForEventCodes,
} from "@/lib/ftc-api/service";
import type { SeasonEventModelV2 } from "@/lib/ftc-api/types";

const OFFICIAL_EVENTS_URL = "https://ftc-events.firstinspires.org/#allevents";

const MAX_TEAM_COUNT_LOOKUPS = 80;

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
  const season = getFtcSeasonYear();
  const apiRes = apiOn ? await fetchEventListings(season) : null;

  let apiError: { status: number; message: string } | null = null;
  let apiEvents: SeasonEventModelV2[] = [];

  if (apiOn && apiRes) {
    if (apiRes.ok) {
      apiEvents = apiRes.data.events ?? [];
    } else {
      apiError = { status: apiRes.status, message: apiRes.message };
    }
  }

  const filteredApi = filterApiEvents(apiEvents, q);
  const filteredMock = [...filterMockEvents(q)].sort(compareMockByStartDesc);

  const showApi = apiOn && apiRes?.ok && apiEvents.length > 0;

  let teamCounts = new Map<string, number | null>();
  let mergedList: ReturnType<typeof dedupeEventsByCode> = [];

  if (showApi) {
    mergedList = dedupeEventsByCode(filteredApi);
    mergedList.sort((a, b) =>
      compareEventsByStartDesc(a.event, b.event)
    );
    const codes = mergedList
      .map((m) => m.event.code?.trim())
      .filter((c): c is string => Boolean(c));
    if (codes.length > 0 && codes.length <= MAX_TEAM_COUNT_LOOKUPS) {
      teamCounts = await fetchTeamCountsForEventCodes(season, codes, 10);
    }
  }

  const apiRows: EventBrowseListRow[] = showApi
    ? mergedList.map((m, i) => {
        const e = m.event;
        const code = e.code?.trim() ?? "";
        const st = deriveEventStatus(e);
        const teamN = code ? teamCounts.get(code) ?? null : null;
        const dates = formatEventDateRange(e) ?? "TBA";
        const loc = formatEventLocation(e);
        const venue = formatEventVenueLine(e);
        return {
          rowKey: code || e.eventId || `row-${i}`,
          code,
          name: (e.name ?? code).trim() || "Event",
          dates,
          location: loc || "—",
          venueExtra:
            venue && venue !== loc ? venue : null,
          typeLine: formatEventTypeLine(e),
          teams: teamN != null ? String(teamN) : "—",
          status: st,
          internalHref: `/events/${encodeURIComponent(code || "unknown")}`,
          firstWebUrl: code ? firstEventWebUrl(season, code) : null,
          divisionsNote:
            m.sourceRowCount > 1
              ? `${m.sourceRowCount} divisions (merged)`
              : null,
        };
      })
    : [];

  const mockRows: EventBrowseListRow[] = !showApi
    ? filteredMock.map((e) => ({
        rowKey: e.id,
        code: e.code,
        name: e.name,
        dates: mockDateRangeDisplay(e),
        location: e.location,
        venueExtra: null,
        typeLine: null,
        teams: String(e.teamCount),
        status: e.status,
        internalHref: `/events/${encodeURIComponent(e.code)}`,
        firstWebUrl: firstEventWebUrl(season, e.code),
        divisionsNote: null,
      }))
    : [];

  const totalShown = showApi ? apiRows.length : mockRows.length;

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
            Season {season} (same year key as FTC Event Web URLs and API)
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/45">
            Full season index from the same data FIRST publishes on{" "}
            <a
              href={OFFICIAL_EVENTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300/90 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200"
            >
              FTC Event Web
            </a>
            . Use search to filter; open a row for rankings, matches, and
            awards here, or the FIRST link for the official event page on
            firstinspires.org.
          </p>
          {showApi &&
          mergedList.length > 0 &&
          mergedList.filter((m) => m.event.code?.trim()).length >
            MAX_TEAM_COUNT_LOOKUPS ? (
            <p className="mt-3 max-w-2xl text-xs text-white/35">
              Team counts load in batches. With more than{" "}
              {MAX_TEAM_COUNT_LOOKUPS} event codes, the Teams column shows “—”
              until you narrow the list with search.
            </p>
          ) : null}
        </header>

        {apiError && (
          <GlassCard className="mt-8 border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100/90">
            <p className="font-medium">
              Could not load events ({apiError.status})
            </p>
            <p className="mt-2 text-red-200/70">
              Showing demo rows below. Check API credentials on the server.
            </p>
          </GlassCard>
        )}

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
            {filteredApi.length === 0 ? (
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
