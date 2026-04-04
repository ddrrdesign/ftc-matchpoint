"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ANCHOR = "events-results";

/**
 * Scrolls the results block into view when browsing by category, season chip, or search
 * (with a category open), and when the URL hash points at results.
 */
export function EventsViewScroll() {
  const sp = useSearchParams();
  const view = sp.get("view");
  const q = (sp.get("q") ?? "").trim();
  const season = sp.get("season") ?? "";

  const viewOk = Boolean(
    view && ["past", "premier", "worlds"].includes(view)
  );

  useEffect(() => {
    const scroll = () => {
      const el = document.getElementById(ANCHOR);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const hashTargetsResults =
      typeof window !== "undefined" &&
      window.location.hash === `#${ANCHOR}`;

    if (!viewOk && !hashTargetsResults) return;

    // Search + category: wait a tick so the list has painted after RSC update.
    const delay = viewOk && q.length > 0 ? 160 : viewOk ? 100 : 60;
    const t = window.setTimeout(scroll, delay);
    return () => window.clearTimeout(t);
  }, [viewOk, q, season]);

  return null;
}
