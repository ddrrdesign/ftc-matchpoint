import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { TeamScoutStatCard } from "@/components/matchup/team-scout-stat-card";
import { getFtcScoutPredictorEventCode } from "@/lib/ftc-scout/env";
import type { QuickStats, TeamEventParticipation } from "@/lib/ftc-scout/types";
import {
  fetchPredictorQuickStats,
  fetchScoutTeam,
  fetchTeamEvents,
  getEffectiveScoutSeason,
  maxOprTotalNp,
  oprTotalNpAtEvent,
} from "@/lib/ftc-scout/queries";
import { winProbabilitiesFromScoutTotals } from "@/lib/prediction";

/** ISR: keep Predictor numbers relatively fresh during Championship week. */
export const revalidate = 120;

const SCOUT_FRESH = { revalidate: 120 } as const;

function bestOprForPredictor(
  ev: TeamEventParticipation[] | null | undefined,
  eventCode: string | null
): number | null {
  if (!ev?.length) return null;
  if (eventCode) {
    const at = oprTotalNpAtEvent(ev, eventCode);
    if (at != null) return at;
  }
  return maxOprTotalNp(ev);
}

type Search = { r?: string; b?: string };

function parsePair(raw: string | undefined): number[] | null {
  if (!raw?.trim()) return null;
  const parts = raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  const nums = parts.map((p) => Number.parseInt(p, 10));
  if (nums.length !== 2 || nums.some((n) => Number.isNaN(n) || n <= 0)) {
    return null;
  }
  return nums;
}

function sumPair(
  a: QuickStats | null,
  b: QuickStats | null,
  key: "auto" | "dc" | "eg"
): number | null {
  if (!a || !b) return null;
  return a[key].value + b[key].value;
}

type Props = { searchParams: Promise<Search> };

