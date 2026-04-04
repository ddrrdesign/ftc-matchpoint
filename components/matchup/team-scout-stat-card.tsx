import { GlassCard } from "@/components/ui/glass-card";
import type { QuickStats, ScoutTeam } from "@/lib/ftc-scout/types";
import { percentile } from "@/lib/ftc-scout/math";

type Props = {
  team: ScoutTeam | null;
  stats: QuickStats | null;
  bestOprNp: number | null;
  error?: string;
  /** Tighter layout for side-by-side grids on narrow screens (e.g. Predictor). */
  dense?: boolean;
};

function Row({
  label,
  value,
  rank,
  pool,
  compact,
}: {
  label: string;
  value: string;
  rank?: number;
  pool?: number;
  compact?: boolean;
}) {
  const pct =
    rank != null && pool != null && pool > 0
      ? percentile(rank, pool)
      : null;
  return (
    <div
      className={`flex items-baseline justify-between gap-2 border-b border-white/[0.06] last:border-0 sm:gap-3 ${
        compact
          ? "py-1.5 text-[11px] sm:py-2 sm:text-sm"
          : "py-2 text-sm"
      }`}
    >
      <span className="text-white/45">{label}</span>
      <span className="text-right">
        <span className="font-mono tabular-nums text-white/90">{value}</span>
        {rank != null && (
          <span className="ml-2 text-xs text-white/40">
            #{rank}
            {pct != null ? ` · top ${pct}%` : ""}
          </span>
        )}
      </span>
    </div>
  );
}

export function TeamScoutStatCard({
  team,
  stats,
  bestOprNp,
  error,
  dense,
}: Props) {
  if (error) {
    return (
      <GlassCard
        className={`text-sm text-red-200/90 ${dense ? "p-3 sm:p-4" : "p-5"}`}
      >
        {error}
      </GlassCard>
    );
  }

  const n = team?.number ?? stats?.number;
  const pool = stats?.count;
  const pad = dense ? "p-3 sm:p-4" : "p-5";

  return (
    <GlassCard glow="violet" className={pad}>
      <p
        className={`font-mono font-semibold tabular-nums ${
          dense ? "text-lg sm:text-xl" : "text-2xl"
        }`}
      >
        {n}
      </p>
      <p
        className={`mt-0.5 font-medium text-white/90 sm:mt-1 ${
          dense ? "line-clamp-2 text-[11px] leading-snug sm:text-sm" : "text-sm"
        }`}
      >
        {team?.name ?? "-"}
      </p>
      <p
        className={`text-white/45 ${dense ? "line-clamp-1 text-[10px] sm:text-xs" : "text-xs"}`}
      >
        {[team?.city, team?.state, team?.country].filter(Boolean).join(", ") ||
          ""}
      </p>

      {stats ? (
        <>
          <div className={`space-y-0 ${dense ? "mt-2 sm:mt-3" : "mt-4"}`}>
            <Row
              compact={dense}
              label={
                stats.statsScopeEventCode
                  ? dense
                    ? `Tot (${stats.statsScopeEventCode})`
                    : `Total NP (${stats.statsScopeEventCode})`
                  : dense
                    ? "Total NP"
                    : "Total NP (composite)"
              }
              value={stats.tot.value.toFixed(1)}
              rank={stats.tot.rank}
              pool={pool}
            />
            <Row
              compact={dense}
              label="Auto"
              value={stats.auto.value.toFixed(1)}
              rank={stats.auto.rank}
              pool={pool}
            />
            <Row
              compact={dense}
              label={dense ? "DC" : "Teleop (DC)"}
              value={stats.dc.value.toFixed(1)}
              rank={stats.dc.rank}
              pool={pool}
            />
            <Row
              compact={dense}
              label="Endgame"
              value={stats.eg.value.toFixed(1)}
              rank={stats.eg.rank}
              pool={pool}
            />
          </div>
          {bestOprNp != null && (
            <p
              className={`text-white/50 ${dense ? "mt-2 text-[10px] sm:text-xs" : "mt-3 text-xs"}`}
            >
              {stats.statsScopeEventCode
                ? "Event OPR (total NP) at predictor source: "
                : "Best event OPR (total NP): "}
              <span className="font-mono text-violet-200/90">
                {bestOprNp.toFixed(1)}
              </span>
            </p>
          )}
          <p
            className={`text-white/35 ${dense ? "mt-1.5 text-[9px] leading-snug sm:text-[11px]" : "mt-2 text-[11px]"}`}
          >
            {stats.statsScopeEventCode ? (
              <>
                OPR/avg slice for event{" "}
                <span className="font-mono text-white/45">
                  {stats.statsScopeEventCode}
                </span>
                . Season-wide ranks not shown for this slice.
              </>
            ) : (
              <>
                Ranks vs ~{pool?.toLocaleString()} teams on FTC Scout (composite).
              </>
            )}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-white/45">No quick stats from Scout.</p>
      )}
    </GlassCard>
  );
}
