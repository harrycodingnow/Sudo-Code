"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { SpotlightCard } from "@/components/spotlight-card";
import { cn } from "@/lib/cn";

const navItems = [
  {
    href: "/",
    label: "Home",
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/problems",
    label: "Problems",
    isActive: (pathname: string) => pathname === "/problems" || pathname.startsWith("/problems/"),
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
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <SpotlightCard className="linear-shell mx-auto max-w-[1380px] rounded-[1.75rem] px-4 py-4 sm:px-6">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="min-w-0">
            <Logo compact />
          </Link>

          <nav className="flex flex-wrap items-center gap-2 lg:ml-auto lg:justify-end">
            {navItems.map((item) => {
              const active = item.isActive(pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium",
                    active
                      ? "linear-tab-active"
                      : "linear-pill text-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </SpotlightCard>
    </header>
  );
}
