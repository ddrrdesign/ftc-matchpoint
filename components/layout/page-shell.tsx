import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-[#05030a]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(88,28,135,0.35),transparent_50%),radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(30,58,138,0.22),transparent_45%),radial-gradient(ellipse_60%_40%_at_0%_100%,rgba(76,29,149,0.18),transparent_40%),linear-gradient(to_bottom,#0a0614,#05030a_55%,#030208)]"
        aria-hidden
      />
      <div className="relative flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
