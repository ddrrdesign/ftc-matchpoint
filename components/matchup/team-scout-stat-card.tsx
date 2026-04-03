import { GlassCard } from "@/components/ui/glass-card";
import type { QuickStats, ScoutTeam } from "@/lib/ftc-scout/types";
import { percentile } from "@/lib/ftc-scout/math";

type Props = {
  team: ScoutTeam | null;
  stats: QuickStats | null;
  bestOprNp: number | null;
  error?: string;
};

function Row({
  label,
  value,
  rank,
  pool,
}: {
  label: string;
  value: string;
  rank?: number;
  pool?: number;
}) {
  const pct =
    rank != null && pool != null && pool > 0
      ? percentile(rank, pool)
      : null;
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] py-2 text-sm last:border-0">
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

export function TeamScoutStatCard({ team, stats, bestOprNp, error }: Props) {
  if (error) {
    return (
      <GlassCard className="p-5 text-sm text-red-200/90">{error}</GlassCard>
    );
  }

  const n = team?.number ?? stats?.number;
  const pool = stats?.count;

  return (
    <GlassCard glow="violet" className="p-5">
      <p className="font-mono text-2xl font-semibold tabular-nums">{n}</p>
      <p className="mt-1 text-sm font-medium text-white/90">
        {team?.name ?? "-"}
      </p>
      <p className="text-xs text-white/45">
        {[team?.city, team?.state, team?.country].filter(Boolean).join(", ") ||
          ""}
      </p>

      {stats ? (
        <>
          <div className="mt-4 space-y-0">
            <Row
              label={
                stats.statsScopeEventCode
                  ? `Total NP (${stats.statsScopeEventCode})`
                  : "Total NP (composite)"
              }
              value={stats.tot.value.toFixed(1)}
              rank={stats.tot.rank}
              pool={pool}
            />
            <Row
              label="Auto"
              value={stats.auto.value.toFixed(1)}
              rank={stats.auto.rank}
              pool={pool}
            />
            <Row
              label="Teleop (DC)"
              value={stats.dc.value.toFixed(1)}
              rank={stats.dc.rank}
              pool={pool}
            />
            <Row
              label="Endgame"
              value={stats.eg.value.toFixed(1)}
              rank={stats.eg.rank}
              pool={pool}
            />
          </div>
          {bestOprNp != null && (
            <p className="mt-3 text-xs text-white/50">
              {stats.statsScopeEventCode
                ? "Event OPR (total NP) at predictor source: "
                : "Best event OPR (total NP): "}
              <span className="font-mono text-violet-200/90">
                {bestOprNp.toFixed(1)}
              </span>
            </p>
          )}
          <p className="mt-2 text-[11px] text-white/35">
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
