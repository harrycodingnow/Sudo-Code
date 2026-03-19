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

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-semibold text-white"
          >
            S
          </Link>
          <div>
            <p className="text-lg font-semibold text-foreground">SudoCode</p>
            <p className="text-xs text-muted">Pseudocode interview practice</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
          {navItems.map((item) => {
            const active = item.isActive(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-muted hover:text-white"
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
