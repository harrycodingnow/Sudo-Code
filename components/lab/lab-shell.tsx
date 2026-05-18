import Link from "next/link";
import type { ReactNode } from "react";

import { LabChat } from "./lab-chat";
import "./lab-theme.css";

type LabShellProps = {
  active: "home" | "problems" | "tracker" | "lab";
  stats?: ReactNode;
  children: ReactNode;
};

const NAV_ITEMS: Array<{ key: LabShellProps["active"]; label: string; href: string }> = [
  { key: "home", label: "Home", href: "/" },
  { key: "problems", label: "Problems", href: "/problems" },
  { key: "tracker", label: "Tracker", href: "/tracker" },
];

export function LabShell({ active, stats, children }: LabShellProps) {
  return (
    <div className="pseudo-lab">
      <header className="pl-nav">
        <Link href="/" className="pl-brand" aria-label="SudoCode">
          <span className="pl-brand-dot" />
          <span>sudocode</span>
          <span style={{ color: "var(--fg-faint)" }}>~/lab</span>
        </Link>
        <nav className="pl-nav-links" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`pl-nav-link${active === item.key ? " is-active" : ""}`}
              aria-current={active === item.key ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="pl-nav-right">
          {stats ?? (
            <span className="pl-nav-stat">
              <span className="pl-nav-stat-dot" />
              ready
            </span>
          )}
        </div>
      </header>
      {children}
      <LabChat />
    </div>
  );
}
