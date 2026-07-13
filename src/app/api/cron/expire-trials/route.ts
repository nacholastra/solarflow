import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { expireAllTrials } from "@/lib/empresa/subscription-access";

/**
 * Cron diario: pasa a pending las cuentas con trial vencido y sin PayPal.
 * Protegido con CRON_SECRET (Vercel Cron Authorization Bearer).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const service = await createServiceClient();
    const expired = await expireAllTrials(service);
    return NextResponse.json({ ok: true, expired });
  } catch (e) {
    console.error("cron expire-trials:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
