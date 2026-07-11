import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthenticated } from "@/lib/admin/guard";

const patchSchema = z.object({
  gestionado: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const service = await createServiceClient();
    const { data, error } = await service
      .from("contact_inquiries")
      .update({ gestionado: parsed.data.gestionado })
      .eq("id", id)
      .select("id, gestionado")
      .maybeSingle();

    if (error) {
      console.error("admin contact inquiry patch:", error.message);
      return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ inquiry: data });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
