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
  /** In-app event page (Analytics button only; card body is not a link). */
  detailHref: string;
  /** Scout or external primary action URL when `primaryExternal`. */
  primaryHref: string;
  primaryLabel: string;
  primaryExternal: boolean;
  firstWebUrl: string | null;
  divisionsNote: string | null;
};

const actionBtnBase =
  "touch-manipulation inline-flex min-h-[44px] cursor-pointer select-none items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-semibold shadow-sm transition hover:brightness-110 active:scale-[0.98] sm:min-h-[44px] sm:px-4 sm:text-sm";

function MobileEventCard({ r }: { r: EventBrowseListRow }) {
  return (
    <li className="min-w-0 border-b border-white/[0.06] last:border-b-0">
      <div className="min-w-0 px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 gap-y-1">
          <div className="min-w-0 flex-1">
            <Link
              prefetch
              href={r.detailHref}
              className="block rounded-lg outline-none ring-violet-500/35 focus-visible:ring-2"
              title="Open analytics"
            >
              <p className="break-words text-[15px] font-semibold leading-snug text-white/95 sm:text-base">
                {r.name}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-white/38 sm:text-[11px]">
                {r.code || "—"} · {formatFtcSeasonRangeLabel(r.seasonYear)}
              </p>
            </Link>
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
      </div>
      <div className="flex min-w-0 flex-wrap gap-2 px-3 pb-3 sm:gap-2 sm:px-5 sm:pb-4">
        {r.primaryExternal ? (
          <a
            href={r.primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${actionBtnBase} flex-1 border-sky-400/40 bg-sky-500/18 text-sky-100/95 hover:bg-sky-500/26 sm:flex-none`}
          >
            {r.primaryLabel}
          </a>
        ) : (
          <Link
            prefetch
            href={r.detailHref}
            className={`${actionBtnBase} flex-1 border-white/18 bg-white/[0.09] text-white/92 hover:bg-white/[0.14] sm:flex-none`}
          >
            {r.primaryLabel}
          </Link>
        )}
        {r.firstWebUrl ? (
          <a
            href={r.firstWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="FIRST Event Web — this event"
            className={`${actionBtnBase} flex-1 border-violet-400/40 bg-violet-500/16 text-violet-200/95 hover:bg-violet-500/24 sm:flex-none`}
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
              <tr key={r.rowKey}>
                <td className="px-4 py-3.5 pl-5 align-top">
                  <Link
                    prefetch
                    href={r.detailHref}
                    title="Open analytics"
                    className="block max-w-xl rounded-lg outline-none ring-violet-500/35 transition-colors hover:text-violet-100 focus-visible:ring-2"
                  >
                    <p className="font-semibold leading-snug text-white/92">
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
                        className="touch-manipulation inline-flex min-h-[40px] cursor-pointer select-none items-center rounded-xl border border-sky-400/40 bg-sky-500/16 px-3.5 py-2 text-xs font-semibold text-sky-100/95 shadow-sm transition hover:brightness-110 active:scale-[0.97]"
                      >
                        {r.primaryLabel}
                      </a>
                    ) : (
                      <Link
                        prefetch
                        href={r.detailHref}
                        className="touch-manipulation inline-flex min-h-[40px] cursor-pointer select-none items-center rounded-xl border border-white/18 bg-white/[0.09] px-3.5 py-2 text-xs font-semibold text-white/92 shadow-sm transition hover:brightness-110 active:scale-[0.97]"
                      >
                        {r.primaryLabel}
                      </Link>
                    )}
                    {r.firstWebUrl ? (
                      <a
                        href={r.firstWebUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="FIRST Event Web — this event"
                        className="touch-manipulation inline-flex min-h-[40px] cursor-pointer select-none items-center rounded-xl border border-violet-400/40 bg-violet-500/14 px-3.5 py-2 text-xs font-semibold text-violet-200/95 shadow-sm transition hover:brightness-110 active:scale-[0.97]"
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
