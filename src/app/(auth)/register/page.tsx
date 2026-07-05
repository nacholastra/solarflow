"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { BRAND } from "@/lib/config/brand";

export default function RegisterPage() {
  const router = useRouter();
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
          nombre_empresa: nombreEmpresa,
        }),
      });

      let json: { error?: string } = {};
      try {
        json = (await res.json()) as { error?: string };
      } catch {
        throw new Error("El servidor no respondió correctamente. ¿Estás en el puerto correcto? Usa http://localhost:3000");
      }

      if (!res.ok) {
        const msg = json.error ?? `Error ${res.status} al registrarse`;
        setErrorMsg(msg);
        toast({ variant: "destructive", title: "Error al registrarse", description: msg });
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        const msg = signInError.message;
        setErrorMsg(msg);
        toast({
          variant: "destructive",
          title: "Cuenta creada pero no se pudo iniciar sesión",
          description: msg,
        });
        router.push("/login");
        return;
      }

      toast({ title: "Cuenta creada", description: "Elige tu plan para activar el simulador" });
      router.push("/dashboard/subscription");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de conexión. Reinicia el servidor con npm run dev";
      setErrorMsg(msg);
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center gap-2 font-bold text-xl">
            <Sun className="h-6 w-6 text-amber-500" />
            {BRAND.name}
          </div>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>Registra tu empresa instaladora</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="empresa">Nombre de la empresa</Label>
              <Input id="empresa" value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando..." : "Registrarse"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
