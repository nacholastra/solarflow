"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/marketing/section-header";
import { toast } from "@/hooks/use-toast";

export function ContactSection() {
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      toast({
        variant: "destructive",
        title: "Consentimiento necesario",
        description: "Debes aceptar la política de privacidad para enviar el formulario.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          empresa,
          telefono,
          mensaje,
          consentimiento_rgpd: true,
          website,
          form_started_at: formStartedAt,
        }),
      });

      const json = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "No se pudo enviar",
          description: json.error ?? "Inténtalo de nuevo en unos minutos.",
        });
        return;
      }

      setSent(true);
      toast({
        title: "Mensaje enviado",
        description: "Te responderemos al correo que indicaste lo antes posible.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "Comprueba tu red e inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contacto" className="scroll-mt-16 border-b border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <SectionHeader
            eyebrow="Contacto"
            title="¿Tienes dudas antes de registrarte?"
            description="Cuéntanos tu caso completando el formulario. Revisamos cada consulta y te respondemos al correo que indiques."
          />

          <div className="rounded-2xl border border-border/60 bg-background p-6 shadow-soft md:p-8">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle2 className="size-12 text-positive" aria-hidden />
                <h3 className="text-lg font-semibold text-foreground">Gracias por contactarnos</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Hemos recibido tu mensaje. Revisaremos tu consulta y te responderemos a la dirección
                  que indicaste.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSent(false);
                    setNombre("");
                    setEmail("");
                    setEmpresa("");
                    setTelefono("");
                    setMensaje("");
                    setConsent(false);
                    setFormStartedAt(Date.now());
                  }}
                >
                  Enviar otra consulta
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-nombre">Nombre *</Label>
                    <Input
                      id="contact-nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      maxLength={120}
                      autoComplete="name"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Correo electrónico *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={254}
                      autoComplete="email"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-empresa">Empresa</Label>
                    <Input
                      id="contact-empresa"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      maxLength={120}
                      autoComplete="organization"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-telefono">Teléfono</Label>
                    <Input
                      id="contact-telefono"
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      maxLength={20}
                      autoComplete="tel"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-mensaje">Mensaje *</Label>
                  <textarea
                    id="contact-mensaje"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    placeholder="Cuéntanos qué volumen de leads manejas, si ya tienes web, etc."
                    className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  <p className="text-xs text-muted-foreground">{mensaje.length}/2000</p>
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-1 size-4 rounded border-input accent-primary"
                  />
                  <span>
                    Acepto que SolarFlow trate mis datos para responder a esta consulta, según la{" "}
                    <Link href="/privacidad" className="font-medium text-foreground underline-offset-4 hover:underline">
                      política de privacidad
                    </Link>
                    . *
                  </span>
                </label>

                <Button type="submit" size="lg" variant="solar" className="w-full sm:w-auto" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      Enviar mensaje
                      <Send className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
