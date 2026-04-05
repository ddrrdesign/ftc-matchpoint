"use client";

import type { FormEvent, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * GET forms drop the URL fragment; we navigate with `#event-analysis` so the
 * Event analysis section stays in view after search.
 */
export function PredictionsEventSearchForm({ children, className }: Props) {
  return (
    <form
      className={className}
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const qs = new URLSearchParams(fd as never).toString();
        const path = qs ? `/predictions?${qs}` : "/predictions";
        window.location.assign(`${path}#event-analysis`);
      }}
    >
      {children}
    </form>
  );
}
