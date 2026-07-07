"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { toast } from "@/hooks/use-toast";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const res = await fetch("/api/auth/resend-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = (await res.json()) as { error?: string };
    setSending(false);

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error ?? "No se pudo reenviar" });
      return;
    }

    setSent(true);
    toast({ title: "Email enviado", description: "Revisa tu bandeja de entrada y la carpeta de spam" });
  }

  return (
    <AuthShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Confirma tu email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Te hemos enviado un enlace de confirmación. Haz clic en el email para activar tu cuenta y
            acceder al panel.
          </p>
        </div>

        {sent ? (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
            Si el email existe en nuestro sistema, recibirás un nuevo enlace en breve.
          </p>
        ) : (
          <form onSubmit={handleResend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Enviando..." : "Reenviar email de confirmación"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya confirmaste?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
