import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";

export default function EventPredictionLoading() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto min-w-0 w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-12 md:py-16">
        <div className="h-4 w-40 animate-pulse rounded bg-white/12" />
        <div className="mt-4 h-8 w-3/4 max-w-xl animate-pulse rounded-lg bg-white/15" />
        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-8 h-56 max-w-2xl animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.04]" />
        <div className="mt-10 h-40 max-w-2xl animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      </main>
    </PageShell>
  );
}
