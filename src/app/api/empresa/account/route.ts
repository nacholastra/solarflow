import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { deleteEmpresaCompletely } from "@/lib/empresa/delete-empresa";
import { isSameOrigin } from "@/lib/security/api-origin";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";
import { z } from "zod";

const schema = z.object({
  confirmacion: z.string().min(1),
});

export async function DELETE(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    const limited = rateLimitResponse(request, "empresa-delete-account", 3, 3_600_000);
    if (limited) return limited;

    const body = schema.parse(await request.json());

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: equipo } = await supabase
      .from("equipo")
      .select("empresa_id, rol")
      .eq("usuario_id", user.id)
      .single();

    if (!equipo || equipo.rol !== "admin") {
      return NextResponse.json(
        { error: "Solo el administrador puede eliminar la cuenta de la empresa" },
        { status: 403 },
      );
    }

    const service = await createServiceClient();
    const { data: empresa } = await service
      .from("empresas")
      .select("id, nombre_empresa")
      .eq("id", equipo.empresa_id)
      .single();

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    if (body.confirmacion.trim() !== empresa.nombre_empresa.trim()) {
      return NextResponse.json(
        { error: "El nombre de confirmación no coincide con el de tu empresa" },
        { status: 400 },
      );
    }

    await deleteEmpresaCompletely(service, empresa.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Confirmación requerida" }, { status: 400 });
    }
    console.error("delete account error:", e);
    return NextResponse.json({ error: "No se pudo eliminar la cuenta" }, { status: 500 });
  }
}
