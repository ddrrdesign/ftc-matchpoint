"use client";

import { useEffect } from "react";

/**
 * After client navigation to `/events/...#event-overview`, scroll the target into view.
 */
export function EventDetailHashScroll() {
  useEffect(() => {
    const hash = window.location.hash?.replace(/^#/, "");
    if (!hash) return;
    const t = window.setTimeout(() => {
      document
        .getElementById(hash)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
