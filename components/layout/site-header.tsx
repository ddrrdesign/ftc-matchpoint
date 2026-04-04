"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/predictions", label: "Predictions" },
  { href: "/events", label: "Events" },
  { href: "/teams", label: "Teams" },
] as const;

function navItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const linkClass = (active: boolean, mobile?: boolean) =>
  [
    mobile
      ? "w-full rounded-xl px-4 py-3.5 text-base font-medium"
      : "shrink-0 touch-manipulation rounded-xl px-3.5 py-2.5 text-[0.9375rem] font-medium leading-none sm:px-4 sm:py-3 sm:text-base md:text-[1.0625rem]",
    "transition",
    active
      ? "bg-violet-500/25 text-white shadow-[0_0_0_1px_rgba(139,92,246,0.35)]"
      : "text-white/55 hover:bg-white/[0.06] hover:text-white",
  ].join(" ");

export function SiteHeader() {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
          aria-hidden
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <header className="sticky top-0 z-50 w-full min-w-0 max-w-full overflow-x-hidden border-b border-white/[0.1] bg-[#05030a]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#05030a]/75">
        <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-4 sm:py-5">
            <Link
              href="/"
              className="min-w-0 touch-manipulation truncate text-lg font-semibold tracking-tight sm:text-xl"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-white">FTC</span>{" "}
              <span className="bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
                MatchPoint
              </span>
            </Link>

            <nav
              className="hidden min-w-0 flex-1 justify-end gap-1.5 md:flex md:gap-2 lg:gap-2.5"
              aria-label="Main"
            >
              {nav.map((item) => {
                const active = navItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={linkClass(active, false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              className="inline-flex h-12 min-w-12 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-white/90 transition hover:bg-white/[0.1] md:hidden"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {menuOpen ? (
            <nav
              id={menuId}
              className="border-t border-white/[0.08] pb-5 pt-2 md:hidden"
              aria-label="Main mobile"
            >
              <div className="flex flex-col gap-1">
                {nav.map((item) => {
                  const active = navItemActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={linkClass(active, true)}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          ) : null}
        </div>
      </header>
    </>
  );
}
