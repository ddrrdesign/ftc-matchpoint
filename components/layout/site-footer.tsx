const INSTAGRAM_URL = "https://www.instagram.com/first.jeltoqsun/";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-white/[0.07] bg-[#05030a]/80 py-8 backdrop-blur-sm sm:py-10">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-sm font-medium tracking-wide text-white/75">
          Predict the match. Understand the game.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/45">
          Questions or ran into an issue? Reach out on Instagram:{" "}
          <a
            href={INSTAGRAM_URL}
            className="font-medium text-violet-300/90 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            @first.jeltoqsun
          </a>
          .
        </p>
        <p className="mt-3 text-xs text-white/40">
          Made by JelToqSun <span className="font-mono text-white/55">#27772</span>
        </p>
      </div>
    </footer>
  );
}
