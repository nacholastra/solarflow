import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/config/brand";

interface LogoProps {
  className?: string;
  href?: string;
  /** @deprecated Use wordmarkClassName instead */
  inverted?: boolean;
  wordmarkClassName?: string;
  showWordmark?: boolean;
}

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 text-solar"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  href,
  inverted = false,
  wordmarkClassName,
  showWordmark = true,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {showWordmark && (
        <span
          className={cn(
            "text-base font-semibold tracking-tight text-foreground",
            inverted && "text-sidebar-foreground",
            wordmarkClassName,
          )}
        >
          {BRAND.name}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80" aria-label={`${BRAND.name} inicio`}>
        {content}
      </Link>
    );
  }

  return content;
}
