import type { TeamEventStats } from "@/lib/types";

type Pair = readonly [TeamEventStats, TeamEventStats];

function sumPhase(a: TeamEventStats, b: TeamEventStats, key: "avgAuto" | "avgTeleop" | "avgEndgame" | "avgTotal"): number {
  return a[key] + b[key];
}

function spreadPhase(a: TeamEventStats, b: TeamEventStats, key: "avgAuto" | "avgTeleop" | "avgEndgame" | "avgTotal"): number {
  return Math.abs(a[key] - b[key]);
}

function strongerSide(redSum: number, blueSum: number): "red" | "blue" | "even" {
  const d = redSum - blueSum;
  if (Math.abs(d) < 4) return "even";
  return d > 0 ? "red" : "blue";
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

/**
 * Human-readable matchup notes for demo matches (mock Central Asia stats).
 * Mirrors rulebook phases: autonomous, teleop, endgame.
 */
export function buildDemoComparisonAxes(
  red: Pair,
  blue: Pair
): { title: string; body: string }[] {
  const rAuto = sumPhase(red[0], red[1], "avgAuto");
  const bAuto = sumPhase(blue[0], blue[1], "avgAuto");
  const rTel = sumPhase(red[0], red[1], "avgTeleop");
  const bTel = sumPhase(blue[0], blue[1], "avgTeleop");
  const rEg = sumPhase(red[0], red[1], "avgEndgame");
  const bEg = sumPhase(blue[0], blue[1], "avgEndgame");
  const rTot = sumPhase(red[0], red[1], "avgTotal");
  const bTot = sumPhase(blue[0], blue[1], "avgTotal");

  const rAutoSp = spreadPhase(red[0], red[1], "avgAuto");
  const bAutoSp = spreadPhase(blue[0], blue[1], "avgAuto");
  const rTelSp = spreadPhase(red[0], red[1], "avgTeleop");
  const bTelSp = spreadPhase(blue[0], blue[1], "avgTeleop");

  const rCons = (red[0].consistency + red[1].consistency) / 2;
  const bCons = (blue[0].consistency + blue[1].consistency) / 2;

  const autoWinner = strongerSide(rAuto, bAuto);
  const telWinner = strongerSide(rTel, bTel);
  const egWinner = strongerSide(rEg, bEg);
  const totWinner = strongerSide(rTot, bTot);

  const autoBody = (() => {
    const bits = [
      `Combined autonomous: Red ~${rAuto.toFixed(0)} pts vs Blue ~${bAuto.toFixed(0)} (event averages in this sample).`,
    ];
    if (autoWinner === "even") {
      bits.push("Call it a wash on paper — neither alliance owns a clear auto edge.");
    } else {
      bits.push(
        `${autoWinner === "red" ? "Red" : "Blue"} looks stronger in the autonomous period before drivers take over.`
      );
    }
    if (rAutoSp + 6 < bAutoSp && bAutoSp > 10) {
      bits.push("Blue’s two robots are farther apart in auto — one partner may be carrying that phase.");
    } else if (bAutoSp + 6 < rAutoSp && rAutoSp > 10) {
      bits.push("Red’s auto split between partners is wider — watch which bot leads the 30-second start.");
    } else {
      bits.push("Both alliances split auto fairly evenly between partners on these numbers.");
    }
    return bits.join(" ");
  })();

  const teleopBody = (() => {
    const bits = [
      `Teleop (driver-controlled) totals: Red ~${rTel.toFixed(0)} vs Blue ~${bTel.toFixed(0)}.`,
    ];
    if (telWinner === "even") {
      bits.push("Teleop scoring is close — cycles and penalties will swing it.");
    } else {
      bits.push(
        `${telWinner === "red" ? "Red" : "Blue"} has more teleop in the tank here, matching how the manual scores the DC period.`
      );
    }
    if (rTelSp + 8 < bTelSp && bTelSp > 12) {
      bits.push("Blue teleop is uneven between partners — alliance chemistry matters.");
    } else if (bTelSp + 8 < rTelSp && rTelSp > 12) {
      bits.push("Red shows a bigger teleop gap between partners.");
    }
    return bits.join(" ");
  })();

  const endgameBody = (() => {
    const bits = [
      `Endgame: Red ~${rEg.toFixed(0)} vs Blue ~${bEg.toFixed(0)} (hang / endgame tasks in the manual).`,
    ];
    if (egWinner === "even") {
      bits.push("Endgame is roughly even — a single failed hang can flip perception.");
    } else {
      bits.push(
        `${egWinner === "red" ? "Red" : "Blue"} projects more late-match scoring; clutch endgame could decide a tight one.`
      );
    }
    return bits.join(" ");
  })();

  const consistencyBody = (() => {
    const bits = [
      `Consistency (0–1, higher = steadier match-to-match in this mock): Red ~${pct(rCons)} vs Blue ~${pct(bCons)}.`,
    ];
    if (Math.abs(rCons - bCons) < 0.06) {
      bits.push("Similar volatility — neither side is clearly “safer” from randomness.");
    } else if (rCons > bCons) {
      bits.push("Red’s line is a bit more stable; Blue has wider swing match to match.");
    } else {
      bits.push("Blue looks steadier in this slice; Red may depend on peak performances.");
    }
    return bits.join(" ");
  })();

  const avgTotalBody = (() => {
    const bits = [
      `Sum of team average totals: Red ~${rTot.toFixed(0)} vs Blue ~${bTot.toFixed(0)}.`,
    ];
    if (totWinner === "even") {
      bits.push("Overall strength is neck-and-neck — the predictor leans on tiny gaps.");
    } else {
      bits.push(
        `${totWinner === "red" ? "Red" : "Blue"} leads the composite; check whether auto, teleop, or endgame drives that (see cards above).`
      );
    }
    const sameAsTot =
      autoWinner === totWinner && telWinner === totWinner && egWinner === totWinner;
    if (!sameAsTot && totWinner !== "even") {
      bits.push("Note: the favorite on total is not winning every phase — look for counter-strategy openings.");
    }
    return bits.join(" ");
  })();

  return [
    { title: "Autonomous", body: autoBody },
    { title: "Teleop", body: teleopBody },
    { title: "Endgame", body: endgameBody },
    { title: "Consistency", body: consistencyBody },
    { title: "Avg total", body: avgTotalBody },
  ];
}
