import { NextResponse } from "next/server";
import { createAnonAuthClient } from "@/lib/team/invite";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { getSiteUrl } from "@/lib/config/site";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`resend-confirm:${ip}`, 3, 3_600_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Inténtalo más tarde." },
        { status: 429 },
      );
    }

    const body = schema.parse(await request.json());
    const supabase = createAnonAuthClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: body.email,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      console.error("resend confirmation error:", error.message);
      return NextResponse.json({ error: "No se pudo reenviar el email" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
