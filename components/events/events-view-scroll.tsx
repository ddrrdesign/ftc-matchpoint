"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ANCHOR = "events-results";

/**
 * When `view` is set (past / premier / worlds), scrolls the list block into view
 * so mobile users see the table immediately after tapping a category.
 */
export function EventsViewScroll() {
  const sp = useSearchParams();
  const view = sp.get("view");
  const q = sp.get("q") ?? "";
  const season = sp.get("season") ?? "";

  useEffect(() => {
    if (!view || !["past", "premier", "worlds"].includes(view)) return;
    const t = window.setTimeout(() => {
      document
        .getElementById(ANCHOR)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [view, q, season]);

  return null;
}
