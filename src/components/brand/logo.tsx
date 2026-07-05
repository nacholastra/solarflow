import Link from "next/link";
import { Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/config/brand";

export function Logo({
  className,
  href,
  inverted = false,
}: {
  className?: string;
  href?: string;
  inverted?: boolean;
}) {
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          inverted ? "bg-white/10 ring-1 ring-white/15" : "bg-primary",
        )}
      >
        <Sun
          className={cn("h-4 w-4", inverted ? "text-amber-400" : "text-primary-foreground")}
          strokeWidth={2.25}
        />
      </div>
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          inverted ? "text-white" : "text-foreground",
        )}
      >
        {BRAND.name}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
