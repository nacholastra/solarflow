import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  hint?: string;
  hintTone?: "positive" | "muted";
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  hintTone = "muted",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {hint && (
            <p
              className={cn(
                "text-xs font-medium",
                hintTone === "positive" ? "text-positive" : "text-muted-foreground",
              )}
            >
              {hint}
            </p>
          )}
        </div>
        <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
