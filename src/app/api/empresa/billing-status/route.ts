import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
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

    if (!equipo) {
      return NextResponse.json({ error: "Sin empresa" }, { status: 404 });
    }

    const { data: empresa } = await supabase
      .from("empresas")
      .select("estado_suscripcion, plan")
      .eq("id", equipo.empresa_id)
      .single();

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    // proximo_cobro puede no existir si la migración 008 no se ha aplicado aún.
    let proximoCobro: string | null = null;
    const { data: cobroRow } = await supabase
      .from("empresas")
      .select("proximo_cobro")
      .eq("id", equipo.empresa_id)
      .single();
    proximoCobro = cobroRow?.proximo_cobro ?? null;

    let diasRestantes: number | null = null;
    if (proximoCobro) {
      const ms = new Date(proximoCobro).getTime() - Date.now();
      diasRestantes = Math.ceil(ms / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      estado: empresa.estado_suscripcion,
      plan: empresa.plan,
      proximoCobro,
      diasRestantes,
      rol: equipo.rol,
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
