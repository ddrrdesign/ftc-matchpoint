import Link from "next/link";
import { formatFtcSeasonRangeLabel } from "@/lib/ftc-api/season-label";
import { uiEventStatusLabel } from "@/lib/ftc-api/event-status";
import type { EventStatus } from "@/lib/types";

function statusPillClass(s: EventStatus): string {
  switch (s) {
    case "live":
      return "border-emerald-400/30 bg-emerald-500/12 text-emerald-200";
    case "upcoming":
      return "border-blue-400/25 bg-blue-500/12 text-blue-200";
    case "completed":
      return "border-white/15 bg-white/[0.06] text-white/65";
  }
}

export type EventBrowseListRow = {
  rowKey: string;
  /** FTC season year as in API / Scout (e.g. 2025 for 2025–26). */
  seasonYear: number;
  code: string;
  name: string;
  dates: string;
  location: string;
  venueExtra: string | null;
  typeLine: string | null;
  teams: string;
  status: EventStatus;
  /** In-app event page (card tap + Analytics). */
  detailHref: string;
  /** Scout or external primary action URL when `primaryExternal`. */
  primaryHref: string;
  primaryLabel: string;
  primaryExternal: boolean;
  firstWebUrl: string | null;
  divisionsNote: string | null;
};

function MobileEventCard({ r }: { r: EventBrowseListRow }) {
  return (
    <li className="min-w-0 border-b border-white/[0.06] last:border-b-0">
      <Link
        prefetch
        href={r.detailHref}
        className="block min-w-0 px-3 py-3 transition active:bg-white/[0.04] sm:px-5 sm:py-4"
      >
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 gap-y-1">
          <div className="min-w-0 flex-1">
            <p className="break-words text-[15px] font-semibold leading-snug text-white/95 sm:text-base">
              {r.name}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-white/38 sm:text-[11px]">
              {r.code || "—"} · {formatFtcSeasonRangeLabel(r.seasonYear)}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:py-1 sm:text-[11px] ${statusPillClass(r.status)}`}
          >
            {uiEventStatusLabel(r.status)}
          </span>
        </div>
        {r.typeLine ? (
          <p className="mt-1 text-[11px] text-white/38">{r.typeLine}</p>
        ) : null}
        {r.divisionsNote ? (
          <p className="mt-1 text-[10px] text-amber-200/50">{r.divisionsNote}</p>
        ) : null}
        <p className="mt-1.5 text-xs text-white/55 sm:text-sm">{r.dates}</p>
        <p className="mt-0.5 text-xs leading-snug text-white/45 sm:text-sm">
          {r.location}
        </p>
        {r.venueExtra && r.venueExtra !== r.location ? (
          <p className="mt-0.5 text-[10px] text-white/32">{r.venueExtra}</p>
        ) : null}
        <p className="mt-1.5 text-[10px] text-white/40 sm:text-xs">
          Teams{" "}
          <span className="font-medium tabular-nums text-white/65">{r.teams}</span>
        </p>
      </Link>
      <div className="flex min-w-0 flex-wrap gap-2 px-3 pb-3 sm:gap-2 sm:px-5 sm:pb-4">
        {r.primaryExternal ? (
          <a
            href={r.primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-manipulation inline-flex min-h-[40px] flex-1 select-none items-center justify-center rounded-lg border border-sky-400/35 bg-sky-500/14 px-3 py-2 text-center text-xs font-semibold text-sky-100/95 transition-transform duration-100 active:scale-[0.98] active:bg-sky-500/28 sm:min-h-[44px] sm:flex-none sm:rounded-xl sm:px-4 sm:text-sm"
          >
            {r.primaryLabel}
          </a>
        ) : (
          <Link
            prefetch
            href={r.detailHref}
            className="touch-manipulation inline-flex min-h-[40px] flex-1 select-none items-center justify-center rounded-lg border border-white/14 bg-white/[0.07] px-3 py-2 text-center text-xs font-semibold text-white/90 transition-transform duration-100 active:scale-[0.98] active:bg-white/[0.12] sm:min-h-[44px] sm:flex-none sm:rounded-xl sm:px-4 sm:text-sm"
          >
            {r.primaryLabel}
          </Link>
        )}
        {r.firstWebUrl ? (
          <a
            href={r.firstWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="FTC Event Web — all events"
            className="touch-manipulation inline-flex min-h-[40px] flex-1 select-none items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/12 px-3 py-2 text-center text-xs font-semibold text-violet-200/95 transition-transform duration-100 active:scale-[0.98] active:bg-violet-500/26 sm:min-h-[44px] sm:flex-none sm:rounded-xl sm:px-4 sm:text-sm"
          >
            FIRST
          </a>
        ) : null}
      </div>
    </li>
  );
}

export function EventBrowseList({ rows }: { rows: EventBrowseListRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="mt-3 w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#06040f]/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] sm:mt-4 md:mt-10 md:rounded-2xl">
      <ul className="w-full min-w-0 max-w-full md:hidden">
        {rows.map((r) => (
          <MobileEventCard key={r.rowKey} r={r} />
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[11px] font-medium uppercase tracking-wider text-white/40">
              <th className="min-w-[220px] px-4 py-3 pl-5">Event</th>
              <th className="whitespace-nowrap px-3 py-3 text-center tabular-nums">
                Season
              </th>
              <th className="whitespace-nowrap px-4 py-3">Dates</th>
              <th className="min-w-[140px] px-4 py-3">Where</th>
              <th className="whitespace-nowrap px-4 py-3 text-center tabular-nums">
                Teams
              </th>
              <th className="whitespace-nowrap px-4 py-3">Status</th>
              <th className="whitespace-nowrap px-4 py-3 pr-5 text-right">
                Links
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => (
              <tr
                key={r.rowKey}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3.5 pl-5 align-top">
                  <Link
                    prefetch
                    href={r.detailHref}
                    className="group block rounded-lg outline-none ring-violet-500/40 focus-visible:ring-2"
                  >
                    <p className="font-semibold leading-snug text-white/92 group-hover:text-white">
                      {r.name}
                    </p>
                    <p className="mt-1 font-mono text-xs text-violet-300/75">
                      {r.code || "—"}
                    </p>
                    {r.typeLine ? (
                      <p className="mt-1 text-xs text-white/38">{r.typeLine}</p>
                    ) : null}
                    {r.divisionsNote ? (
                      <p className="mt-1 text-[11px] text-amber-200/50">
                        {r.divisionsNote}
                      </p>
                    ) : null}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-center align-top text-xs tabular-nums text-white/55">
                  {formatFtcSeasonRangeLabel(r.seasonYear)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 align-top text-white/70">
                  {r.dates}
                </td>
                <td className="px-4 py-3.5 align-top text-white/55">
                  <span className="leading-snug">{r.location}</span>
                  {r.venueExtra && r.venueExtra !== r.location ? (
                    <span className="mt-1 block text-xs text-white/35">
                      {r.venueExtra}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 text-center align-top font-medium tabular-nums text-white/75">
                  {r.teams}
                </td>
                <td className="px-4 py-3.5 align-top">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusPillClass(r.status)}`}
                  >
                    {uiEventStatusLabel(r.status)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 pr-5 text-right align-top">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {r.primaryExternal ? (
                      <a
                        href={r.primaryHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-manipulation inline-flex min-h-[36px] select-none items-center rounded-lg border border-sky-400/30 bg-sky-500/12 px-3 py-1.5 text-xs font-semibold text-sky-100/95 transition-transform duration-100 hover:bg-sky-500/20 active:scale-[0.97] active:bg-sky-500/28"
                      >
                        {r.primaryLabel}
                      </a>
                    ) : (
                      <Link
                        prefetch
                        href={r.detailHref}
                        className="touch-manipulation inline-flex min-h-[36px] select-none items-center rounded-lg border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/90 transition-transform duration-100 hover:bg-white/[0.1] active:scale-[0.97] active:bg-white/[0.14]"
                      >
                        {r.primaryLabel}
                      </Link>
                    )}
                    {r.firstWebUrl ? (
                      <a
                        href={r.firstWebUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="FTC Event Web — all events"
                        className="touch-manipulation inline-flex min-h-[36px] select-none items-center rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200/90 transition-transform duration-100 hover:bg-violet-500/18 active:scale-[0.97] active:bg-violet-500/26"
                      >
                        FIRST
                      </a>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