export default async function PredictorPage({ searchParams }: Props) {
  const sp = await searchParams;
  const red = parsePair(sp.r);
  const blue = parsePair(sp.b);
  /** Resolves to a year Scout actually accepts (e.g. 2025 while 2026 returns Invalid season). */
  const season = await getEffectiveScoutSeason();
  const predictorEventCode = getFtcScoutPredictorEventCode();

  const invalid =
    (sp.r?.trim() || sp.b?.trim()) && (!red || !blue);

  type Bundle = {
    num: number;
    team: Awaited<ReturnType<typeof fetchScoutTeam>>;
    qs: Awaited<ReturnType<typeof fetchPredictorQuickStats>>;
    ev: Awaited<ReturnType<typeof fetchTeamEvents>>;
  };

  let bundles: Bundle[] = [];

  if (red && blue) {
    const nums = [red[0]!, red[1]!, blue[0]!, blue[1]!];
    bundles = await Promise.all(
      nums.map(async (num) => {
        const [team, ev] = await Promise.all([
          fetchScoutTeam(num, SCOUT_FRESH),
          fetchTeamEvents(num, season, SCOUT_FRESH),
        ]);
        const qs = await fetchPredictorQuickStats(num, season, ev);
        return { num, team, qs, ev };
      })
    );
  }

  let redStrength = 0;
  let blueStrength = 0;
  let hasStrength = false;

  if (bundles.length === 4) {
    const qs = bundles.map((b) => (b.qs.ok ? b.qs.data : null));
    if (qs[0] && qs[1] && qs[2] && qs[3]) {
      redStrength = qs[0].tot.value + qs[1].tot.value;
      blueStrength = qs[2].tot.value + qs[3].tot.value;
      hasStrength = true;
    }
  }

  const probs = hasStrength
    ? winProbabilitiesFromScoutTotals(redStrength, blueStrength)
    : null;
  const conf: "low" | "medium" | "high" = hasStrength
    ? (() => {
        const g = Math.abs(redStrength - blueStrength);
        if (g < 15) return "low";
        if (g < 40) return "medium";
        return "high";
      })()
    : "low";

  const qsArr =
    bundles.length === 4
      ? bundles.map((b) => (b.qs.ok ? b.qs.data : null))
      : [];
  const q0 = qsArr[0] ?? null;
  const q1 = qsArr[1] ?? null;
  const q2 = qsArr[2] ?? null;
  const q3 = qsArr[3] ?? null;

  const totEdge =
    q0 && q1 && q2 && q3 ? redStrength - blueStrength : null;
  const autoEdge =
    q0 && q1 && q2 && q3
      ? sumPair(q0, q1, "auto")! - sumPair(q2, q3, "auto")!
      : null;
  const dcEdge =
    q0 && q1 && q2 && q3
      ? sumPair(q0, q1, "dc")! - sumPair(q2, q3, "dc")!
      : null;
  const egEdge =
    q0 && q1 && q2 && q3
      ? sumPair(q0, q1, "eg")! - sumPair(q2, q3, "eg")!
      : null;

  const favoredSide =
    probs == null ? null : probs.red >= probs.blue ? "red" : "blue";

  const swapHref =
    red && blue
      ? `/predictor?r=${encodeURIComponent(`${blue[0]},${blue[1]}`)}&b=${encodeURIComponent(`${red[0]},${red[1]}`)}`
      : "/predictor";

  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-12 md:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-300/55">
            Predictor
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Compare alliances
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/50">
            Two red, two blue. Alliance Total NP sums from FTC Scout (season{" "}
            {season}
            {predictorEventCode ? (
              <>
                ; matchup uses event{" "}
                <span className="font-mono text-white/55">
                  {predictorEventCode}
                </span>{" "}
                when the team has a row there, otherwise season composite
              </>
            ) : null}
            ). Not official — for scouting talks.
          </p>
        </div>

        <ol className="mt-8 max-w-2xl list-inside list-decimal space-y-2 text-sm text-white/45">
          <li>Enter four team numbers (two per side).</li>
          <li>Compare runs on Total NP sums.</li>
          <li>Open team pages for detail.</li>
        </ol>

        <form
          className="mt-10 max-w-xl space-y-4"
          action="/predictor"
          method="get"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="r" className="text-xs text-red-200/70">
                Red
              </label>
              <input
                id="r"
                name="r"
                type="text"
                defaultValue={sp.r ?? ""}
                placeholder="11111, 22222"
                className="mt-1 min-h-12 w-full rounded-xl border border-red-400/25 bg-red-500/[0.07] px-4 py-3 font-mono text-sm text-white placeholder:text-white/30 outline-none focus:border-red-400/45"
              />
            </div>
            <div>
              <label htmlFor="b" className="text-xs text-blue-200/70">
                Blue
              </label>
              <input
                id="b"
                name="b"
                type="text"
                defaultValue={sp.b ?? ""}
                placeholder="33333, 44444"
                className="mt-1 min-h-12 w-full rounded-xl border border-blue-400/25 bg-blue-500/[0.07] px-4 py-3 font-mono text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-400/45"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="submit"
              className="flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl border border-violet-400/35 bg-violet-500/15 px-8 text-sm font-medium text-violet-100 transition active:bg-violet-500/30 sm:w-auto sm:min-w-[8rem]"
            >
              Compare
            </button>
            <Link
              href={swapHref}
              className="flex min-h-12 touch-manipulation items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-white/70 transition active:bg-white/[0.08] sm:min-w-0"
            >
              Swap sides
            </Link>
            <Link
              href="/predictor"
              className="flex min-h-12 touch-manipulation items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-white/70 transition active:bg-white/[0.08] sm:min-w-0"
            >
              Reset
            </Link>
          </div>
        </form>

        {invalid && (
          <p className="mt-4 text-sm text-amber-200/90">
            Need two numbers per side (comma or space).
          </p>
        )}

        {red && blue && bundles.length === 4 && (
          <>
            {probs && hasStrength && favoredSide && (
              <GlassCard glow="violet" className="mt-10 p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                      Result
                    </p>
                    <p className="mt-2 text-xl font-medium capitalize text-white/90">
                      {favoredSide === "red" ? "Red" : "Blue"} favored
                    </p>
                    <p className="mt-1 text-sm text-white/45">
                      Confidence: {conf} · low sample = treat as weak signal
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center sm:min-w-[240px]">
                    <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3">
                      <p className="text-[10px] uppercase text-red-200/80">
                        Red
                      </p>
                      <p className="text-3xl font-semibold tabular-nums text-red-100">
                        {Math.round(probs.red * 100)}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3">
                      <p className="text-[10px] uppercase text-blue-200/80">
                        Blue
                      </p>
                      <p className="text-3xl font-semibold tabular-nums text-blue-100">
                        {Math.round(probs.blue * 100)}%
                      </p>
                    </div>
                  </div>
                </div>

                {totEdge != null && (
                  <div className="mt-8 border-t border-white/[0.06] pt-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      Why (alliance sums
                      {predictorEventCode
                        ? `, FTC Scout · ${predictorEventCode} OPR where available`
                        : ", Scout season composite"}
                      )
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-white/70">
                      <li>
                        Total NP:{" "}
                        <span className="font-mono text-white/90">
                          {totEdge > 0 ? "+" : ""}
                          {totEdge.toFixed(1)}
                        </span>{" "}
                        toward {totEdge > 0 ? "Red" : "Blue"}
                      </li>
                      {autoEdge != null && (
                        <li>
                          Auto:{" "}
                          <span className="font-mono">
                            {autoEdge > 0 ? "+" : ""}
                            {autoEdge.toFixed(1)}
                          </span>{" "}
                          toward {autoEdge > 0 ? "Red" : "Blue"}
                        </li>
                      )}
                      {dcEdge != null && (
                        <li>
                          Teleop (DC):{" "}
                          <span className="font-mono">
                            {dcEdge > 0 ? "+" : ""}
                            {dcEdge.toFixed(1)}
                          </span>{" "}
                          toward {dcEdge > 0 ? "Red" : "Blue"}
                        </li>
                      )}
                      {egEdge != null && (
                        <li>
                          Endgame:{" "}
                          <span className="font-mono">
                            {egEdge > 0 ? "+" : ""}
                            {egEdge.toFixed(1)}
                          </span>{" "}
                          toward {egEdge > 0 ? "Red" : "Blue"}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                <p className="mt-6 text-[11px] text-white/35">
                  Share: copy URL. Model = logistic on Total NP gap only; splits
                  above are diagnostic, not separate models.
                </p>
              </GlassCard>
            )}

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-red-300/70">
                  Red
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[0, 1].map((i) => {
                    const b = bundles[i]!;
                    const qs = b.qs.ok ? b.qs.data : null;
                    const ev = b.ev.ok ? b.ev.data : null;
                    const team = b.team.ok ? b.team.data : null;
                    return (
                      <TeamScoutStatCard
                        key={b.num}
                        team={team}
                        stats={qs}
                        bestOprNp={bestOprForPredictor(ev, predictorEventCode)}
                        error={
                          !b.qs.ok
                            ? `Scout: ${b.qs.status}`
                            : !b.team.ok
                              ? `Team ${b.num}: ${b.team.status}`
                              : undefined
                        }
                      />
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-blue-300/70">
                  Blue
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[2, 3].map((i) => {
                    const b = bundles[i]!;
                    const qs = b.qs.ok ? b.qs.data : null;
                    const ev = b.ev.ok ? b.ev.data : null;
                    const team = b.team.ok ? b.team.data : null;
                    return (
                      <TeamScoutStatCard
                        key={b.num}
                        team={team}
                        stats={qs}
                        bestOprNp={bestOprForPredictor(ev, predictorEventCode)}
                        error={
                          !b.qs.ok
                            ? `Scout: ${b.qs.status}`
                            : !b.team.ok
                              ? `Team ${b.num}: ${b.team.status}`
                              : undefined
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {!sp.r?.trim() && !sp.b?.trim() && (
          <GlassCard className="mt-10 max-w-xl p-5 text-sm text-white/50">
            <p>
              Enter four team numbers above, or open an{" "}
              <Link
                href="/predictor?r=11111%2C22222&b=33333%2C44444"
                className="text-violet-300 hover:underline"
              >
                example matchup
              </Link>
              .
            </p>
          </GlassCard>
        )}
      </main>
    </PageShell>
  );
}
