import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthenticated } from "@/lib/admin/guard";
import { deleteEmpresaCompletely } from "@/lib/empresa/delete-empresa";
import { PLANS, type PlanId } from "@/lib/config/plans";
import { isSameOrigin } from "@/lib/security/api-origin";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";
import { z } from "zod";

const patchSchema = z.object({
  estado_suscripcion: z.enum(["pending", "active", "suspended", "cancelled"]).optional(),
  plan: z.enum(["basic", "pro"]).nullable().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const limited = rateLimitResponse(request, "admin-empresa-patch", 30, 60_000);
    if (limited) return limited;

    const { id } = await context.params;
    const body = patchSchema.parse(await request.json());

    if (body.estado_suscripcion === undefined && body.plan === undefined) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const service = await createServiceClient();
    const update: Record<string, unknown> = {};
    if (body.estado_suscripcion !== undefined) {
      update.estado_suscripcion = body.estado_suscripcion;
    }
    if (body.plan !== undefined) {
      update.plan = body.plan;
      if (body.plan) {
        update.leads_limite_mes = PLANS[body.plan as PlanId].leadsLimit;
      }
    }

    const { data, error } = await service
      .from("empresas")
      .update(update)
      .eq("id", id)
      .select(
        "id, nombre_empresa, slug, plan, estado_suscripcion, leads_limite_mes, leads_usados_mes",
      )
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
    }

    return NextResponse.json({ empresa: data });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const limited = rateLimitResponse(request, "admin-empresa-delete", 10, 3_600_000);
    if (limited) return limited;

    const { id } = await context.params;
    const service = await createServiceClient();

    await deleteEmpresaCompletely(service, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin delete empresa:", e);
    return NextResponse.json({ error: "No se pudo eliminar la empresa" }, { status: 500 });
  }
}
