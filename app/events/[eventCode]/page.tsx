import { notFound } from "next/navigation";
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
  fetchRankings,
  fetchSingleEvent,
  fetchTeamsAtEvent,
} from "@/lib/ftc-api/service";

type Props = {
  params: Promise<{ eventCode: string }>;
  searchParams: Promise<{ season?: string | string[] }>;
};

export default async function EventDetailPage({ params, searchParams }: Props) {
  const qSeason = parseFtcSeasonQueryParam((await searchParams).season);
  const { eventCode: raw } = await params;
  const eventCode = decodeURIComponent(raw);
  const season = qSeason ?? getFtcSeasonYear();

  if (isFtcApiConfigured()) {
    const listings = await fetchSingleEvent(season, eventCode);
    if (listings?.ok) {
      const list = listings.data.events ?? [];
      const ev =
        list.find(
          (e) => (e.code ?? "").toLowerCase() === eventCode.toLowerCase()
        ) ?? list[0];
      const code = ev?.code?.trim();
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

        const [teams, matches, ...perCode] = await Promise.all([
          fetchTeamsAtEvent(season, code),
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
            teams={teams}
            matches={matches}
          />
        );
      }
    }
  }

  const mock = getEventByCode(eventCode);
  if (!mock) notFound();
  return <EventDetailMock event={mock} />;
}
