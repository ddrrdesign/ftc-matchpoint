export type PredictorConf = "low" | "medium" | "high";

/** Short coaching-style readout for the Scout Total-NP predictor. */
export function predictorConfidenceExplanation(conf: PredictorConf): string {
  switch (conf) {
    case "low":
      return "Alliances are close on paper — small mistakes, schedule, or one bad match can flip it. Use this as a tie-breaker in conversation, not a verdict.";
    case "medium":
      return "There is a clear lean from the numbers, but it is still one composite stat — check how each robot contributes before you commit.";
    case "high":
      return "The Total NP gap is large enough that the model leans hard one way — still not a guarantee, but a strong scouting talking point.";
    default:
      return "";
  }
}

export function predictorTakeawayParagraph(
  favored: "red" | "blue",
  totEdgeAbs: number,
  conf: PredictorConf
): string {
  const side = favored === "red" ? "Red" : "Blue";
  if (conf === "low" && totEdgeAbs < 20) {
    return `${side} is slightly ahead on summed Scout Total NP, but the margin is thin — on the field, autonomous consistency, teleop cycles, and endgame tasks (see the game manual) usually decide close matches.`;
  }
  if (conf === "high" || totEdgeAbs >= 50) {
    return `${side} shows a much stronger combined Total NP profile in this data slice; if that holds on the field, they are the logical pre-match favorite — still verify autonomous reliability and endgame against your own notes.`;
  }
  return `${side} has the better combined Total NP in Scout’s composite — the scouting read below breaks down autonomous, teleop (driver-controlled), and endgame NP so you can explain *why* the model leans that way.`;
}

export function predictorSplitHint(
  totEdge: number,
  autoEdge: number | null,
  dcEdge: number | null,
  egEdge: number | null
): string | null {
  if (autoEdge == null || dcEdge == null) return null;
  const totSign = Math.sign(totEdge);
  const autoSign = Math.sign(autoEdge);
  const dcSign = Math.sign(dcEdge);
  const egSign = egEdge != null ? Math.sign(egEdge) : 0;
  if (totSign !== 0 && autoSign !== 0 && autoSign !== totSign) {
    return "Autonomous NP leans the other way than Total NP — the favorite may be building the margin in teleop or endgame, not in the autonomous period.";
  }
  if (totSign !== 0 && dcSign !== 0 && dcSign !== totSign) {
    return "Teleop (driver-controlled) NP leans opposite the total — one side might be stronger in autonomous or endgame while weaker in DC on this slice.";
  }
  if (totSign !== 0 && egSign !== 0 && egSign !== totSign) {
    return "Endgame NP leans the other way than Total NP — the favorite’s edge is coming earlier in the match on these numbers.";
  }
  return null;
}
