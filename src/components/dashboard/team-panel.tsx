"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { getTeamLimit } from "@/lib/config/plan-features";
import type { TeamData } from "@/lib/dashboard/team-data";

export function TeamPanel({
  initialData,
  appUrl,
  rol,
  plan,
}: {
  initialData: TeamData;
  appUrl: string;
  rol: "admin" | "comercial";
  plan: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const isAdmin = rol === "admin";
  const teamLimit = getTeamLimit(plan);
  const slotsUsed = initialData.miembros + initialData.invitaciones.length;

  if (!isAdmin) {
    return <p className="text-muted-foreground">Solo el administrador puede gestionar el equipo.</p>;
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (slotsUsed >= teamLimit) {
      toast({
        variant: "destructive",
        title: "Límite de equipo alcanzado",
        description: `Tu plan permite hasta ${teamLimit} usuarios (incluyendo invitaciones pendientes).`,
      });
      return;
    }

    const res = await fetch("/api/empresa/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = (await res.json()) as { error?: string; invitePath?: string };

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error ?? "No se pudo invitar" });
      return;
    }

    toast({
      title: "Invitación creada",
      description: json.invitePath ? `Enlace: ${appUrl.replace(/\/$/, "")}${json.invitePath}` : undefined,
    });
    setEmail("");
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-8">
      <PageHeader
        title="Equipo"
        description={`${slotsUsed} / ${teamLimit} usuarios · máx. ${teamLimit} en plan ${plan ?? "Basic"}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Invitar comercial</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={invite} className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="comercial@empresa.com"
                required
                disabled={slotsUsed >= teamLimit}
              />
            </div>
            <Button type="submit" disabled={slotsUsed >= teamLimit}>
              Invitar
            </Button>
          </form>
          {slotsUsed >= teamLimit && (
            <p className="mt-3 text-sm text-muted-foreground">
              Has alcanzado el límite de tu plan.{" "}
              {plan === "basic" && "Mejora a Pro para invitar hasta 5 usuarios."}
            </p>
          )}
        </CardContent>
      </Card>

      {initialData.invitaciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitaciones pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {initialData.invitaciones.map((inv) => (
              <div key={inv.email} className="space-y-1 text-sm">
                <p>
                  {inv.email} — expira {new Date(inv.expira_at).toLocaleDateString("es-ES")}
                </p>
                <p className="break-all text-xs text-muted-foreground">
                  {appUrl.replace(/\/$/, "")}/invite/{inv.token}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
