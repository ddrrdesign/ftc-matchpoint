import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";

export default function EventDetailLoading() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto min-w-0 w-full max-w-7xl px-3 py-8 sm:px-6 md:py-14">
        <div className="h-4 w-28 animate-pulse rounded bg-white/12" />
        <div className="mt-6 h-40 animate-pulse rounded-3xl border border-white/[0.08] bg-white/[0.04] sm:h-48" />
        <div className="mt-10 flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 w-20 animate-pulse rounded-lg bg-white/10"
            />
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
            />
          ))}
        </div>
        <div className="mt-14 h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]" />
      </main>
    </PageShell>
  );
}
