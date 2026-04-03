import { notFound } from "next/navigation";
import { EventDetailApi } from "@/components/events/event-detail-api";
import { EventDetailMock } from "@/components/events/event-detail-mock";
import { getEventByCode } from "@/lib/mock-data";
import { isFtcApiConfigured, getFtcSeasonYear } from "@/lib/ftc-api/env";
import {
  fetchAllMatchesForEvent,
  fetchRankings,
  fetchSingleEvent,
  fetchTeamsAtEvent,
} from "@/lib/ftc-api/service";

type Props = { params: Promise<{ eventCode: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { eventCode: raw } = await params;
  const eventCode = decodeURIComponent(raw);
  const season = getFtcSeasonYear();

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
        const [rankingsRes, teams, matches] = await Promise.all([
          fetchRankings(season, code),
          fetchTeamsAtEvent(season, code),
          fetchAllMatchesForEvent(season, code),
        ]);
        const rankings = rankingsRes?.ok
          ? rankingsRes.data.rankings ?? []
          : [];

        return (
          <EventDetailApi
            event={ev}
            eventCode={code}
            rankings={rankings}
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
