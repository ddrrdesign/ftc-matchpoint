import Link from "next/link";
import { formatFtcSeasonRangeLabel } from "@/lib/ftc-api/season-label";

function seasonFilterHref(
  view: "past" | "worlds",
  year: number | null,
  q: string
): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  p.set("view", view);
  if (year != null) p.set("season", String(year));
  return `/events?${p.toString()}#events-results`;
}

const chipBase =
  "touch-manipulation inline-flex min-h-[48px] shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full border px-4 py-2.5 text-[13px] font-semibold tabular-nums transition-transform duration-100 will-change-transform active:scale-[0.96] sm:min-h-0 sm:px-3.5 sm:py-2 sm:text-xs sm:active:scale-100";

const chipInactive =
  "border-white/14 bg-white/[0.06] text-white/75 hover:border-white/22 hover:bg-white/[0.1] active:bg-white/[0.14]";

const chipActive =
  "border-violet-400/50 bg-violet-500/25 text-violet-50 shadow-[0_0_0_1px_rgba(139,92,246,0.25)_inset] active:bg-violet-500/35";

export function SeasonYearFilter({
  view,
  yearsDescending,
  selectedYear,
  q,
}: {
  view: "past" | "worlds";
  yearsDescending: number[];
  selectedYear: number | null;
  q: string;
}) {
  if (yearsDescending.length === 0) return null;

  const allActive = selectedYear == null;

  return (
    <div className="mt-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
        Game season
      </p>
      <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:gap-2 sm:overflow-visible">
        <Link
          prefetch
          href={seasonFilterHref(view, null, q)}
          className={`${chipBase} ${allActive ? chipActive : chipInactive}`}
        >
          All seasons
        </Link>
        {yearsDescending.map((y) => {
          const on = selectedYear === y;
          return (
            <Link
              prefetch
              key={y}
              href={seasonFilterHref(view, y, q)}
              className={`${chipBase} ${on ? chipActive : chipInactive}`}
            >
              {formatFtcSeasonRangeLabel(y)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
