"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { createClient } from "@/lib/supabase/client";
import { PLANS, type PlanId } from "@/lib/config/plans";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [inviteEmpresa, setInviteEmpresa] = useState<string | null>(null);
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [plan, setPlan] = useState<PlanId>("basic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!inviteToken) return;
    fetch(`/api/invite/${inviteToken}`)
      .then((r) => r.json())
      .then((json: { empresaNombre?: string; email?: string; status?: string }) => {
        if (json.empresaNombre) setInviteEmpresa(json.empresaNombre);
        if (json.email) setEmail(json.email);
      })
      .catch(() => undefined);
  }, [inviteToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          nombre_empresa: inviteToken ? undefined : nombreEmpresa,
          plan: inviteToken ? undefined : plan,
          invite_token: inviteToken ?? undefined,
        }),
      });

      let json: { error?: string; requiresEmailConfirmation?: boolean; invitePath?: string } = {};
      try {
        json = (await res.json()) as typeof json;
      } catch {
        throw new Error("El servidor no respondió correctamente.");
      }

      if (!res.ok) {
        const msg = json.error ?? `Error ${res.status} al registrarse`;
        setErrorMsg(msg);
        toast({ variant: "destructive", title: "Error al registrarse", description: msg });
        return;
      }

      if (json.requiresEmailConfirmation) {
        toast({
          title: "Revisa tu email",
          description: "Te hemos enviado un enlace para confirmar tu cuenta",
        });
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        router.push("/login");
        return;
      }

      toast({
        title: inviteToken ? "Cuenta creada" : "Cuenta creada",
        description: inviteToken ? `Te has unido a ${inviteEmpresa ?? "el equipo"}` : "Elige tu plan para activar el simulador",
      });
      router.push(inviteToken ? "/dashboard" : "/dashboard/subscription");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de conexión";
      setErrorMsg(msg);
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {inviteToken ? "Únete al equipo" : "Crea tu cuenta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {inviteToken && inviteEmpresa
              ? `Regístrate para unirte a ${inviteEmpresa}`
              : "Registra tu empresa instaladora"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {errorMsg}
            </div>
          )}
          {!inviteToken && (
            <div className="space-y-2">
              <Label htmlFor="empresa" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Nombre de la empresa
              </Label>
              <Input
                id="empresa"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                className="h-11 bg-background"
                required
              />
            </div>
          )}
          {!inviteToken && (
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Elige tu plan
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(PLANS) as PlanId[]).map((id) => {
                  const p = PLANS[id];
                  const selected = plan === id;
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setPlan(id)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition",
                        selected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{p.name}</span>
                        {selected && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{p.priceEur} €/mes</p>
                      <p className="text-xs text-muted-foreground">
                        {p.leadsLimit} leads · {p.teamLimit} usuarios
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Podrás completar el pago tras crear la cuenta.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-background"
              required
              readOnly={!!inviteToken && !!email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="h-11 bg-background"
              required
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Creando..." : inviteToken ? "Crear cuenta y unirme" : "Registrarse"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={inviteToken ? `/login?invite=${inviteToken}&email=${encodeURIComponent(email)}` : "/login"}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
      <RegisterForm />
    </Suspense>
  );
}
