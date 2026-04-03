import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { fetchTeamsSearch } from "@/lib/ftc-scout/queries";
import { getFtcScoutSeason } from "@/lib/ftc-scout/env";

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function TeamsSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.q;
  const q = typeof raw === "string" ? raw.trim() : "";
  const season = getFtcScoutSeason();

  const searchResult = q ? await fetchTeamsSearch(q) : null;
  const teams = searchResult?.ok ? searchResult.data : [];
  const error =
    searchResult && !searchResult.ok
      ? { status: searchResult.status, message: searchResult.message }
      : null;

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-12 md:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-300/55">
            Teams
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Find a team
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/50">
            Search by team number or name - data from{" "}
            <a
              href="https://ftcscout.org"
              className="text-violet-300/90 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              FTC Scout
            </a>{" "}
            (season {season} on team pages).
          </p>
        </div>

        <form
          className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
          action="/teams"
          method="get"
        >
          <div className="min-w-0 flex-1">
            <label htmlFor="q" className="text-xs text-white/45">
              Search
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="e.g. 27772 or JelToqSun"
              autoComplete="off"
              className="mt-1 min-h-12 w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-3 font-mono text-base text-white placeholder:text-white/30 outline-none focus:border-violet-400/35 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="flex min-h-12 touch-manipulation items-center justify-center rounded-xl border border-violet-400/35 bg-violet-500/15 px-8 text-sm font-medium text-violet-100 transition active:bg-violet-500/30 sm:min-h-0 sm:py-3"
          >
            Search
          </button>
        </form>

        {error && (
          <GlassCard className="mt-8 border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100/90">
            <p className="font-medium">Scout search failed ({error.status})</p>
            <p className="mt-2 text-red-200/70">{error.message}</p>
          </GlassCard>
        )}

        {q && !error && (
          <div className="mt-10">
            <p className="text-sm text-white/45">
              {teams.length === 0
                ? "No teams match that query."
                : `${teams.length} result${teams.length === 1 ? "" : "s"}`}
            </p>
            <ul className="mt-4 space-y-3">
              {teams.map((t) => {
                const loc = [t.city, t.state, t.country]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <li key={t.number}>
                    <Link href={`/teams/${t.number}`}>
                      <GlassCard className="p-4 transition hover:border-violet-400/25 hover:bg-white/[0.04]">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-mono text-lg font-semibold text-violet-200/95">
                            {t.number}
                          </span>
                          {t.rookieYear != null && (
                            <span className="text-xs text-white/35">
                              Rookie {t.rookieYear}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-medium text-white/90">
                          {t.name ?? "-"}
                        </p>
                        {loc ? (
                          <p className="mt-1 text-sm text-white/45">{loc}</p>
                        ) : null}
                      </GlassCard>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!q && (
          <GlassCard className="mt-10 max-w-xl p-5 text-sm text-white/50">
            <p>
              Try a number you know, or part of a team name. Results open the
              team page with Scout stats for this season.
            </p>
            <p className="mt-3">
              Example:{" "}
              <Link
                href="/teams?q=27772"
                className="text-violet-300 hover:underline"
              >
                27772
              </Link>
              ,{" "}
              <Link
                href="/teams?q=Kazakhstan"
                className="text-violet-300 hover:underline"
              >
                Kazakhstan
              </Link>
              .
            </p>
          </GlassCard>
        )}
      </main>
    </PageShell>
  );
}
