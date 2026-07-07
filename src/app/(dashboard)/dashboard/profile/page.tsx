"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { PLANS } from "@/lib/config/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";

interface ProfileData {
  empresa: {
    id: string;
    nombre_empresa: string;
    slug: string;
    plan: "basic" | "pro" | null;
    estado_suscripcion: string;
    moneda_facturacion: string;
    leads_limite_mes: number;
    leads_usados_mes: number;
    created_at: string;
  };
  email: string | undefined;
  rol: string;
  is_super_admin?: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const load = useCallback(async () => {
    const res = await fetch("/api/empresa/profile");
    const json = (await res.json()) as ProfileData & { error?: string };
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }
    setProfile(json);
    setNombreEmpresa(json.empresa.nombre_empresa);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/empresa/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_empresa: nombreEmpresa }),
    });
    const json = (await res.json()) as { error?: string };
    setSaving(false);

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }

    toast({ title: "Perfil actualizado" });
    void load();
  }

  async function handleDeleteAccount() {
    if (!profile || confirmDelete.trim() !== profile.empresa.nombre_empresa.trim()) {
      toast({
        variant: "destructive",
        title: "Confirmación incorrecta",
        description: "Escribe el nombre exacto de tu empresa",
      });
      return;
    }

    const ok = window.confirm(
      "Se cancelará la suscripción PayPal, se borrarán todos los leads y usuarios del equipo. ¿Continuar?",
    );
    if (!ok) return;

    setDeleting(true);
    const res = await fetch("/api/empresa/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmacion: confirmDelete }),
    });
    const json = (await res.json()) as { error?: string };
    setDeleting(false);

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error ?? "No se pudo eliminar" });
      return;
    }

    toast({ title: "Cuenta eliminada" });
    window.location.href = "/";
  }

  if (!profile) return <p>Cargando...</p>;

  const { empresa, email, rol } = profile;
  const isAdmin = rol === "admin";
  const planLabel = empresa.plan ? PLANS[empresa.plan].name : "Sin plan";

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader title="Mi perfil" description="Datos de tu empresa y cuenta" />

      <Card>
        <CardHeader>
          <CardTitle>Información de la empresa</CardTitle>
          <CardDescription>
            {isAdmin ? "Puedes editar el nombre de tu empresa" : "Solo el administrador puede editar estos datos"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_empresa">Nombre de la empresa</Label>
              <Input
                id="nombre_empresa"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                disabled={!isAdmin}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label>URL del widget</Label>
              <p className="text-sm text-muted-foreground rounded-md bg-muted px-3 py-2 break-all">
                {appUrl}/widget/{empresa.slug}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email de la cuenta</Label>
              <Input id="email" value={email ?? ""} disabled />
              <p className="text-xs text-muted-foreground">El email se gestiona desde tu cuenta de acceso</p>
            </div>
            {isAdmin && (
              <Button type="submit" disabled={saving || nombreEmpresa === empresa.nombre_empresa}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan actual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {planLabel}
            </span>
            <span className="text-sm text-muted-foreground capitalize">{empresa.estado_suscripcion}</span>
          </div>
          {empresa.estado_suscripcion === "active" && (
            <p className="text-sm">
              {empresa.leads_usados_mes} / {empresa.leads_limite_mes} leads usados este mes
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/subscription">Gestionar suscripción</Link>
            </Button>
            {empresa.plan === "basic" && empresa.estado_suscripcion === "active" && (
              <Button asChild>
                <Link href="/dashboard/subscription?upgrade=pro">Mejorar a Pro</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {profile.is_super_admin && (
        <Card>
          <CardHeader>
            <CardTitle>Administración SolarFlow</CardTitle>
            <CardDescription>Gestiona todas las empresas del servicio</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/admin">Abrir panel de administración</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Zona peligrosa</CardTitle>
            <CardDescription>
              Elimina permanentemente tu empresa, todos los leads, el equipo y la suscripción PayPal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm_delete">
                Escribe <span className="font-semibold">{empresa.nombre_empresa}</span> para confirmar
              </Label>
              <Input
                id="confirm_delete"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder={empresa.nombre_empresa}
              />
            </div>
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10"
              disabled={deleting || confirmDelete.trim() !== empresa.nombre_empresa.trim()}
              onClick={handleDeleteAccount}
            >
              {deleting ? "Eliminando..." : "Eliminar cuenta y todos los datos"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
