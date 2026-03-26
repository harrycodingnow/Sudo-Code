import Image from "next/image";

import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  compact?: boolean;
};

function LogoMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? 40 : 48;

  return (
    <Image
      src="/icon.png"
      alt="SudoCode logo"
      width={size}
      height={size}
      priority
      aria-hidden="true"
      className={compact ? "h-10 w-10 rounded-xl object-contain" : "h-12 w-12 rounded-xl object-contain"}
    />
  );
}

export function Logo({ className = "", compact = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark compact={compact} />
      <div className="flex min-w-0 flex-col">
        <span
          className={cn(
            "linear-heading leading-none",
            compact ? "text-[1.2rem] font-semibold" : "text-[1.65rem] font-semibold sm:text-[1.85rem]",
          )}
        >
          SudoCode
        </span>
        {!compact ? (
          <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
            Interview practice, stripped down to reasoning
          </span>
        ) : null}
      </div>
    </div>
  );
}
