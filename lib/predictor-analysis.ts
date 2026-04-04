import type { QuickStats } from "@/lib/ftc-scout/types";

/** FTC publishes the current game manual here (phases and scoring definitions). */
export const FTC_GAME_MANUAL_URL =
  "https://ftc-resources.firstinspires.org/ftc/game/manual";

type Side = "red" | "blue";

function sideLabel(s: Side): string {
  return s === "red" ? "Red" : "Blue";
}

function leadingSide(edge: number): Side {
  return edge > 0 ? "red" : "blue";
}

/** How imbalanced the two partners are on a phase (NP points). */
function partnerSpread(a: QuickStats, b: QuickStats, key: "auto" | "dc" | "eg") {
  return Math.abs(a[key].value - b[key].value);
}

/**
 * Short scouting-style bullets from Scout quick-stats (OPR-style NP splits).
 * Wording stays cautious — these are statistical slices, not live robot behavior.
 */
export function buildPredictorScoutingRead(input: {
  q0: QuickStats;
  q1: QuickStats;
  q2: QuickStats;
  q3: QuickStats;
  totEdge: number;
  autoEdge: number;
  dcEdge: number;
  egEdge: number;
}): { bullets: string[]; sampleNote: string | null } {
  const { q0, q1, q2, q3, totEdge, autoEdge, dcEdge, egEdge } = input;

  const minCount = Math.min(q0.count, q1.count, q2.count, q3.count);
  const sampleNote =
    minCount < 8
      ? `Several teams here have a thin match count on Scout (~${minCount} or fewer) — treat phase splits as directional, not definitive.`
      : minCount < 18
        ? "Moderate sample sizes: rankings and NP splits can still move after a few more matches."
        : null;

  const bullets: string[] = [];
  const push = (s: string) => {
    if (!bullets.includes(s)) bullets.push(s);
  };

  const absA = Math.abs(autoEdge);
  const absD = Math.abs(dcEdge);
  const absE = Math.abs(egEdge);
  const phaseSum = absA + absD + absE;

  if (phaseSum >= 12) {
    const shareA = absA / phaseSum;
    const shareD = absD / phaseSum;
    const shareE = absE / phaseSum;
    const dominant = Math.max(shareA, shareD, shareE);
    if (dominant >= 0.48) {
      if (shareD === dominant) {
        push(
          "Most of the NP gap between alliances shows up in **teleop (driver-controlled)** on this data slice — autonomous and endgame are closer by comparison."
        );
      } else if (shareA === dominant) {
        push(
          "The **autonomous** split is doing more of the work in this comparison — check whether what you see in the first 30 seconds matches these NP lines."
        );
      } else {
        push(
          "**Endgame** NP accounts for a large share of the difference here — late-match scoring may matter more than usual in a tight match."
        );
      }
    }
  }

  const autoSmall = 3;
  const phaseMention = 5;

  if (absA >= autoSmall) {
    const s = leadingSide(autoEdge);
    push(
      `${sideLabel(s)} has the stronger **combined autonomous** NP in this slice — on paper they start the match with more scoring pressure before teleop.`
    );
  } else if (phaseSum > 0 && absA <= autoSmall && absD >= phaseMention) {
    push(
      "**Autonomous** NP is almost even between alliances; the lean mostly comes from **teleop** or **endgame**, not the starting period."
    );
  }

  if (Math.abs(dcEdge) >= phaseMention) {
    const s = leadingSide(dcEdge);
    push(
      `${sideLabel(s)} leads on **teleop (driver-controlled)** NP — driver cycles and field play are where that side’s advantage shows up in the numbers.`
    );
  }

  if (Math.abs(egEdge) >= phaseMention) {
    const s = leadingSide(egEdge);
    push(
      `${sideLabel(s)} shows more **endgame** NP in this data — worth watching hang / endgame tasks if the match stays close.`
    );
  }

  const redAutoSp = partnerSpread(q0, q1, "auto");
  const blueAutoSp = partnerSpread(q2, q3, "auto");
  const redDcSp = partnerSpread(q0, q1, "dc");
  const blueDcSp = partnerSpread(q2, q3, "dc");

  const balanceGap = 6;
  if (redAutoSp + balanceGap < blueAutoSp && blueAutoSp >= 8) {
    push(
      "**Red** autonomous looks more **even between partners** on paper; **Blue** has a wider gap between their two auto lines — one partner may be carrying that phase."
    );
  } else if (blueAutoSp + balanceGap < redAutoSp && redAutoSp >= 8) {
    push(
      "**Blue** autonomous looks more **even between partners**; **Red** has a wider auto gap — consistency may depend on which robot leads autonomous."
    );
  }

  if (redDcSp + balanceGap < blueDcSp && blueDcSp >= 10) {
    push(
      "**Red** teleop contribution is more **balanced** between partners; **Blue** shows a bigger teleop split — one bot may be doing more of the DC scoring."
    );
  } else if (blueDcSp + balanceGap < redDcSp && redDcSp >= 10) {
    push(
      "**Blue** teleop is more **balanced** between partners; **Red** has a larger teleop gap on these numbers."
    );
  }

  const totAbs = Math.abs(totEdge);
  if (totAbs >= 8 && totAbs < 35 && absA < autoSmall && absD < autoSmall) {
    push(
      "Overall NP favors one side only slightly, and **auto/teleop splits are tight** — expect scouting and execution to matter more than the composite."
    );
  }

  if (bullets.length === 0) {
    push(
      "Scout’s **autonomous**, **teleop**, and **endgame** lines are all in the same ballpark for these four teams — the matchup may come down to reliability and strategy beyond what NP splits show."
    );
  }

  return { bullets: bullets.slice(0, 6), sampleNote };
}
