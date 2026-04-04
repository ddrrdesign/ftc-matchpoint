import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { TeamScoutStatCard } from "@/components/matchup/team-scout-stat-card";
import type { QuickStats, TeamEventParticipation } from "@/lib/ftc-scout/types";
import {
  fetchPredictorQuickStats,
  fetchScoutTeam,
  fetchTeamEvents,
  maxOprTotalNp,
  oprTotalNpAtEvent,
} from "@/lib/ftc-scout/queries";
import {
  buildPredictorScoutingRead,
  FTC_GAME_MANUAL_URL,
} from "@/lib/predictor-analysis";
import {
  predictorConfidenceExplanation,
  predictorSplitHint,
  predictorTakeawayParagraph,
} from "@/lib/predictor-feedback";
import { winProbabilitiesFromScoutTotals } from "@/lib/prediction";

const SCOUT_FRESH = { revalidate: 120 } as const;

function bestOprForPredictor(
  ev: TeamEventParticipation[] | null | undefined,
  eventCode: string | null | undefined
): number | null {
  if (!ev?.length) return null;
  if (eventCode) {
    const at = oprTotalNpAtEvent(ev, eventCode);
    if (at != null) return at;
  }
  return maxOprTotalNp(ev);
}

function sumPair(
  a: QuickStats | null,
  b: QuickStats | null,
  key: "auto" | "dc" | "eg"
): number | null {
  if (!a || !b) return null;
  return a[key].value + b[key].value;
}

