"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Home",
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/#problems",
    label: "Problems",
    isActive: () => false,
  },
  {
    href: "/tracker",
    label: "Tracker",
    isActive: (pathname: string) => pathname === "/tracker",
  },
];

const activeTabClass =
  "bg-[rgba(96,101,120,0.8)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.14),transparent_40%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] px-5 py-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#6dbf84]/30 bg-[linear-gradient(135deg,rgba(134,211,155,0.25)_0%,rgba(109,191,132,0.12)_100%)] text-sm font-semibold uppercase tracking-[0.18em] text-[#86d39b] shadow-[0_8px_20px_rgba(63,118,84,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            S
          </Link>
          <div>
            <p className="text-[0.95rem] font-semibold tracking-tight text-foreground">
              SudoCode
            </p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
              Pseudocode practice
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-[rgba(36,42,58,0.76)] p-1 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:flex">
          {navItems.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 transition ${
                  active
                    ? activeTabClass
                    : "text-muted hover:bg-white/[0.04] hover:text-foreground"
                }`}
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
