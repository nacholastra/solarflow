"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { safeRedirectPath } from "@/lib/security/safe-redirect";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const presetEmail = searchParams.get("email") ?? "";
  const authCallbackError = searchParams.get("error") === "auth_callback";
  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const isUnconfirmed =
          error.message.toLowerCase().includes("email not confirmed") ||
          error.message.toLowerCase().includes("correo no confirmado");
        if (isUnconfirmed) {
          setErrorMsg("Confirma tu email antes de iniciar sesión.");
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        setErrorMsg(error.message);
        toast({ variant: "destructive", title: "Error al iniciar sesión", description: error.message });
        return;
      }

      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      toast({ title: "Sesión iniciada" });
      if (inviteToken) {
        router.push(`/invite/${inviteToken}`);
      } else {
        router.push(safeRedirectPath(searchParams.get("next"), "/dashboard"));
      }
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
          <h1 className="text-2xl font-semibold tracking-tight">Accede a tu panel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Introduce tus credenciales para gestionar tus leads.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {authCallbackError && !errorMsg && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              El enlace de confirmación ha expirado o no es válido. Inicia sesión o solicita un nuevo email.
            </div>
          )}
          {errorMsg && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {errorMsg}
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
              className="h-11 bg-background"
              required
            />
          </div>
          <Button type="submit" className="h-10 w-full" disabled={loading}>
            {loading ? "Accediendo…" : "Acceder"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link
            href={inviteToken ? `/register?invite=${inviteToken}` : "/register"}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
      <LoginForm />
    </Suspense>
  );
}