function BoldSegments({ text }: { text: string }): ReactNode {
  const parts = text.split(/\*\*/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-white/85">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export type AllianceScoutDeepDiveProps = {
  red: [number, number];
  blue: [number, number];
  scoutSeason: number;
  /** Prefer OPR at this Scout event code when a team lists it */
  predictorEventCode?: string | null;
  /** Extra top margin for the block (e.g. event page after FIRST card) */
  className?: string;
  /** Optional label above the block */
  sectionLabel?: ReactNode;
};

/**
 * FTC Scout composite breakdown: win %, narrative, phase edges, per-team cards.
 * Shared by Overall predictor and Event analysis cross-check.
 */
export async function AllianceScoutDeepDive({
  red,
  blue,
  scoutSeason,
  predictorEventCode = null,
  className = "",
  sectionLabel,
}: AllianceScoutDeepDiveProps) {
  const nums = [red[0], red[1], blue[0], blue[1]];

  type Bundle = {
    num: number;
    team: Awaited<ReturnType<typeof fetchScoutTeam>>;
    qs: Awaited<ReturnType<typeof fetchPredictorQuickStats>>;
    ev: Awaited<ReturnType<typeof fetchTeamEvents>>;
  };

  const bundles: Bundle[] = await Promise.all(
    nums.map(async (num) => {
      const [team, ev] = await Promise.all([
        fetchScoutTeam(num, SCOUT_FRESH),
        fetchTeamEvents(num, scoutSeason, SCOUT_FRESH),
      ]);
      const qs = await fetchPredictorQuickStats(num, scoutSeason, ev);
      return { num, team, qs, ev };
    })
  );

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

  const totEdgeAbs = totEdge != null ? Math.abs(totEdge) : 0;
  const predictorTakeaway =
    favoredSide && totEdge != null
      ? predictorTakeawayParagraph(favoredSide, totEdgeAbs, conf)
      : null;
  const predictorConfExpl = predictorConfidenceExplanation(conf);
  const predictorSplit = predictorSplitHint(
    totEdge ?? 0,
    autoEdge,
    dcEdge,
    egEdge
  );

  const scoutingRead =
    q0 && q1 && q2 && q3 && totEdge != null
      ? buildPredictorScoutingRead({
          q0,
          q1,
          q2,
          q3,
          totEdge,
          autoEdge: autoEdge ?? 0,
          dcEdge: dcEdge ?? 0,
          egEdge: egEdge ?? 0,
        })
      : null;

  const whySuffix = predictorEventCode
    ? `, FTC Scout · ${predictorEventCode} OPR where available`
    : ", Scout composite totals";

  return (
    <div className={`min-w-0 ${className}`.trim()}>
      {sectionLabel ? (
        <div className="mb-4 text-sm leading-relaxed text-white/50">
          {sectionLabel}
        </div>
      ) : null}

      {probs && hasStrength && favoredSide ? (
        <GlassCard glow="violet" className="mt-0 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                Scout result
              </p>
              <p className="mt-2 text-xl font-medium capitalize text-white/90">
                {favoredSide === "red" ? "Red" : "Blue"} favored
              </p>
              <p className="mt-1 text-sm text-white/45">
                Model confidence band:{" "}
                <span className="font-medium text-white/70">{conf}</span>
              </p>
              {predictorTakeaway ? (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                  {predictorTakeaway}
                </p>
              ) : null}
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/45">
                {predictorConfExpl}
              </p>
              {predictorSplit ? (
                <p className="mt-2 max-w-xl text-sm text-amber-200/85">
                  {predictorSplit}
                </p>
              ) : null}
              {scoutingRead && scoutingRead.bullets.length > 0 ? (
                <div className="mt-5 max-w-xl border-t border-white/[0.06] pt-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                    Scouting read
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {scoutingRead.bullets.map((line) => (
                      <li
                        key={line}
                        className="flex gap-3 text-sm leading-relaxed text-white/70"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/80" />
                        <span>
                          <BoldSegments text={line} />
                        </span>
                      </li>
                    ))}
                  </ul>
                  {scoutingRead.sampleNote ? (
                    <p className="mt-3 text-xs leading-relaxed text-white/40">
                      {scoutingRead.sampleNote}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3 text-center sm:min-w-[240px]">
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3">
                <p className="text-[10px] uppercase text-red-200/80">Red</p>
                <p className="text-3xl font-semibold tabular-nums text-red-100">
                  {Math.round(probs.red * 100)}%
                </p>
              </div>
              <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3">
                <p className="text-[10px] uppercase text-blue-200/80">Blue</p>
                <p className="text-3xl font-semibold tabular-nums text-blue-100">
                  {Math.round(probs.blue * 100)}%
                </p>
              </div>
            </div>
          </div>

          {totEdge != null ? (
            <div className="mt-8 border-t border-white/[0.06] pt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Why (alliance sums{whySuffix})
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
          ) : null}
          <p className="mt-6 text-[11px] leading-relaxed text-white/35">
            Share: copy URL. Win % uses a logistic on the Total NP gap only (Scout
            composite). Phase labels follow the rulebook:{" "}
            <a
              href={FTC_GAME_MANUAL_URL}
              className="text-violet-400/90 underline"
              target="_blank"
              rel="noreferrer"
            >
              FTC game manual
            </a>
            . Auto / teleop / endgame lines explain where the gap might come from —
            not separate models. Cross-check on{" "}
            <a
              href="https://ftcscout.org"
              className="text-violet-400/90 underline"
              target="_blank"
              rel="noreferrer"
            >
              FTC Scout
            </a>{" "}
            and{" "}
            <a
              href="https://ftc-events.firstinspires.org/#allevents"
              className="text-violet-400/90 underline"
              target="_blank"
              rel="noreferrer"
            >
              FIRST Event Web
            </a>
            .
          </p>
        </GlassCard>
      ) : null}

      <div className="mt-10 grid min-w-0 gap-8 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-red-300/70">
            Red alliance
          </p>
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4">
            {[0, 1].map((i) => {
              const b = bundles[i]!;
              const qs = b.qs.ok ? b.qs.data : null;
              const ev = b.ev.ok ? b.ev.data : null;
              const team = b.team.ok ? b.team.data : null;
              return (
                <div key={b.num} className="min-w-0">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-red-200/50 sm:text-[11px]">
                    Red {i + 1}
                  </p>
                  <TeamScoutStatCard
                    dense
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
                </div>
              );
            })}
          </div>
        </div>
        <div className="min-w-0">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-blue-300/70">
            Blue alliance
          </p>
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4">
            {[2, 3].map((i, idx) => {
              const b = bundles[i]!;
              const qs = b.qs.ok ? b.qs.data : null;
              const ev = b.ev.ok ? b.ev.data : null;
              const team = b.team.ok ? b.team.data : null;
              return (
                <div key={b.num} className="min-w-0">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-blue-200/50 sm:text-[11px]">
                    Blue {idx + 1}
                  </p>
                  <TeamScoutStatCard
                    dense
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
