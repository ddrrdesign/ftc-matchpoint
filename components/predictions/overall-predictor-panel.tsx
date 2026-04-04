import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { AllianceScoutDeepDive } from "@/components/predictions/alliance-scout-deep-dive";
import { getFtcScoutPredictorEventCode } from "@/lib/ftc-scout/env";
import {
  alliancesQueryComplete,
  alliancesQueryTouched,
  defaultAllianceFieldValues,
  parseAlliancesFromQuery,
  swapAlliancesQueryString,
  type AllianceQuery,
} from "@/lib/predictions/alliance-params";
import { getEffectiveScoutSeason } from "@/lib/ftc-scout/queries";

export type OverallPredictorPanelProps = {
  searchParams: Promise<AllianceQuery>;
  /** Form action and links, e.g. `/predictor` or `/predictions` */
  routeBase: string;
  /**
   * When true, skip horizontal padding (parent page already pads) and tighten
   * vertical rhythm — use on `/predictions` under a section header.
   */
  embedInPage?: boolean;
};

export async function OverallPredictorPanel({
  searchParams,
  routeBase,
  embedInPage = false,
}: OverallPredictorPanelProps) {
  const sp = await searchParams;
  const { red, blue } = parseAlliancesFromQuery(sp);
  const season = await getEffectiveScoutSeason();
  const predictorEventCode = getFtcScoutPredictorEventCode();

  const invalid =
    alliancesQueryTouched(sp) && !alliancesQueryComplete(sp);
  const fieldDefaults = defaultAllianceFieldValues(sp);

  const swapHref =
    red && blue
      ? `${routeBase}?${swapAlliancesQueryString(red, blue)}`
      : routeBase;

  const shellPad = embedInPage
    ? "px-0 py-6 sm:py-8 md:py-10"
    : "px-4 py-10 sm:px-6 sm:py-12 md:py-16";
  const titleCls = embedInPage
    ? "mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl md:text-4xl"
    : "mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl";

  return (
    <div
      className={`mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col ${shellPad}`}
      role="region"
      aria-label="Overall alliance predictor"
    >
      {!embedInPage ? (
        <>
          <div className="max-w-2xl min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-300/55">
              Predictor
            </p>
            <h1 className={titleCls}>Compare alliances</h1>
            <p className="mt-3 text-base leading-relaxed text-white/50 sm:mt-4 sm:text-lg">
              Two red, two blue — one number per field. Alliance Total NP sums from
              FTC Scout
              {predictorEventCode ? (
                <>
                  {" "}
                  (event{" "}
                  <span className="font-mono text-white/55">
                    {predictorEventCode}
                  </span>{" "}
                  when listed for a team; otherwise full-season composite)
                </>
              ) : (
                " (full-season composite)"
              )}
              . Not official — for scouting talks.
            </p>
          </div>

          <ol className="mt-8 max-w-2xl list-inside list-decimal space-y-2 text-sm text-white/45">
            <li>Enter four team numbers (one per slot).</li>
            <li>Compare runs on Total NP sums.</li>
            <li>Open team pages for detail.</li>
          </ol>
        </>
      ) : null}

      <form
        className={`max-w-xl space-y-4 ${embedInPage ? "mt-0" : "mt-10"}`}
        action={routeBase}
        method="get"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-400/25 bg-red-500/[0.06] p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-200/75">
              Red alliance
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="r1" className="text-xs text-red-200/70">
                  Team 1
                </label>
                <input
                  id="r1"
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
                <label htmlFor="r2" className="text-xs text-red-200/70">
                  Team 2
                </label>
                <input
                  id="r2"
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
                <label htmlFor="b1" className="text-xs text-blue-200/70">
                  Team 1
                </label>
                <input
                  id="b1"
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
                <label htmlFor="b2" className="text-xs text-blue-200/70">
                  Team 2
                </label>
                <input
                  id="b2"
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
            className="flex min-h-[48px] w-full touch-manipulation select-none items-center justify-center rounded-xl border border-violet-400/35 bg-violet-500/15 px-8 text-sm font-medium text-violet-100 transition active:bg-violet-500/30 sm:w-auto sm:min-w-[8rem]"
          >
            Compare
          </button>
          <Link
            href={swapHref}
            className="flex min-h-[48px] touch-manipulation select-none items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-white/70 transition active:bg-white/[0.08] sm:min-h-12 sm:min-w-0"
          >
            Swap sides
          </Link>
          <Link
            href={routeBase}
            className="flex min-h-[48px] touch-manipulation select-none items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-white/70 transition active:bg-white/[0.08] sm:min-h-12 sm:min-w-0"
          >
            Reset
          </Link>
        </div>
      </form>

      {invalid && (
        <p className="mt-4 text-sm text-amber-200/90">
          Enter four valid team numbers — one in each field (legacy{" "}
          <span className="font-mono">?r=…&b=…</span> pairs still work).
        </p>
      )}

      {red && blue ? (
        <AllianceScoutDeepDive
          red={red}
          blue={blue}
          scoutSeason={season}
          predictorEventCode={predictorEventCode}
          className="mt-10"
        />
      ) : null}

      {!alliancesQueryTouched(sp) && (
        <GlassCard className="mt-10 max-w-xl p-5 text-sm text-white/50">
          <p>
            Enter four team numbers above, or open an{" "}
            <Link
              href={`${routeBase}?r1=11111&r2=22222&b1=33333&b2=44444`}
              className="text-violet-300 hover:underline"
            >
              example matchup
            </Link>
            .
          </p>
        </GlassCard>
      )}
    </div>
  );
}
