import Link from "next/link";
import Image from "next/image";
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
    <Image
      src="/brand/logo.png"
      alt=""
      width={28}
      height={28}
      className={cn("size-7 shrink-0", className)}
      aria-hidden
    />
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
