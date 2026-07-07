"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

type InviteInfo = {
  status: string;
  email: string;
  rol: string;
  empresaNombre: string;
  expiraAt: string;
};

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/invite/${token}`);
    const json = (await res.json()) as InviteInfo & { error?: string };
    if (!res.ok) {
      setInvite(null);
    } else {
      setInvite(json);
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setSessionEmail(user?.email ?? null);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAccept() {
    setAccepting(true);
    const res = await fetch(`/api/invite/${token}/accept`, { method: "POST" });
    const json = (await res.json()) as { error?: string; empresaNombre?: string };
    setAccepting(false);

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error ?? "No se pudo aceptar" });
      return;
    }

    toast({
      title: "¡Bienvenido al equipo!",
      description: `Te has unido a ${json.empresaNombre ?? "la empresa"}`,
    });
    router.push("/dashboard");
    router.refresh();
  }

  if (loading) {
    return (
      <AuthShell>
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </AuthShell>
    );
  }

  if (!invite) {
    return (
      <AuthShell>
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Invitación no válida</h1>
          <p className="text-sm text-muted-foreground">
            El enlace no existe o ha caducado. Pide al administrador que te envíe una nueva invitación.
          </p>
          <Button asChild>
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  const expired = invite.status === "expired";
  const accepted = invite.status === "already_accepted";
  const emailMatches = sessionEmail?.toLowerCase() === invite.email.toLowerCase();

  return (
    <AuthShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invitación al equipo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {invite.empresaNombre} te ha invitado como{" "}
            <span className="font-medium text-foreground">{invite.rol}</span>
          </p>
        </div>

        {expired && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Esta invitación expiró el {new Date(invite.expiraAt).toLocaleDateString("es-ES")}.
          </p>
        )}

        {accepted && (
          <p className="rounded-lg border border-muted bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Esta invitación ya fue aceptada. Inicia sesión para acceder al panel.
          </p>
        )}

        {!expired && !accepted && (
          <>
            <p className="text-sm text-muted-foreground">
              Email invitado: <span className="font-medium text-foreground">{invite.email}</span>
            </p>

            {sessionEmail ? (
              <div className="space-y-3">
                {!emailMatches && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    Has iniciado sesión como {sessionEmail}. Cierra sesión y entra con {invite.email}.
                  </p>
                )}
                <Button
                  className="w-full"
                  onClick={handleAccept}
                  disabled={accepting || !emailMatches}
                >
                  {accepting ? "Uniéndote..." : "Aceptar invitación"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href={`/register?invite=${token}`}>Crear cuenta</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/login?invite=${token}&email=${encodeURIComponent(invite.email)}`}>
                    Ya tengo cuenta
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}

        {(expired || accepted) && (
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        )}
      </div>
    </AuthShell>
  );
}
