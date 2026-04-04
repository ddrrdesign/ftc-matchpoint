import { NextResponse } from "next/server";
import {
  getFtcCredentialEnvPresence,
  getFtcSeasonYear,
  isFtcApiConfigured,
} from "@/lib/ftc-api/env";
import { fetchEventListings } from "@/lib/ftc-api/service";

/**
 * Operator check: whether this deployment sees FTC credentials and can list events.
 * Does not expose secrets. `Cache-Control: no-store`.
 */
export async function GET() {
  const { usernameSet, keySet } = getFtcCredentialEnvPresence();
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
    if (usernameSet && !keySet) {
      message =
        "FTC_API_USERNAME is set but FTC_API_KEY is missing — add FTC_API_KEY in Vercel and Redeploy.";
    } else if (!usernameSet && keySet) {
      message =
        "FTC_API_KEY is set but FTC_API_USERNAME is missing — add FTC_API_USERNAME in Vercel and Redeploy.";
    } else {
      message =
        "Neither FTC_API_USERNAME nor FTC_API_KEY is visible: in Vercel use those exact names in Name (not your login), values in Value, Production environment, then Redeploy.";
    }
  } else if (listingsOk) {
    message = "Credentials OK; FIRST API returned event listings.";
  } else {
    message =
      "Credentials set but the API request failed — check values, FTC_SEASON_YEAR, and FIRST rate limits.";
  }

  return NextResponse.json(
    {
      credentialsPresent,
      usernameEnvSet: usernameSet,
      keyEnvSet: keySet,
      listingsOk,
      message,
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
