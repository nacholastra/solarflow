import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
};

async function queryLocalidades(ccaa: string | null) {
  const supabase = await createServiceClient();
  let query = supabase
    .from("localidades")
    .select("id, nombre, slug, provincia, ccaa")
    .eq("activo", true)
    .order("nombre");

  if (ccaa) query = query.eq("ccaa", ccaa);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ccaa = searchParams.get("ccaa");
    const cached = unstable_cache(
      () => queryLocalidades(ccaa),
      ["localidades", ccaa ?? "all"],
      { revalidate: 86_400 },
    );
    const data = await cached();
    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar las localidades" }, { status: 500 });
  }
}
