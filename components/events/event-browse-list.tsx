import Link from "next/link";
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
  /** FTC / Event Web / Scout season label in URLs (Scout uses 2025 for Decode). */
  seasonYear: number;
  code: string;
  name: string;
  dates: string;
  location: string;
  venueExtra: string | null;
  typeLine: string | null;
  teams: string;
  status: EventStatus;
  /** In-app route or external URL (see primaryExternal). */
  primaryHref: string;
  primaryLabel: string;
  primaryExternal: boolean;
  firstWebUrl: string | null;
  divisionsNote: string | null;
};

export function EventBrowseList({ rows }: { rows: EventBrowseListRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#06040f]/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[11px] font-medium uppercase tracking-wider text-white/40">
              <th className="whitespace-nowrap px-3 py-3 pl-5 text-center tabular-nums">
                Year
              </th>
              <th className="whitespace-nowrap px-4 py-3">Code</th>
              <th className="min-w-[200px] px-4 py-3">Event</th>
              <th className="whitespace-nowrap px-4 py-3">Dates</th>
              <th className="min-w-[160px] px-4 py-3">Where</th>
              <th className="whitespace-nowrap px-4 py-3 text-center tabular-nums">
                Teams
              </th>
              <th className="whitespace-nowrap px-4 py-3">Status</th>
              <th className="whitespace-nowrap px-4 py-3 pr-5 text-right">
                Open
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => (
              <tr
                key={r.rowKey}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="whitespace-nowrap px-3 py-3.5 pl-5 align-top text-center text-xs tabular-nums text-white/50">
                  {r.seasonYear}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 align-top font-mono text-xs text-violet-300/80">
                  {r.code || "—"}
                </td>
                <td className="px-4 py-3.5 align-top">
                  <p className="font-medium leading-snug text-white/90">
                    {r.name}
                  </p>
                  {r.typeLine ? (
                    <p className="mt-1 text-xs text-white/38">{r.typeLine}</p>
                  ) : null}
                  {r.divisionsNote ? (
                    <p className="mt-1 text-[11px] text-amber-200/50">
                      {r.divisionsNote}
                    </p>
                  ) : null}
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
                        className="rounded-lg border border-sky-400/30 bg-sky-500/12 px-3 py-1.5 text-xs font-medium text-sky-100/95 transition hover:bg-sky-500/20"
                      >
                        {r.primaryLabel}
                      </a>
                    ) : (
                      <Link
                        href={r.primaryHref}
                        className="rounded-lg border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/[0.1]"
                      >
                        {r.primaryLabel}
                      </Link>
                    )}
                    {r.firstWebUrl ? (
                      <a
                        href={r.firstWebUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Official FTC Event Web page: ${r.firstWebUrl}`}
                        className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200/90 transition hover:bg-violet-500/18"
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
