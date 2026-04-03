import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { MOCK_EVENTS } from "@/lib/mock-data";
import type { Event, EventStatus } from "@/lib/types";
import { isFtcApiConfigured, getFtcSeasonYear } from "@/lib/ftc-api/env";
import { fetchEventListings } from "@/lib/ftc-api/service";
import type { SeasonEventModelV2 } from "@/lib/ftc-api/types";
import {
  deriveEventStatus,
  formatEventLocation,
  uiEventStatusLabel,
} from "@/lib/ftc-api/event-status";

function statusStyles(s: EventStatus): string {
  switch (s) {
    case "live":
      return "border-emerald-400/30 bg-emerald-500/12 text-emerald-200";
    case "upcoming":
      return "border-blue-400/25 bg-blue-500/12 text-blue-200";
    case "completed":
      return "border-white/15 bg-white/[0.06] text-white/65";
  }
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

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-300/55">
            Events
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Browse FTC events
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/50">
            {showApi
              ? "Live listings from FIRST FTC Events API. Search by name, code, or location."
              : "Search sample listings below by name, code, or location."}
          </p>
        </div>

        {apiError && (
          <GlassCard className="mt-8 border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100/90">
            <p className="font-medium">Could not load live events ({apiError.status})</p>
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
              placeholder="Search by name, code, city…"
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
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredApi.length === 0 ? (
              <p className="col-span-full text-white/50">
                No events match “{q}”.
              </p>
            ) : (
              filteredApi.map((e) => {
                const code = e.code ?? "";
                const st = deriveEventStatus(e);
                return (
                  <GlassCard key={e.eventId ?? code} glow="violet" className="flex flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-violet-300/70">
                          {code || "-"}
                        </p>
                        <h2 className="mt-1 text-lg font-semibold leading-snug">
                          {e.name ?? code}
                        </h2>
                        <p className="mt-1 text-sm text-white/45">
                          {formatEventLocation(e)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles(st)}`}
                      >
                        {uiEventStatusLabel(st)}
                      </span>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Link
                        href={`/events/${encodeURIComponent(code)}`}
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.1]"
                      >
                        Open event
                      </Link>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        ) : null}

        {!showApi || apiError ? (
          <>
            {!showApi && !apiError && (
              <p className="mt-10 text-sm text-white/45">Sample event listings:</p>
            )}
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMock.length === 0 ? (
                <p className="col-span-full text-white/50">
                  No sample events match “{q}”.
                </p>
              ) : (
                filteredMock.map((e) => (
                  <GlassCard key={e.id} glow="violet" className="flex flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-violet-300/70">
                          {e.code}
                        </p>
                        <h2 className="mt-1 text-lg font-semibold leading-snug">
                          {e.name}
                        </h2>
                        <p className="mt-1 text-sm text-white/45">
                          {e.location}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles(e.status)}`}
                      >
                        {uiEventStatusLabel(e.status)}
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-white/[0.06] bg-[#080612]/90 px-3 py-2.5">
                        <p className="text-[11px] uppercase tracking-wider text-white/40">
                          Teams
                        </p>
                        <p className="mt-0.5 font-semibold tabular-nums">
                          {e.teamCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-[#080612]/90 px-3 py-2.5">
                        <p className="text-[11px] uppercase tracking-wider text-white/40">
                          Matches
                        </p>
                        <p className="mt-0.5 font-semibold tabular-nums">
                          {e.matchCount}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Link
                        href={`/events/${encodeURIComponent(e.code)}`}
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.1]"
                      >
                        Open event
                      </Link>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </>
        ) : null}
      </main>
    </PageShell>
  );
}
