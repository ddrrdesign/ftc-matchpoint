"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/predictor", label: "Predictor" },
  { href: "/events", label: "Events" },
  { href: "/teams", label: "Teams" },
] as const;

function navItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.1] bg-[#05030a]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#05030a]/75">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:gap-x-6 sm:px-6 sm:py-5">
        <Link
          href="/"
          className="shrink-0 touch-manipulation whitespace-nowrap text-lg font-semibold tracking-tight sm:text-xl"
        >
          <span className="text-white">FTC</span>{" "}
          <span className="bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
            MatchPoint
          </span>
        </Link>

        <nav
          className="flex min-w-0 flex-1 justify-end gap-1.5 sm:gap-2 md:gap-2.5"
          aria-label="Main"
        >
          {nav.map((item) => {
            const active = navItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "shrink-0 touch-manipulation rounded-xl px-3.5 py-2.5 text-[0.9375rem] font-medium leading-none transition sm:px-4 sm:py-3 sm:text-base md:text-[1.0625rem]",
                  active
                    ? "bg-violet-500/25 text-white shadow-[0_0_0_1px_rgba(139,92,246,0.35)]"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
