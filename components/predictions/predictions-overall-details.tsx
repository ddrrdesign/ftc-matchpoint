"use client";

import { useEffect, useState, type ReactNode } from "react";

type PredictionsOverallDetailsProps = {
  children: ReactNode;
  defaultOpen: boolean;
  /** When true, opening this section scrolls to `#overall-analysis`. */
  scrollToAnalysisOnOpen: boolean;
  /** Bumps when alliance query changes so `defaultOpen` re-syncs after navigation. */
  queryKey: string;
};

export function PredictionsOverallDetails({
  children,
  defaultOpen,
  scrollToAnalysisOnOpen,
  queryKey,
}: PredictionsOverallDetailsProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [queryKey, defaultOpen]);

  return (
    <details
      id="overall"
      open={open}
      onToggle={(e) => {
        const el = e.currentTarget;
        setOpen(el.open);
        if (el.open && scrollToAnalysisOnOpen) {
          requestAnimationFrame(() => {
            document.getElementById("overall-analysis")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
        }
      }}
      className="group scroll-mt-24 rounded-2xl border border-white/[0.1] bg-white/[0.03] open:border-violet-400/30 open:bg-white/[0.045]"
    >
      {children}
    </details>
  );
}
