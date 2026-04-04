import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";

export default function EventsLoading() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 md:py-16">
        <div className="max-w-3xl space-y-3">
          <div className="h-3 w-20 animate-pulse rounded bg-white/15" />
          <div className="h-10 w-3/4 max-w-md animate-pulse rounded-lg bg-white/12" />
          <div className="h-16 w-full animate-pulse rounded-lg bg-white/8" />
        </div>
        <div className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
          <div className="h-12 flex-1 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-12 w-full animate-pulse rounded-2xl bg-white/10 sm:w-28" />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
            />
          ))}
        </div>
      </main>
    </PageShell>
  );
}
