import Link from "next/link";
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

export const revalidate = 120;

const FTC_API_DOCS = "https://ftc-events.firstinspires.org/api-docs/index.html";
const FTC_EVENTS_HOME = "https://ftc-events.firstinspires.org/#allevents";
const FTC_SCOUT = "https://ftcscout.org";
const FTC_SCOUT_API = "https://ftcscout.org/api/rest";

type Search = { r?: string; b?: string; q?: string };

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
  const apiOn = isFtcApiConfigured();
  const sp = await searchParams;
  const eventQuery = typeof sp.q === "string" ? sp.q : "";
  const r = typeof sp.r === "string" ? sp.r : "";
  const b = typeof sp.b === "string" ? sp.b : "";

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

        <section
          id="overall"
          className="scroll-mt-24 border-t border-white/[0.08] pt-12 mt-12 sm:pt-14 sm:mt-14"
        >
          <h2 className="text-xl font-semibold text-white/95 sm:text-2xl">
            1 · Overall analysis
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
            Global scouting picture: enter any four team numbers (two per alliance).
            Not tied to a single event — powered by Scout quick stats / OPR-style
            splits.
          </p>
          <OverallPredictorPanel
            searchParams={Promise.resolve(sp)}
            routeBase="/predictions"
            embedInPage
          />
        </section>

        <section
          id="event-analysis"
          className="scroll-mt-24 border-t border-white/[0.08] pt-12 mt-16 sm:pt-14 sm:mt-20"
        >
          <h2 className="text-xl font-semibold text-white/95 sm:text-2xl">
            2 · Event analysis
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
            Catalog covers the configured FIRST API season
            {catalogSeasons.length > 1
              ? `s (${catalogSeasons.map((y) => formatFtcSeasonRangeLabel(y)).join(", ")})`
              : ` (${formatFtcSeasonRangeLabel(
                  catalogSeasons[0] ?? getFtcSeasonYear()
                )})`}
            : live, upcoming, and completed events (aligned with{" "}
            <a
              href={FTC_EVENTS_HOME}
              className="text-violet-300/85 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Event Web
            </a>{" "}
            and{" "}
            <a
              href={ftcScoutEventsUrl}
              className="text-sky-300/85 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FTC Scout
            </a>
            ). You can only predict alliances from teams registered at that event;
            confidence rises as qualification and playoff data appear in the API.
          </p>

          {!apiOn ? (
            <GlassCard className="mt-8 max-w-2xl border-amber-400/25 bg-amber-500/10 p-5 text-sm text-amber-50/95">
              <p className="font-medium text-amber-100">
                FIRST API не настроен на сервере
              </p>
              <p className="mt-2 text-amber-100/85">
                Чтобы список активных ивентов и предикты по площадке работали, задайте{" "}
                <span className="font-mono">FTC_API_USERNAME</span> и{" "}
                <span className="font-mono">FTC_API_KEY</span> (см.{" "}
                <a
                  href={FTC_API_DOCS}
                  className="text-amber-200 underline hover:text-amber-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  документацию FTC Events API
                </a>
                ). Режим Overall выше всё равно доступен через Scout.
              </p>
            </GlassCard>
          ) : allSeasonEvents.length === 0 ? (
            <GlassCard className="mt-8 max-w-2xl border-white/[0.08] bg-white/[0.03] p-6 text-center">
              <p className="text-lg font-medium text-white/85">
                Нет ивентов в каталоге
              </p>
              <p className="mt-2 text-sm text-white/45">
                API вернул пустой список для выбранных сезонов. Проверьте{" "}
                <span className="font-mono">FTC_SEASON_YEAR</span> /{" "}
                <span className="font-mono">FTC_PREDICTIONS_API_SEASONS</span> и
                страницу{" "}
                <Link href="/events" className="text-violet-300 hover:underline">
                  Events
                </Link>
                .
              </p>
            </GlassCard>
          ) : eventRows.length === 0 ? (
            <GlassCard className="mt-8 max-w-2xl border-white/[0.08] bg-white/[0.03] p-6 text-center">
              <p className="text-lg font-medium text-white/85">
                Ничего не найдено
              </p>
              <p className="mt-2 text-sm text-white/45">
                По запросу «{eventQuery}» нет совпадений среди{" "}
                {allSeasonEvents.length.toLocaleString()} ивентов. Очистите поиск или
                уточните название / код / город.
              </p>
            </GlassCard>
          ) : (
            <>
              <form
                action="/predictions"
                method="get"
                className="mt-8 flex min-w-0 max-w-2xl flex-col gap-3 sm:flex-row sm:items-center"
              >
                {r ? <input type="hidden" name="r" value={r} /> : null}
                {b ? <input type="hidden" name="b" value={b} /> : null}
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Поиск ивента</span>
                  <input
                    type="search"
                    name="q"
                    defaultValue={eventQuery}
                    placeholder="Название, код, город…"
                    className="w-full min-h-12 rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-violet-400/40"
                    autoComplete="off"
                  />
                </label>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="submit"
                    className="min-h-12 touch-manipulation rounded-xl bg-violet-500/90 px-5 text-sm font-medium text-white hover:bg-violet-500"
                  >
                    Найти
                  </button>
                  {eventQuery ? (
                    <Link
                      href={
                        r || b
                          ? `/predictions?${new URLSearchParams({ ...(r ? { r } : {}), ...(b ? { b } : {}) }).toString()}`
                          : "/predictions"
                      }
                      className="inline-flex min-h-12 items-center touch-manipulation rounded-xl border border-white/[0.15] px-4 text-sm text-white/70 hover:bg-white/[0.06]"
                    >
                      Сброс
                    </Link>
                  ) : null}
                </div>
              </form>
              <p className="mt-3 text-xs text-white/38">
                Показано {eventRows.length.toLocaleString()} из{" "}
                {allSeasonEvents.length.toLocaleString()} ивентов
                {eventQuery ? ` · запрос «${eventQuery}»` : ""}
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
        </section>
      </main>
    </PageShell>
  );
}
