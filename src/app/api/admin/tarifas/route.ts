import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  activateTariff,
  createDraftTariff,
  listTariffs,
  proposeMonthlyDraft,
  type TariffInput,
} from "@/lib/solar/tariff-params";
import { z } from "zod";

const draftSchema = z.object({
  periodo: z.string().regex(/^\d{4}-\d{2}$/),
  precio_energia_medio: z.number().positive().max(2),
  peaje_te_medio: z.number().min(0).max(1),
  cargo_sistema_medio: z.number().min(0).max(1),
  precio_potencia_kw_mes: z.number().min(0).max(5),
  alquiler_contador_mes: z.number().min(0).max(50),
  iee_pct: z.number().min(0).max(1),
  iva_pct: z.number().min(0).max(40),
  precio_vertido_factor: z.number().min(0).max(1),
  fuente: z.string().max(200).optional().nullable(),
  notas: z.string().max(1000).optional().nullable(),
});

const activateSchema = z.object({
  id: z.string().uuid(),
});

export async function GET() {
  try {
    const service = await createServiceClient();
    const tariffs = await listTariffs(service);
    return NextResponse.json({ tariffs });
  } catch (e) {
    console.error("admin tariffs GET:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action as string | undefined;
    const service = await createServiceClient();

    if (action === "propose") {
      const result = await proposeMonthlyDraft(service);
      return NextResponse.json(result);
    }

    if (action === "activate") {
      const { id } = activateSchema.parse(body);
      const result = await activateTariff(service, id);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "draft") {
      const input = draftSchema.parse(body) as TariffInput;
      const tariff = await createDraftTariff(service, input);
      return NextResponse.json({ ok: true, tariff });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: e.flatten() }, { status: 400 });
    }
    console.error("admin tariffs POST:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
