import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/security/api-origin";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { hashClientIp } from "@/lib/security/ip-hash";

const MIN_FORM_MS = 1_500;
const MAX_FORM_AGE_MS = 86_400_000;

const contactSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  empresa: z.string().trim().max(120).optional().or(z.literal("")),
  telefono: z.string().trim().max(20).optional().or(z.literal("")),
  mensaje: z.string().trim().min(10).max(2000),
  consentimiento_rgpd: z.literal(true),
  website: z.string().optional(),
  form_started_at: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(`contact:${ip}`, 3, 3_600_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec ?? 3600) } },
      );
    }

    const json = await request.json();

    if (typeof json.website === "string" && json.website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const parsed = contactSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const data = parsed.data;
    const elapsed = Date.now() - data.form_started_at;
    if (elapsed < MIN_FORM_MS || elapsed > MAX_FORM_AGE_MS) {
      return NextResponse.json({ error: "Solicitud no válida" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent");
    const supabase = await createServiceClient();

    const { error } = await supabase.from("contact_inquiries").insert({
      nombre: data.nombre,
      email: data.email.toLowerCase(),
      empresa: data.empresa?.trim() || null,
      telefono: data.telefono?.trim() || null,
      mensaje: data.mensaje,
      consentimiento_rgpd: true,
      ip_hash: hashClientIp(ip),
      user_agent: userAgent?.slice(0, 512) ?? null,
    });

    if (error) {
      console.error("contact insert:", error.message);
      return NextResponse.json({ error: "No se pudo enviar el mensaje" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
