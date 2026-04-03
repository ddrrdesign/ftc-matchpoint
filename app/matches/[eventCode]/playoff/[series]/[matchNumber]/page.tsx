import { notFound } from "next/navigation";
import { MatchDetail, statsMapFromRankings } from "@/components/matches/match-detail";
import { getFtcSeasonYear } from "@/lib/ftc-api/env";
import {
  fetchOneMatch,
  fetchRankings,
  fetchSingleEvent,
} from "@/lib/ftc-api/service";

type Props = {
  params: Promise<{
    eventCode: string;
    series: string;
    matchNumber: string;
  }>;
};

export default async function PlayoffMatchPage({ params }: Props) {
  const { eventCode: raw, series: sRaw, matchNumber: numRaw } = await params;
  const eventCode = decodeURIComponent(raw);
  const series = Number.parseInt(sRaw, 10);
  const matchNumber = Number.parseInt(numRaw, 10);
  if (Number.isNaN(series) || Number.isNaN(matchNumber)) notFound();

  const season = getFtcSeasonYear();
  const match = await fetchOneMatch(
    season,
    eventCode,
    "playoff",
    matchNumber,
    series
  );
  if (!match) notFound();

  const [rankingsRes, listings] = await Promise.all([
    fetchRankings(season, eventCode),
    fetchSingleEvent(season, eventCode),
  ]);
  const rankings = rankingsRes?.ok ? rankingsRes.data.rankings ?? [] : [];
  const statsMap = statsMapFromRankings(rankings);
  const eventName =
    listings?.ok && listings.data.events?.[0]
      ? listings.data.events[0].name ?? undefined
      : undefined;

  return (
    <MatchDetail
      eventCode={eventCode}
      eventName={eventName}
      match={match}
      statsByTeamNumber={statsMap}
    />
  );
}
