"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useDashboardContext } from "@/components/dashboard/dashboard-provider";
import { getTeamLimit } from "@/lib/config/plan-features";

export default function TeamPage() {
  const { empresaId, rol, plan } = useDashboardContext();
  const [email, setEmail] = useState("");
  const [invitaciones, setInvitaciones] = useState<{ email: string; expira_at: string }[]>([]);
  const [miembros, setMiembros] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const isAdmin = rol === "admin";
  const teamLimit = getTeamLimit(plan);
  const slotsUsed = miembros + invitaciones.length;

  const load = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const [{ data, error }, { count: equipoCount }] = await Promise.all([
      supabase
        .from("invitaciones_equipo")
        .select("email, expira_at")
        .eq("empresa_id", empresaId)
        .is("aceptada_at", null)
        .gt("expira_at", new Date().toISOString()),
      supabase
        .from("equipo")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId),
    ]);

    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else setInvitaciones(data ?? []);
    setMiembros(equipoCount ?? 0);
    setLoading(false);
  }, [empresaId, isAdmin, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

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
    const token = crypto.randomUUID();
    const expira = new Date();
    expira.setDate(expira.getDate() + 7);
    const { error } = await supabase.from("invitaciones_equipo").insert({
      empresa_id: empresaId,
      email,
      rol: "comercial",
      token,
      expira_at: expira.toISOString(),
    });
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else {
      toast({ title: "Invitación creada", description: `Enlace: /invite/${token}` });
      setEmail("");
      void load();
    }
  }

  if (!isAdmin) {
    return (
      <p className="text-muted-foreground">Solo el administrador puede gestionar el equipo.</p>
    );
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

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      ) : (
        invitaciones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Invitaciones pendientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {invitaciones.map((inv) => (
                <p key={inv.email} className="text-sm">
                  {inv.email} — expira {new Date(inv.expira_at).toLocaleDateString("es-ES")}
                </p>
              ))}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
