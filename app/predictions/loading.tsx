import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";

export default function PredictionsLoading() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto min-w-0 w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-12 md:py-16">
        <div className="max-w-3xl space-y-3">
          <div className="h-3 w-28 animate-pulse rounded bg-white/15" />
          <div className="h-10 w-4/5 max-w-lg animate-pulse rounded-lg bg-white/12" />
          <div className="h-20 w-full animate-pulse rounded-lg bg-white/8" />
        </div>
        <div className="mt-10 space-y-4">
          <div className="h-32 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.04]" />
          <div className="h-32 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.04]" />
        </div>
      </main>
    </PageShell>
  );
}
