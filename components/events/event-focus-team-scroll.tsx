"use client";

import { useEffect } from "react";

/**
 * When opening an event from a team page with `focusTeam`, scroll to the
 * highlighted team card / table row.
 */
export function EventFocusTeamScroll({ teamNumber }: { teamNumber: number }) {
  useEffect(() => {
    const id = `team-focus-${teamNumber}`;
    const t = window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => window.clearTimeout(t);
  }, [teamNumber]);

  return null;
}
