import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { FIRST_FTC_API_DOCS_URL } from "@/lib/ftc-api/event-presentation";

const FIRST_API_SERVICES =
  "https://ftc-events.firstinspires.org/services/API";
const VERCEL_ENV_DOCS =
  "https://vercel.com/docs/projects/environment-variables";
const SWAGGER_V2 =
  "https://ftc-events.firstinspires.org/swagger/v2.0/swagger.json";

function EnvName({ children }: { children: string }) {
  return (
    <code className="rounded-md border border-white/15 bg-black/30 px-2 py-0.5 font-mono text-[13px] text-violet-100/95">
      {children}
    </code>
  );
}

/**
 * Full on-page instructions so operators can configure FIRST API without leaving
 * the site for the main checklist (external links only for FIRST / Vercel docs).
 */
export function FirstApiSetupGuide() {
  return (
    <section
      id="first-api-setup"
      className="scroll-mt-24"
      aria-labelledby="first-api-setup-title"
    >
      <GlassCard className="max-w-3xl border-amber-400/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-5 sm:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200/70">
          Server setup
        </p>
        <h2
          id="first-api-setup-title"
          className="mt-2 text-xl font-semibold text-amber-50 sm:text-2xl"
        >
          How to connect the FIRST Events API to this site
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-amber-100/88">
          <strong className="font-medium text-amber-50">Event analysis</strong> mode and
          the event catalog on the{" "}
          <Link href="/events" className="text-amber-200 underline hover:text-amber-100">
            Events
          </Link>{" "}
          page load data only from your server (Vercel / Node). Credentials are not
          entered in the browser — set them in environment variables.
        </p>

        <ol className="mt-6 space-y-5 text-sm leading-relaxed text-amber-50/95">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-xs font-bold text-amber-100">
              1
            </span>
            <div className="min-w-0">
              <p className="font-medium text-amber-50">Get API username and key</p>
              <p className="mt-1.5 text-amber-100/80">
                Register access in the FIRST ecosystem for the FTC Events API (a{" "}
                <strong className="font-normal text-amber-100">username + key</strong>{" "}
                pair). Official entry point and usage rules:
              </p>
              <ul className="mt-2 space-y-1.5 text-amber-100/75">
                <li>
                  <a
                    href={FIRST_API_SERVICES}
                    className="text-amber-200 underline hover:text-amber-50"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FTC Event Web — API / Services
                  </a>{" "}
                  <span className="text-amber-100/50">(firstinspires.org)</span>
                </li>
                <li>
                  <a
                    href={FIRST_FTC_API_DOCS_URL}
                    className="text-amber-200 underline hover:text-amber-50"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    REST API v2.0 documentation
                  </a>
                </li>
                <li>
                  <a
                    href={SWAGGER_V2}
                    className="text-amber-200 underline hover:text-amber-50"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OpenAPI (Swagger) v2.0
                  </a>{" "}
                  — request and response schemas
                </li>
              </ul>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-xs font-bold text-amber-100">
              2
            </span>
            <div className="min-w-0">
              <p className="font-medium text-amber-50">
                Add variables to your host (e.g. Vercel)
              </p>
              <p className="mt-1.5 text-amber-100/80">
                In the project dashboard:{" "}
                <strong className="font-normal text-amber-100">
                  Settings → Environment Variables
                </strong>
                . Create at least:
              </p>
              <ul className="mt-3 space-y-2 font-mono text-[13px] text-amber-50/95">
                <li className="flex flex-wrap items-center gap-2">
                  <EnvName>FTC_API_USERNAME</EnvName>
                  <span className="text-amber-100/60 font-sans text-sm">
                    — API login
                  </span>
                </li>
                <li className="flex flex-wrap items-center gap-2">
                  <EnvName>FTC_API_KEY</EnvName>
                  <span className="text-amber-100/60 font-sans text-sm">
                    — secret key
                  </span>
                </li>
              </ul>
              <p className="mt-3 rounded-md border border-amber-400/20 bg-black/20 px-3 py-2 text-xs leading-relaxed text-amber-100/78">
                In Vercel, the <strong className="font-medium text-amber-100">Name</strong>{" "}
                field must be exactly these names (
                <EnvName>FTC_API_USERNAME</EnvName>, <EnvName>FTC_API_KEY</EnvName>); put
                your login and token only in{" "}
                <strong className="font-medium text-amber-100">Value</strong>. Do not use
                your username as the variable name.
              </p>
              <p className="mt-3 text-amber-100/75">
                Enable them for{" "}
                <strong className="font-normal text-amber-100">Production</strong> and,
                if you test PR previews, for{" "}
                <strong className="font-normal text-amber-100">Preview</strong>. Vercel
                help:{" "}
                <a
                  href={VERCEL_ENV_DOCS}
                  className="text-amber-200 underline hover:text-amber-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Environment Variables
                </a>
                .
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-xs font-bold text-amber-100">
              3
            </span>
            <div className="min-w-0">
              <p className="font-medium text-amber-50">API season (optional)</p>
              <p className="mt-1.5 text-amber-100/80">
                If the event list looks like the wrong year, set{" "}
                <EnvName>FTC_SEASON_YEAR</EnvName> (the year the REST API expects for the
                current game). For the predictions catalog you can override{" "}
                <EnvName>FTC_PREDICTIONS_API_SEASONS</EnvName> (e.g.{" "}
                <code className="text-amber-100/90">2026,2025</code>).
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-xs font-bold text-amber-100">
              4
            </span>
            <div className="min-w-0">
              <p className="font-medium text-amber-50">Redeploy</p>
              <p className="mt-1.5 text-amber-100/80">
                After saving variables,{" "}
                <strong className="font-normal text-amber-100">Redeploy</strong> the
                latest deployment on Vercel or push an empty commit — otherwise the new
                values will not be picked up.
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-xs font-bold text-emerald-100">
              ✓
            </span>
            <div className="min-w-0">
              <p className="font-medium text-emerald-100/95">Verify on this site</p>
              <p className="mt-1.5 text-amber-100/80">
                Health check (JSON):{" "}
                <Link
                  href="/api/ftc-status"
                  className="text-amber-200 underline hover:text-amber-50"
                >
                  /api/ftc-status
                </Link>{" "}
                — <code className="text-amber-100/90">credentialsPresent</code> and{" "}
                <code className="text-amber-100/90">listingsOk</code> without exposing
                secrets. Then open{" "}
                <Link
                  href="/events"
                  className="text-amber-200 underline hover:text-amber-50"
                >
                  Events
                </Link>{" "}
                and{" "}
                <Link
                  href="/predictions#event-analysis"
                  className="text-amber-200 underline hover:text-amber-50"
                >
                  Predictions → Event analysis
                </Link>
                .
              </p>
            </div>
          </li>
        </ol>

        <div className="mt-6 border-t border-amber-400/15 pt-5 text-sm text-amber-100/70">
          <p>
            <strong className="font-medium text-amber-100">Overall analysis</strong> on
            this page uses FTC Scout and can work without the FIRST API; Event analysis
            requires{" "}
            <EnvName>FTC_API_USERNAME</EnvName> and <EnvName>FTC_API_KEY</EnvName>.
          </p>
        </div>
      </GlassCard>
    </section>
  );
}

/** Short pointer when the full guide is rendered above on the same page. */
export function FirstApiSetupPointer() {
  return (
    <p className="text-sm leading-relaxed text-white/50">
      Keys and deployment steps are in the{" "}
      <a
        href="#first-api-setup"
        className="font-medium text-violet-300 underline hover:text-violet-200"
      >
        How to connect the FIRST Events API
      </a>{" "}
      section above on this page. Refresh after you finish setup.
    </p>
  );
}
