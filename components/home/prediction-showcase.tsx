import Link from "next/link";
import type { Match, MatchPrediction } from "@/lib/types";
import { formatAlliance, pct } from "@/lib/format";
import { GlassCard } from "@/components/ui/glass-card";

type Props = {
  match: Match;
  prediction: MatchPrediction;
};

export function PredictionShowcase({ match, prediction }: Props) {
  const redPct = pct(prediction.redWinProbability);
  const bluePct = pct(prediction.blueWinProbability);
  const r = match.red.teamNumbers.join(",");
  const b = match.blue.teamNumbers.join(",");

  return (
    <section id="predictions" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16">
      <div className="mb-4 sm:mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-300/55">
          Predictor showcase
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          What the matchup screen looks like
        </h2>
      </div>

      <GlassCard glow="violet" className="overflow-hidden p-0">
        <div className="border-b border-white/[0.06] bg-violet-950/20 px-4 py-4 sm:px-6 sm:py-5 md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                {match.label}
              </p>
              <p className="mt-1 text-base font-medium text-white/90 sm:text-lg">
                Example (fake team numbers)
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                prediction.favored === "red"
                  ? "border-red-400/30 bg-red-500/15 text-red-200"
                  : "border-blue-400/30 bg-blue-500/15 text-blue-200"
              }`}
            >
              Favored: {prediction.favored === "red" ? "Red" : "Blue"} ·{" "}
              <span className="text-white/70">
                {prediction.confidence} confidence
              </span>
            </span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-2">
          <div className="border-b border-white/[0.06] p-4 sm:p-6 md:p-8 lg:border-b-0 lg:border-r">
            <p className="text-[10px] uppercase tracking-[0.2em] text-red-300/70 sm:text-xs">
              Red alliance
            </p>
            <p className="mt-2 font-mono text-base text-white/95 sm:mt-3 sm:text-xl">
              {formatAlliance(match.red.teamNumbers)}
            </p>
            <p className="mt-4 text-4xl font-semibold tabular-nums text-red-200/95 sm:mt-6 sm:text-5xl">
              {redPct}
            </p>
            <p className="mt-1 text-xs text-white/45 sm:text-sm">Win probability</p>
          </div>
          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300/70 sm:text-xs">
              Blue alliance
            </p>
            <p className="mt-2 font-mono text-base text-white/95 sm:mt-3 sm:text-xl">
              {formatAlliance(match.blue.teamNumbers)}
            </p>
            <p className="mt-4 text-4xl font-semibold tabular-nums text-blue-200/95 sm:mt-6 sm:text-5xl">
              {bluePct}
            </p>
            <p className="mt-1 text-xs text-white/45 sm:text-sm">Win probability</p>
          </div>
        </div>

        <div className="border-t border-white/[0.06] bg-[#070512]/80 px-4 py-5 sm:px-6 sm:py-6 md:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40">
            Why the edge
          </p>
          <ul className="mt-3 space-y-2">
            {prediction.reasons.map((reason) => (
              <li key={reason} className="flex gap-3 text-sm text-white/65">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/80" />
                {reason}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/predictions?r=${encodeURIComponent(r)}&b=${encodeURIComponent(b)}`}
              className="inline-flex rounded-xl border border-violet-400/30 bg-violet-500/15 px-4 py-2.5 text-sm font-medium text-violet-100 transition hover:bg-violet-500/25"
            >
              Open in Predictor
            </Link>
            <Link
              href={`/matches/demo/${match.slug ?? match.id}`}
              className="inline-flex rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
            >
              Match page
            </Link>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
