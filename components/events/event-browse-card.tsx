import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { uiEventStatusLabel } from "@/lib/ftc-api/event-status";
import type { EventStatus } from "@/lib/types";

function statusStyles(s: EventStatus): string {
  switch (s) {
    case "live":
      return "border-emerald-400/30 bg-emerald-500/12 text-emerald-200";
    case "upcoming":
      return "border-blue-400/25 bg-blue-500/12 text-blue-200";
    case "completed":
      return "border-white/15 bg-white/[0.06] text-white/65";
  }
}

export type EventBrowseCardProps = {
  code: string;
  name: string;
  locationLine: string;
  venueLine: string | null;
  typeLine: string;
  dateRange: string | null;
  teamCount: number | null;
  divisionsNote: string | null;
  status: EventStatus;
  href: string;
};

export function EventBrowseCard({
  code,
  name,
  locationLine,
  venueLine,
  typeLine,
  dateRange,
  teamCount,
  divisionsNote,
  status,
  href,
}: EventBrowseCardProps) {
  return (
    <GlassCard glow="violet" className="flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-violet-300/70">{code || "—"}</p>
          <h2 className="mt-1 text-lg font-semibold leading-snug">{name}</h2>
          <p className="mt-1 text-sm text-white/45">{locationLine}</p>
          {venueLine && venueLine !== locationLine ? (
            <p className="mt-1 text-xs text-white/35">{venueLine}</p>
          ) : null}
          <p className="mt-2 text-xs leading-relaxed text-violet-200/55">
            {typeLine}
          </p>
          {divisionsNote ? (
            <p className="mt-1.5 text-[11px] text-amber-200/55">{divisionsNote}</p>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles(status)}`}
        >
          {uiEventStatusLabel(status)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-white/[0.06] bg-[#080612]/90 px-3 py-2.5">
          <p className="text-[11px] uppercase tracking-wider text-white/40">
            Dates
          </p>
          <p className="mt-0.5 font-medium leading-snug text-white/85">
            {dateRange ?? "TBA"}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#080612]/90 px-3 py-2.5">
          <p className="text-[11px] uppercase tracking-wider text-white/40">
            Teams
          </p>
          <p className="mt-0.5 font-semibold tabular-nums text-white/85">
            {teamCount != null ? teamCount : "—"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={href}
          className="inline-flex w-full items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.1]"
        >
          Open event
        </Link>
      </div>
    </GlassCard>
  );
}
