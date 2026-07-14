"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { createClient } from "@/lib/supabase/client";
import { PLANS, getPlanPrice, type PlanId } from "@/lib/config/plans";
import { TRIAL_DAYS } from "@/lib/config/trial";
import type { LaunchOfferStatus } from "@/lib/config/launch-offer-status";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export function RegisterForm({ offer }: { offer: LaunchOfferStatus }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [inviteEmpresa, setInviteEmpresa] = useState<string | null>(null);
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [plan, setPlan] = useState<PlanId>("basic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const discount = offer.active ? offer.discountPercent : 0;

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
          accepted_terms: inviteToken ? undefined : acceptedTerms,
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
        title: "Cuenta creada",
        description: inviteToken
          ? `Te has unido a ${inviteEmpresa ?? "el equipo"}`
          : `Tienes ${TRIAL_DAYS} días de prueba. Personaliza tu simulador — ya llevas el primer paso.`,
      });
      router.push("/dashboard");
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
              : `Registra tu empresa y empieza la prueba de ${TRIAL_DAYS} días`}
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
                placeholder="Ej. Solar Norte SL"
                className="h-11 bg-background"
                required
                autoComplete="organization"
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
                  const fullPrice = p.priceEur;
                  const salePrice = getPlanPrice(id, "EUR", { discountPercent: discount });
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
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{p.name}</span>
                        {id === "basic" && (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Recomendado
                          </span>
                        )}
                        {selected && id !== "basic" && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-1 flex flex-wrap items-baseline gap-1.5 text-sm">
                        {discount > 0 && (
                          <span className="text-muted-foreground line-through">{fullPrice} €</span>
                        )}
                        <span className="font-medium text-foreground">{salePrice} €/mes</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.leadsLimit} leads · {p.teamLimit} usuarios
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Basic está preseleccionado para empezar. {TRIAL_DAYS} días gratis incluidos.
                {offer.active
                  ? ` Quedan ${offer.slotsRemaining} plazas con −${offer.discountPercent}% permanente.`
                  : null}
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
          {!inviteToken && (
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-border"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
              />
              <span>
                Acepto los{" "}
                <Link href="/terminos" className="font-medium text-foreground underline-offset-4 hover:underline" target="_blank">
                  términos de servicio
                </Link>{" "}
                y la{" "}
                <Link href="/privacidad" className="font-medium text-foreground underline-offset-4 hover:underline" target="_blank">
                  política de privacidad
                </Link>
                .
              </span>
            </label>
          )}
          <Button type="submit" className="h-11 w-full" disabled={loading || (!inviteToken && !acceptedTerms)}>
            {loading
              ? "Creando..."
              : inviteToken
                ? "Crear cuenta y unirme"
                : `Empezar ${TRIAL_DAYS} días gratis`}
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
