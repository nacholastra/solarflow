import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { mapLocalidadRow } from "@/lib/solar/map-localidad";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServiceClient();
    const { data, error } = await supabase.from("localidades").select("*").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(mapLocalidadRow(data as Record<string, unknown>));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
