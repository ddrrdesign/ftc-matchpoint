import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

export type EventsHubPreviewRow = {
  rowKey: string;
  primaryHref: string;
  primaryExternal: boolean;
  code: string;
  name: string;
  dates: string;
};

function viewHref(view: "past" | "premier" | "worlds", q: string): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  p.set("view", view);
  return `/events?${p.toString()}`;
}

function allHref(q: string): string {
  if (!q) return "/events";
  return `/events?q=${encodeURIComponent(q)}`;
}

function PreviewLines({ rows }: { rows: EventsHubPreviewRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-white/35">Nothing in this bucket yet.</p>
    );
  }
  return (
    <ul className="space-y-2.5 text-sm">
      {rows.map((r) => (
        <li key={r.rowKey} className="min-w-0">
          {r.primaryExternal ? (
            <a
              href={r.primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border border-transparent px-1 py-2 transition active:bg-white/[0.06] sm:py-0.5 sm:hover:border-white/10 sm:hover:bg-white/[0.04]"
            >
              <span className="font-mono text-xs text-violet-300/85">
                {r.code || "—"}
              </span>
              <span className="mt-0.5 block line-clamp-2 text-sm leading-snug text-white/75 sm:text-xs sm:group-hover:text-white/90">
                {r.name}
              </span>
              <span className="mt-0.5 block text-xs text-white/40">{r.dates}</span>
            </a>
          ) : (
            <Link
              href={r.primaryHref}
              className="group block rounded-lg border border-transparent px-1 py-2 transition active:bg-white/[0.06] sm:py-0.5 sm:hover:border-white/10 sm:hover:bg-white/[0.04]"
            >
              <span className="font-mono text-xs text-violet-300/85">
                {r.code || "—"}
              </span>
              <span className="mt-0.5 block line-clamp-2 text-sm leading-snug text-white/75 sm:text-xs sm:group-hover:text-white/90">
                {r.name}
              </span>
              <span className="mt-0.5 block text-xs text-white/40">{r.dates}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

type ColumnProps = {
  title: string;
  subtitle: string;
  view: "past" | "premier" | "worlds";
  q: string;
  total: number;
  previewRows: EventsHubPreviewRow[];
  active: boolean;
};

function HubColumn({ title, subtitle, view, q, total, previewRows, active }: ColumnProps) {
  return (
    <GlassCard
      className={`flex h-full flex-col border-white/[0.08] p-4 transition sm:p-5 ${
        active
          ? "border-violet-400/35 bg-violet-500/[0.08] shadow-[0_0_0_1px_rgba(139,92,246,0.2)_inset]"
          : "hover:border-white/12"
      }`}
    >
      <Link
        prefetch
        href={viewHref(view, q)}
        className="touch-manipulation block select-none rounded-xl py-1 outline-none ring-violet-500/40 transition-transform duration-100 focus-visible:ring-2 active:scale-[0.99] active:bg-white/[0.04] sm:py-0 sm:active:scale-100 sm:active:bg-transparent"
      >
        <h2 className="text-base font-semibold tracking-tight text-white/95 sm:text-lg">
          {title}
        </h2>
        <p className="mt-1.5 line-clamp-4 text-[11px] leading-snug text-white/45 sm:line-clamp-none sm:text-xs sm:leading-relaxed">
          {subtitle}
        </p>
        <p className="mt-3 text-xl font-semibold tabular-nums text-white/90 sm:mt-4 sm:text-2xl">
          {total}
          <span className="ml-2 text-xs font-normal text-white/40 sm:text-sm">
            {total === 1 ? "event" : "events"}
          </span>
        </p>
        <span className="mt-3 inline-flex min-h-[44px] items-center text-sm font-medium text-violet-300/90 underline decoration-violet-400/35 underline-offset-2 sm:min-h-0 sm:text-xs">
          Open full list →
        </span>
      </Link>
      <div className="mt-4 min-h-[88px] flex-1 border-t border-white/[0.06] pt-3 sm:mt-5 sm:min-h-[120px] sm:pt-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/35 sm:mb-3">
          Preview
        </p>
        <div className="max-h-[200px] overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch] sm:max-h-[280px]">
          <PreviewLines rows={previewRows} />
        </div>
      </div>
    </GlassCard>
  );
}

type Props = {
  q: string;
  activeView: "past" | "premier" | "worlds" | null;
  past: { preview: EventsHubPreviewRow[]; total: number };
  premier: { preview: EventsHubPreviewRow[]; total: number };
  worlds: { preview: EventsHubPreviewRow[]; total: number };
};

const PREVIEW_N = 8;

export function sliceHubPreview(
  rows: EventsHubPreviewRow[]
): EventsHubPreviewRow[] {
  return rows.slice(0, PREVIEW_N);
}

export function eventsToHubPreviewRows<
  T extends {
    rowKey: string;
    primaryHref: string;
    primaryExternal: boolean;
    code: string;
    name: string;
    dates: string;
  },
>(rows: T[]): EventsHubPreviewRow[] {
  return rows.map((r) => ({
    rowKey: r.rowKey,
    primaryHref: r.primaryHref,
    primaryExternal: r.primaryExternal,
    code: r.code,
    name: r.name,
    dates: r.dates,
  }));
}

export function EventsCategoryHub({
  q,
  activeView,
  past,
  premier,
  worlds,
}: Props) {
  return (
    <section className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            Browse
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/50">
            Tap a category for the full list, or open an event from the preview.
          </p>
        </div>
        {activeView ? (
          <Link
            prefetch
            href={allHref(q)}
            className="touch-manipulation inline-flex h-12 w-full shrink-0 select-none items-center justify-center rounded-xl border border-white/14 bg-white/[0.06] px-4 text-sm font-semibold text-white/88 transition-transform duration-100 hover:bg-white/[0.1] active:scale-[0.98] active:bg-white/[0.14] sm:h-auto sm:w-auto sm:justify-start sm:active:scale-100"
          >
            ← All columns
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
        <HubColumn
          title="Past events"
          subtitle="Completed competitions — qualifiers, meets, and championships that already finished."
          view="past"
          q={q}
          total={past.total}
          previewRows={past.preview}
          active={activeView === "past"}
        />
        <HubColumn
          title="Upcoming premier"
          subtitle="Coming up or ongoing now: premier and championship-tier events (not World Championship)."
          view="premier"
          q={q}
          total={premier.total}
          previewRows={premier.preview}
          active={activeView === "premier"}
        />
        <HubColumn
          title="FIRST World Championship"
          subtitle="Global championship events (e.g. FTCCMP, FIRST Championship)."
          view="worlds"
          q={q}
          total={worlds.total}
          previewRows={worlds.preview}
          active={activeView === "worlds"}
        />
      </div>
    </section>
  );
}
