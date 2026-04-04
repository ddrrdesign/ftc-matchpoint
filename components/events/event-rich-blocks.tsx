import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import type {
  AwardAssignmentModelV2,
  TeamRankingModel,
} from "@/lib/ftc-api/types";

function hasSortCols(rows: TeamRankingModel[]) {
  return {
    s1: rows.some((r) => r.sortOrder1 != null),
    s2: rows.some((r) => r.sortOrder2 != null),
    s3: rows.some((r) => r.sortOrder3 != null),
  };
}

export function EventRankingsTable({
  rankings,
  divisionTitle,
  highlightTeamNumber,
  /** When set, the matching row gets `id="team-focus-{n}"` for scroll (one table only). */
  domIdForFocusRow,
}: {
  rankings: TeamRankingModel[];
  divisionTitle: string;
  highlightTeamNumber?: number | null;
  domIdForFocusRow?: number | null;
}) {
  const rows = [...rankings]
    .filter((r) => r.teamNumber != null)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  const cols = hasSortCols(rows);

  if (rows.length === 0) {
    return (
      <GlassCard className="p-6 text-sm text-white/45">
        No qualification rankings in API response for {divisionTitle}.
      </GlassCard>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-white/[0.08] bg-[#070512]/80 shadow-[0_0_40px_-20px_rgba(139,92,246,0.35)] [-webkit-overflow-scrolling:touch]">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-violet-950/40 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
            <th className="px-4 py-3.5 pr-2">#</th>
            <th className="px-2 py-3.5">Team</th>
            <th className="min-w-[8rem] px-2 py-3.5">Name</th>
            <th className="px-2 py-3.5">W-L-T</th>
            {cols.s1 ? (
              <th className="px-2 py-3.5 text-right tabular-nums">TB1</th>
            ) : null}
            {cols.s2 ? (
              <th className="px-2 py-3.5 text-right tabular-nums">TB2</th>
            ) : null}
            {cols.s3 ? (
              <th className="px-2 py-3.5 text-right tabular-nums">TB3</th>
            ) : null}
            <th className="px-2 py-3.5 text-right tabular-nums">Qual avg</th>
            <th className="px-2 py-3.5 text-right tabular-nums">MP</th>
            <th className="px-4 py-3.5 pl-2 text-right tabular-nums">DQ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const num = r.teamNumber!;
            const display = r.displayTeamNumber ?? String(num);
            const wl = [r.wins ?? 0, r.losses ?? 0, r.ties ?? 0].join("-");
            const focused =
              highlightTeamNumber != null && num === highlightTeamNumber;
            const focusDomId =
              focused &&
              domIdForFocusRow != null &&
              num === domIdForFocusRow
                ? `team-focus-${num}`
                : undefined;
            return (
              <tr
                key={`${num}-${r.rank}-${i}`}
                id={focusDomId}
                className={`perf-list-row border-b border-white/[0.04] transition hover:bg-white/[0.03] ${
                  focused
                    ? "bg-violet-500/[0.12] ring-1 ring-inset ring-violet-400/35"
                    : ""
                }`}
              >
                <td className="px-4 py-2.5 pr-2 font-mono text-white/50">
                  {r.rank ?? "—"}
                </td>
                <td className="px-2 py-2.5">
                  <Link
                    href={`/teams/${num}`}
                    className="font-mono font-medium text-violet-200/95 hover:text-violet-100"
                  >
                    {display}
                  </Link>
                </td>
                <td className="max-w-[14rem] truncate px-2 py-2.5 text-white/65">
                  {r.teamName ?? "—"}
                </td>
                <td className="px-2 py-2.5 font-mono tabular-nums text-white/55">
                  {wl}
                </td>
                {cols.s1 ? (
                  <td className="px-2 py-2.5 text-right font-mono tabular-nums text-white/60">
                    {r.sortOrder1?.toFixed(2) ?? "—"}
                  </td>
                ) : null}
                {cols.s2 ? (
                  <td className="px-2 py-2.5 text-right font-mono tabular-nums text-white/60">
                    {r.sortOrder2?.toFixed(2) ?? "—"}
                  </td>
                ) : null}
                {cols.s3 ? (
                  <td className="px-2 py-2.5 text-right font-mono tabular-nums text-white/60">
                    {r.sortOrder3?.toFixed(2) ?? "—"}
                  </td>
                ) : null}
                <td className="px-2 py-2.5 text-right font-mono tabular-nums text-white/80">
                  {r.qualAverage != null ? r.qualAverage.toFixed(2) : "—"}
                </td>
                <td className="px-2 py-2.5 text-right font-mono tabular-nums text-white/55">
                  {r.matchesPlayed ?? "—"}
                </td>
                <td className="px-4 py-2.5 pl-2 text-right font-mono tabular-nums text-white/45">
                  {r.dq ?? 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-white/[0.06] px-4 py-2 text-[11px] text-white/35">
        TB1–TB3 = tiebreak sort columns from FIRST (varies by season/game).
      </p>
    </div>
  );
}

export function EventAwardsGrid({ awards }: { awards: AwardAssignmentModelV2[] }) {
  if (awards.length === 0) {
    return (
      <GlassCard className="p-6 text-sm text-white/45">
        No awards in API response yet, or they are not published for this code.
      </GlassCard>
    );
  }

  const sorted = [...awards].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "", undefined, {
      sensitivity: "base",
    })
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((a, i) => {
        const team = a.teamNumber;
        const title = a.name ?? "Award";
        return (
          <GlassCard
            key={`${a.awardId}-${team ?? "p"}-${a.person ?? i}-${i}`}
            glow={i % 3 === 0 ? "violet" : undefined}
            className="relative overflow-hidden p-5"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/15 blur-2xl" />
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-amber-200/70">
              Award
            </p>
            <h3 className="mt-2 text-base font-semibold leading-snug text-white/90">
              {title}
            </h3>
            {team != null ? (
              <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  Team
                </p>
                <Link
                  href={`/teams/${team}`}
                  className="mt-1 inline-flex font-mono text-lg font-semibold text-violet-200 hover:text-violet-100"
                >
                  {team}
                </Link>
                {a.fullTeamName ? (
                  <p className="mt-1 text-sm text-white/55">{a.fullTeamName}</p>
                ) : null}
                {a.schoolName ? (
                  <p className="mt-1 text-xs text-white/40">{a.schoolName}</p>
                ) : null}
              </div>
            ) : null}
            {a.person?.trim() ? (
              <p className="mt-3 text-sm text-white/60">
                <span className="text-white/40">Recipient: </span>
                {a.person}
              </p>
            ) : null}
            {a.series != null && a.series !== 0 ? (
              <p className="mt-2 text-[11px] text-white/35">Series {a.series}</p>
            ) : null}
          </GlassCard>
        );
      })}
    </div>
  );
}
