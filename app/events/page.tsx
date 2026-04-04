import { EventBrowseCard } from "@/components/events/event-browse-card";
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
  EVENT_REGION_FALLBACK,
  eventRegionGroupKey,
  eventRegionSectionTitle,
  formatEventDateRange,
  formatEventTypeLine,
  formatEventVenueLine,
  sortRegionGroupKeys,
} from "@/lib/ftc-api/event-presentation";
import { deriveEventStatus, formatEventLocation } from "@/lib/ftc-api/event-status";
import {
  fetchEventListings,
  fetchTeamCountsForEventCodes,
} from "@/lib/ftc-api/service";
import type { SeasonEventModelV2 } from "@/lib/ftc-api/types";

const MAX_TEAM_COUNT_LOOKUPS = 56;

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

function mockRegionGroupKey(e: Event): string {
  const code = e.code.toUpperCase();
  const name = e.name.toLowerCase();
  const loc = e.location.toLowerCase();
  if (code.includes("WORLD") || /^FTCCMP\d*/i.test(code)) {
    return "__WORLDS__";
  }
  if (
    (name.includes("first championship") ||
      name.includes("world festival")) &&
    (name.includes("houston") || name.includes("detroit"))
  ) {
    return "__WORLDS__";
  }
  if (loc.includes("kazakhstan")) return "Kazakhstan";
  return EVENT_REGION_FALLBACK;
}

function mockDateRangeDisplay(e: Event): string | null {
  if (!e.startDate?.trim()) return null;
  return formatEventDateRange({
    dateStart: e.startDate,
    dateEnd: e.endDate,
  });
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
  const filteredMock = filterMockEvents(q);

  const showApi = apiOn && apiRes?.ok && apiEvents.length > 0;

  let teamCounts = new Map<string, number | null>();
  let mergedForMetrics: ReturnType<typeof dedupeEventsByCode> = [];

  if (showApi) {
    mergedForMetrics = dedupeEventsByCode(filteredApi);
    mergedForMetrics.sort((a, b) =>
      compareEventsByStartDesc(a.event, b.event)
    );
    const codes = mergedForMetrics
      .map((m) => m.event.code?.trim())
      .filter((c): c is string => Boolean(c));
    if (codes.length > 0 && codes.length <= MAX_TEAM_COUNT_LOOKUPS) {
      teamCounts = await fetchTeamCountsForEventCodes(season, codes, 8);
    }
  }

  const apiByRegion = new Map<
    string,
    ReturnType<typeof dedupeEventsByCode>
  >();
  if (showApi) {
    for (const m of mergedForMetrics) {
      const key = eventRegionGroupKey(m.event);
      const arr = apiByRegion.get(key) ?? [];
      arr.push(m);
      apiByRegion.set(key, arr);
    }
  }
  const apiRegionKeys = [...apiByRegion.keys()].sort(sortRegionGroupKeys);

  const mockByRegion = new Map<string, Event[]>();
  for (const e of filteredMock) {
    const key = mockRegionGroupKey(e);
    const arr = mockByRegion.get(key) ?? [];
    arr.push(e);
    mockByRegion.set(key, arr);
  }
  const mockRegionKeys = [...mockByRegion.keys()].sort(sortRegionGroupKeys);

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:py-16">
        <header className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-300/55">
            Events
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Season calendar
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/45">
            {showApi
              ? "Worlds is grouped on its own; everything else is filed under country (or region code when the API does not send a country). Each card shows the competition window and how many teams were on the roster when we could load that count."
              : "Sample events so you can see the layout. Connect the FIRST API to pull your season."}
          </p>
          {showApi &&
          mergedForMetrics.length > 0 &&
          mergedForMetrics.filter((m) => m.event.code?.trim()).length >
            MAX_TEAM_COUNT_LOOKUPS ? (
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/35">
              Team totals are fetched per event code. With more than{" "}
              {MAX_TEAM_COUNT_LOOKUPS} distinct codes, cards show “—” for
              teams—narrow the list with search to load counts.
            </p>
          ) : null}
        </header>

        {apiError && (
          <GlassCard className="mt-8 border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100/90">
            <p className="font-medium">
              Could not load live events ({apiError.status})
            </p>
            <p className="mt-2 text-red-200/70">
              Showing sample listings below.
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
              placeholder="Name, code, city, country…"
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
          <div className="mt-14 space-y-14">
            {filteredApi.length === 0 ? (
              <p className="text-white/50">No events match “{q}”.</p>
            ) : (
              apiRegionKeys.map((regionKey) => {
                const slice = apiByRegion.get(regionKey) ?? [];
                return (
                  <section key={regionKey} className="scroll-mt-8">
                    <div className="mb-6 border-b border-white/[0.08] pb-4">
                      <h2 className="text-xl font-semibold tracking-tight text-white">
                        {eventRegionSectionTitle(regionKey)}
                      </h2>
                      <p className="mt-1 text-sm text-white/38">
                        {slice.length}{" "}
                        {slice.length === 1 ? "competition" : "competitions"}
                      </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {slice.map((m) => {
                        const e = m.event;
                        const code = e.code?.trim() ?? "";
                        const st = deriveEventStatus(e);
                        const teamN = code ? teamCounts.get(code) ?? null : null;
                        return (
                          <EventBrowseCard
                            key={code || e.eventId}
                            code={code}
                            name={(e.name ?? code).trim() || "Event"}
                            locationLine={formatEventLocation(e)}
                            venueLine={formatEventVenueLine(e)}
                            typeLine={formatEventTypeLine(e)}
                            dateRange={formatEventDateRange(e)}
                            teamCount={teamN}
                            divisionsNote={
                              m.sourceRowCount > 1
                                ? `${m.sourceRowCount} divisions · one schedule page`
                                : null
                            }
                            status={st}
                            href={`/events/${encodeURIComponent(code || "unknown")}`}
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        ) : null}

        {!showApi || apiError ? (
          <>
            {!showApi && !apiError && (
              <p className="mt-10 max-w-xl text-sm text-white/40">
                Set <span className="font-mono text-white/55">FTC_API_*</span>{" "}
                environment variables to hydrate this view from FIRST.
              </p>
            )}
            <div className="mt-10 space-y-14">
              {filteredMock.length === 0 ? (
                <p className="text-white/50">
                  No sample events match “{q}”.
                </p>
              ) : (
                mockRegionKeys.map((regionKey) => {
                  const slice = mockByRegion.get(regionKey) ?? [];
                  return (
                    <section key={regionKey} className="scroll-mt-8">
                      <div className="mb-6 border-b border-white/[0.08] pb-4">
                        <h2 className="text-xl font-semibold tracking-tight text-white">
                          {eventRegionSectionTitle(regionKey)}
                        </h2>
                        <p className="mt-1 text-sm text-white/38">
                          {slice.length}{" "}
                          {slice.length === 1 ? "competition" : "competitions"}
                        </p>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {slice.map((e) => (
                          <EventBrowseCard
                            key={e.id}
                            code={e.code}
                            name={e.name}
                            locationLine={e.location}
                            venueLine={null}
                            typeLine="Sample · FTC"
                            dateRange={mockDateRangeDisplay(e)}
                            teamCount={e.teamCount}
                            divisionsNote={null}
                            status={e.status}
                            href={`/events/${encodeURIComponent(e.code)}`}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </>
        ) : null}
      </main>
    </PageShell>
  );
}
