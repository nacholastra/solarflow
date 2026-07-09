import { NextResponse } from "next/server";
import { createAnonAuthClient } from "@/lib/team/invite";
import { isSameOrigin } from "@/lib/security/api-origin";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";
import { getSiteUrl } from "@/lib/config/site";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    const limited = rateLimitResponse(request, "auth-resend-confirmation", 3, 3_600_000);
    if (limited) return limited;

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
    }

    // Respuesta uniforme para no revelar si el email existe
    return NextResponse.json({
      ok: true,
      message: "Si el email está registrado, recibirás un nuevo enlace de confirmación.",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
