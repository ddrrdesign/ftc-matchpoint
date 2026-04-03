import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/predictor", label: "Predictor" },
  { href: "/events", label: "Events" },
  { href: "/teams", label: "Teams" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#05030a]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[#05030a]/70">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
        <Link
          href="/"
          className="shrink-0 touch-manipulation whitespace-nowrap text-[1.05rem] font-semibold tracking-tight sm:text-lg"
        >
          <span className="text-white">FTC</span>{" "}
          <span className="bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
            MatchPoint
          </span>
        </Link>

        <nav
          className="flex min-w-0 flex-1 justify-end gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 md:gap-8 [&::-webkit-scrollbar]:hidden"
          aria-label="Main"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 text-sm text-white/60 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
