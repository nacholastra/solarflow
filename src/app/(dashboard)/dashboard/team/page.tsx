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
import { PLANS } from "@/lib/config/plans";

export default function TeamPage() {
  const { empresaId, rol } = useDashboardContext();
  const [email, setEmail] = useState("");
  const [invitaciones, setInvitaciones] = useState<{ email: string; expira_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const isAdmin = rol === "admin";

  const load = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("invitaciones_equipo")
      .select("email, expira_at")
      .eq("empresa_id", empresaId)
      .is("aceptada_at", null);

    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else setInvitaciones(data ?? []);
    setLoading(false);
  }, [empresaId, isAdmin, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
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
        description={`Invita comerciales (máx. ${PLANS.pro.teamLimit} en Pro)`}
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
              />
            </div>
            <Button type="submit">Invitar</Button>
          </form>
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
