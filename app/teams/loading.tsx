import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";

export default function TeamsSearchLoading() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-12 md:py-16">
        <div className="max-w-2xl space-y-3">
          <div className="h-3 w-20 animate-pulse rounded bg-white/15" />
          <div className="h-10 w-48 animate-pulse rounded-lg bg-white/12" />
          <div className="h-16 w-full animate-pulse rounded-lg bg-white/8" />
        </div>
        <div className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
          <div className="h-12 flex-1 animate-pulse rounded-xl bg-white/10" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-white/10 sm:w-32" />
        </div>
      </main>
    </PageShell>
  );
}
