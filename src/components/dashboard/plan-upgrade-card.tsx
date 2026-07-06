import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PlanUpgradeCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-amber-950">
          <Sparkles className="size-4" />
          {title}
        </CardTitle>
        <CardDescription className="text-amber-900/80">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild size="sm">
          <Link href="/dashboard/subscription?upgrade=pro">Mejorar a Pro</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
