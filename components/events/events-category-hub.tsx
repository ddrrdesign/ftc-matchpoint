import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

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

type ColumnProps = {
  title: string;
  subtitle: string;
  view: "past" | "premier" | "worlds";
  q: string;
  total: number;
  active: boolean;
};

function HubColumn({ title, subtitle, view, q, total, active }: ColumnProps) {
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
        className="touch-manipulation flex flex-1 flex-col select-none rounded-xl py-1 outline-none ring-violet-500/40 transition-transform duration-100 focus-visible:ring-2 active:scale-[0.99] active:bg-white/[0.04] sm:py-0 sm:active:scale-100 sm:active:bg-transparent"
      >
        <h2 className="text-base font-semibold tracking-tight text-white/95 sm:text-lg">
          {title}
        </h2>
        <p className="mt-1.5 line-clamp-4 text-[11px] leading-snug text-white/45 sm:line-clamp-none sm:text-xs sm:leading-relaxed">
          {subtitle}
        </p>
        <p className="mt-4 text-xl font-semibold tabular-nums text-white/90 sm:mt-5 sm:text-2xl">
          {total}
          <span className="ml-2 text-xs font-normal text-white/40 sm:text-sm">
            {total === 1 ? "event" : "events"}
          </span>
        </p>
        <span className="mt-auto pt-4 inline-flex min-h-[44px] items-center text-sm font-medium text-violet-300/90 underline decoration-violet-400/35 underline-offset-2 sm:min-h-0 sm:pt-5 sm:text-xs">
          Open full list →
        </span>
      </Link>
    </GlassCard>
  );
}

type Props = {
  q: string;
  activeView: "past" | "premier" | "worlds" | null;
  past: { total: number };
  premier: { total: number };
  worlds: { total: number };
};

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
            Tap a category to open the full list.
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
          active={activeView === "past"}
        />
        <HubColumn
          title="Upcoming premier"
          subtitle="Coming up or ongoing now: premier and championship-tier events (not World Championship)."
          view="premier"
          q={q}
          total={premier.total}
          active={activeView === "premier"}
        />
        <HubColumn
          title="FIRST World Championship"
          subtitle="Global championship events (e.g. FTCCMP, FIRST Championship)."
          view="worlds"
          q={q}
          total={worlds.total}
          active={activeView === "worlds"}
        />
      </div>
    </section>
  );
}
