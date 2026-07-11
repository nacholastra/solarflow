import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthenticated } from "@/lib/admin/guard";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const service = await createServiceClient();
    const { data, error } = await service
      .from("contact_inquiries")
      .select("id, nombre, email, empresa, telefono, mensaje, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("admin contact inquiries:", error.message);
      return NextResponse.json({ error: "No se pudieron cargar las consultas" }, { status: 500 });
    }

    return NextResponse.json({ inquiries: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
