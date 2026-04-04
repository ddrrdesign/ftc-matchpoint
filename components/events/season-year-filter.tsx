import Link from "next/link";

function seasonFilterHref(
  view: "past" | "worlds",
  year: number | null,
  q: string
): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  p.set("view", view);
  if (year != null) p.set("season", String(year));
  return `/events?${p.toString()}`;
}

const chipBase =
  "touch-manipulation inline-flex shrink-0 items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium tabular-nums transition sm:py-1.5 sm:text-xs";

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
        FTC API / Scout season
      </p>
      <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible">
        <Link
          href={seasonFilterHref(view, null, q)}
          className={`${chipBase} ${
            allActive
              ? "border-violet-400/45 bg-violet-500/20 text-violet-100"
              : "border-white/12 bg-white/[0.04] text-white/65 hover:border-white/18 hover:bg-white/[0.07]"
          }`}
        >
          All seasons
        </Link>
        {yearsDescending.map((y) => {
          const on = selectedYear === y;
          return (
            <Link
              key={y}
              href={seasonFilterHref(view, y, q)}
              className={`${chipBase} ${
                on
                  ? "border-violet-400/45 bg-violet-500/20 text-violet-100"
                  : "border-white/12 bg-white/[0.04] text-white/65 hover:border-white/18 hover:bg-white/[0.07]"
              }`}
            >
              {y}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
