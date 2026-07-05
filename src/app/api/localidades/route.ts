import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ccaa = searchParams.get("ccaa");

    const supabase = await createServiceClient();
    let query = supabase
      .from("localidades")
      .select("id, nombre, slug, provincia, ccaa")
      .eq("activo", true)
      .order("nombre");

    if (ccaa) query = query.eq("ccaa", ccaa);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
