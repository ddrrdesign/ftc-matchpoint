import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { OverallPredictorPanel } from "@/components/predictions/overall-predictor-panel";

export const revalidate = 120;

type Search = {
  r?: string;
  b?: string;
  r1?: string;
  r2?: string;
  b1?: string;
  b2?: string;
};

export default async function PredictorPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return (
    <PageShell>
      <SiteHeader />
      <main className="min-w-0 flex-1">
        <OverallPredictorPanel searchParams={searchParams} routeBase="/predictor" />
      </main>
    </PageShell>
  );
}
