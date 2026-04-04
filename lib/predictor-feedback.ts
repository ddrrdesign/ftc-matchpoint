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
    return `${side} is slightly ahead on summed Scout Total NP, but the margin is thin — worth watching which alliance owns auto and endgame in practice.`;
  }
  if (conf === "high" || totEdgeAbs >= 50) {
    return `${side} shows a much stronger combined Total NP profile in this data slice; if that holds on the field, they are the logical pre-match favorite.`;
  }
  return `${side} has the better combined Total NP in Scout’s composite — use the Auto / Teleop / Endgame lines below to see where that edge comes from.`;
}

export function predictorSplitHint(
  totEdge: number,
  autoEdge: number | null,
  dcEdge: number | null
): string | null {
  if (autoEdge == null || dcEdge == null) return null;
  const totSign = Math.sign(totEdge);
  const autoSign = Math.sign(autoEdge);
  const dcSign = Math.sign(dcEdge);
  if (totSign !== 0 && autoSign !== 0 && autoSign !== totSign) {
    return "Auto points lean the other way than Total NP — the favorite may be winning on teleop or endgame, not the sandstorm.";
  }
  if (totSign !== 0 && dcSign !== 0 && dcSign !== totSign) {
    return "Teleop (DC) leans opposite the total — check whether one alliance is padding scores in a single phase.";
  }
  return null;
}
