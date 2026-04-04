import { NextResponse } from "next/server";
import { getFtcSeasonYear, isFtcApiConfigured } from "@/lib/ftc-api/env";
import { fetchEventListings } from "@/lib/ftc-api/service";

/**
 * Operator check: whether this deployment sees FTC credentials and can list events.
 * Does not expose secrets. `Cache-Control: no-store`.
 */
export async function GET() {
  const credentialsPresent = isFtcApiConfigured();
  let listingsOk: boolean | null = null;
  if (credentialsPresent) {
    const res = await fetchEventListings(getFtcSeasonYear(), {
      revalidate: 0,
    });
    listingsOk = res != null && res.ok;
  }

  let message: string;
  if (!credentialsPresent) {
    message =
      "Сервер не видит FTC_API_USERNAME / FTC_API_KEY (проверьте Vercel → Env → Production и Redeploy).";
  } else if (listingsOk) {
    message = "Ключи на месте, FIRST API отвечает на список ивентов.";
  } else {
    message =
      "Ключи заданы, но запрос к API неудачен — проверьте значения, год сезона (FTC_SEASON_YEAR) и лимиты FIRST.";
  }

  return NextResponse.json(
    {
      credentialsPresent,
      listingsOk,
      message,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
