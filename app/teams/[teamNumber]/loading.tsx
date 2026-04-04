import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";

export default function TeamDetailLoading() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="h-4 w-24 animate-pulse rounded bg-white/12" />
        <div className="mt-8 h-12 w-40 animate-pulse rounded-lg bg-white/15" />
        <div className="mt-3 h-8 w-64 max-w-full animate-pulse rounded-lg bg-white/10" />
        <div className="mt-10 h-48 max-w-md animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]" />
        <div className="mt-14 space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-white/12" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
            />
          ))}
        </div>
      </main>
    </PageShell>
  );
}
