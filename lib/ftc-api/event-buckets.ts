import type { Event } from "@/lib/types";
import type { ScoutEventListItem } from "@/lib/ftc-scout/types";
import type { SeasonEventModelV2 } from "./types";
import { isWorldsFromCodeAndName, isWorldsLevelEvent } from "./event-presentation";

function blobApi(e: SeasonEventModelV2): string {
  return `${e.type ?? ""} ${e.typeName ?? ""} ${e.name ?? ""}`.toLowerCase();
}

/**
 * High-profile FTC events (premier / championship tier), excluding World Championship.
 */
export function isPremierTierApiEvent(e: SeasonEventModelV2): boolean {
  if (isWorldsLevelEvent(e)) return false;
  const b = blobApi(e);
  if (/\bpremier\b/.test(b)) return true;
  if (/\bsuper[\s_-]?qual/.test(b)) return true;
  if (/\bchampionship\b/.test(b)) return true;
  return false;
}

export function isWorldsLevelScoutEvent(e: ScoutEventListItem): boolean {
  return isWorldsFromCodeAndName(e.code, e.name);
}

export function isPremierTierScoutEvent(e: ScoutEventListItem): boolean {
  if (isWorldsLevelScoutEvent(e)) return false;
  const b = `${e.type ?? ""} ${e.name ?? ""}`.toLowerCase();
  if (/\bpremier\b/.test(b)) return true;
  if (/\bsuper[\s_-]?qual/.test(b)) return true;
  if (/\bchampionship\b/.test(b)) return true;
  return false;
}

export function isWorldsMockEvent(e: Event): boolean {
  return isWorldsFromCodeAndName(e.code, e.name);
}

export function isPremierTierMockEvent(e: Event): boolean {
  if (isWorldsMockEvent(e)) return false;
  const b = `${e.name} ${e.code}`.toLowerCase();
  if (/\bpremier\b/.test(b)) return true;
  if (/\bsuper[\s_-]?qual/.test(b)) return true;
  if (/\bchampionship\b/.test(b)) return true;
  return false;
}
