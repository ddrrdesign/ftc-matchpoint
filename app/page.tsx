import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { PredictionShowcase } from "@/components/home/prediction-showcase";
import {
  MOCK_PREDICTION_SHOWCASE,
  MOCK_UPCOMING_MATCH,
} from "@/lib/mock-data";

export default function Home() {
  return (
    <PageShell>
      <SiteHeader />

      <main>
        <section className="relative mx-auto max-w-7xl px-4 pt-10 pb-10 sm:px-6 md:pt-16 md:pb-14">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-10">
            <div className="order-2 min-w-0 lg:order-1">
              <div className="relative mb-6 max-w-2xl sm:mb-8">
                <div
                  className="pointer-events-none absolute -left-10 -top-8 h-44 w-72 rounded-full bg-violet-500/30 blur-[56px]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute left-1/4 top-1/2 h-36 w-56 -translate-y-1/2 rounded-full bg-fuchsia-500/20 blur-[48px]"
                  aria-hidden
                />
                <p
                  className="relative text-2xl font-semibold leading-[1.2] tracking-tight text-white sm:text-3xl md:text-4xl md:leading-tight [text-shadow:0_0_42px_rgba(192,174,255,0.55),0_0_88px_rgba(139,92,246,0.38),0_0_120px_rgba(91,33,182,0.22)]"
                >
                  We predict - you decide.
                </p>
                <p className="relative mt-3 max-w-xl text-[15px] leading-relaxed text-violet-100/88 sm:mt-4 sm:text-base md:text-lg [text-shadow:0_0_28px_rgba(167,139,250,0.35),0_0_56px_rgba(139,92,246,0.18)]">
                  Data reveals the edge, but the outcome is always in your hands.
                </p>
                <p className="relative mt-4 max-w-xl text-[14px] leading-relaxed text-white/55 sm:text-[15px]">
                  We built MatchPoint so teams and mentors can practice turning
                  messy competition data into clear questions — who gains from
                  which matchups, where an alliance is thin, what still needs a
                  human look. The site is here to sharpen your{" "}
                  <span className="text-white/75">scouting judgment</span>, not to
                  replace it.
                </p>
              </div>

              <p className="max-w-lg text-[15px] leading-relaxed text-white/45 sm:text-base">
                Start in Predictor with two teams per alliance, hit Compare,
                then open Teams or Events when you want more than the quick read.
              </p>
            </div>

            <div className="relative order-1 w-full min-w-0 lg:order-2">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0614] shadow-[0_0_60px_-12px_rgba(88,28,135,0.45)]">
                <Image
                  src="/hero-home.png"
                  alt="FTC drive team at a competition, focused on the match"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Four team numbers",
                body: "Two for red, two for blue - comma or space.",
              },
              {
                step: "2",
                title: "Compare",
                body: "We sum Scout Total NP per alliance and map that to odds.",
              },
              {
                step: "3",
                title: "Dig in",
                body: "Open team or event pages when you need more than a headline.",
              },
            ].map((x) => (
              <GlassCard key={x.step} glow="violet" className="p-5">
                <p className="font-mono text-xs text-violet-300/80">{x.step}</p>
                <h3 className="mt-2 font-semibold">{x.title}</h3>
                <p className="mt-2 text-sm text-white/50">{x.body}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        <PredictionShowcase
          match={MOCK_UPCOMING_MATCH}
          prediction={MOCK_PREDICTION_SHOWCASE}
        />

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-xl font-semibold">Ready to compare?</h2>
            <p className="mt-1 text-sm text-white/45">
              Same screen teams use on the bus and in the pit. Use{" "}
              <Link href="/predictions" className="text-violet-300 hover:underline">
                Predictor
              </Link>
              ,{" "}
              <Link href="/events" className="text-violet-300 hover:underline">
                Events
              </Link>
              , or{" "}
              <Link href="/teams" className="text-violet-300 hover:underline">
                Teams
              </Link>{" "}
              from the nav.
            </p>
          </GlassCard>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-white/45">
            Questions or ran into an issue? Reach out on Instagram:{" "}
            <a
              href="https://www.instagram.com/there-first.jeltoqsun/"
              className="font-medium text-violet-300/90 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              @there-first.jeltoqsun
            </a>
            .
          </p>
        </section>
      </main>
    </PageShell>
  );
}
