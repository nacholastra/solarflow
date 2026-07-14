import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { proposeMonthlyDraft } from "@/lib/solar/tariff-params";

/**
 * Cron mensual (día 1): crea borrador del mes copiando el activo.
 * NO publica. Revisar en /admin/tarifas.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const service = await createServiceClient();
    const result = await proposeMonthlyDraft(service);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("cron propose-tariffs:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
