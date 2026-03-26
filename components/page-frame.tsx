import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/cn";

type PageFrameProps = {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
};

export function PageFrame({
  children,
  className = "",
  mainClassName = "",
}: PageFrameProps) {
  return (
    <div className={cn("min-h-screen text-foreground", className)}>
      <SiteHeader />
      <main
        className={cn(
          "mx-auto w-full max-w-[1380px] px-4 pb-16 pt-6 sm:px-6 lg:px-8",
          mainClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}
