import { notFound } from "next/navigation";
import { connection } from "next/server";
import { EventDetailApi } from "@/components/events/event-detail-api";
import type { EventDivisionSlice } from "@/components/events/event-detail-api";
import { EventDetailMock } from "@/components/events/event-detail-mock";
import { getEventByCode } from "@/lib/mock-data";
import {
  getFtcSeasonYear,
  isFtcApiConfigured,
  parseFtcSeasonQueryParam,
} from "@/lib/ftc-api/env";
import {
  fetchAllMatchesForEvent,
  fetchEventAwards,
  fetchEventDetailContext,
  fetchRankings,
} from "@/lib/ftc-api/service";

type Props = {
  params: Promise<{ eventCode: string }>;
  searchParams: Promise<{
    season?: string | string[];
    focusTeam?: string | string[];
  }>;
};

function parseFocusTeamParam(
  raw: string | string[] | undefined
): number | null {
  const s = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const n = Number.parseInt(String(s).trim(), 10);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

export default async function EventDetailPage({ params, searchParams }: Props) {
  await connection();
  const sp = await searchParams;
  const qSeason = parseFtcSeasonQueryParam(sp.season);
  const focusTeam = parseFocusTeamParam(sp.focusTeam);
  const { eventCode: raw } = await params;
  const eventCode = decodeURIComponent(raw);
  const preferredSeason = qSeason ?? getFtcSeasonYear();

  if (isFtcApiConfigured()) {
    const ctx = await fetchEventDetailContext(eventCode, preferredSeason);
    if (ctx) {
      const { season, list, ev } = ctx;
      const code = ev.code?.trim();
      if (code) {
        const codes = [
          ...new Set(
            list
              .map((e) => e.code?.trim())
              .filter((c): c is string => Boolean(c))
          ),
        ];
        if (codes.length === 0) {
          codes.push(code);
        } else if (!codes.includes(code)) {
          codes.unshift(code);
        }

        const [matches, ...perCode] = await Promise.all([
          fetchAllMatchesForEvent(season, code),
          ...codes.map(async (c) => {
            const [r, a] = await Promise.all([
              fetchRankings(season, c),
              fetchEventAwards(season, c),
            ]);
            const meta =
              list.find((e) => (e.code ?? "").trim() === c) ?? ev;
            return {
              code: c,
              meta,
              rankings: r?.ok ? r.data.rankings ?? [] : [],
              awards: a?.ok ? a.data.awards ?? [] : [],
            } satisfies EventDivisionSlice;
          }),
        ]);

        return (
          <EventDetailApi
            seasonYear={season}
            event={ev}
            eventCode={code}
            divisions={perCode}
            matches={matches}
            focusTeam={focusTeam}
          />
        );
      }
    }
  }

  const mock = getEventByCode(eventCode);
  if (!mock) notFound();
  return <EventDetailMock event={mock} />;
}
