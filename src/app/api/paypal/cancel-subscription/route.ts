import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { cancelPayPalSubscription } from "@/lib/paypal/client";
import { isSameOrigin } from "@/lib/security/api-origin";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    const limited = rateLimitResponse(request, "paypal-cancel", 5, 3_600_000);
    if (limited) return limited;

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
        { error: "Solo el administrador puede cancelar la suscripción" },
        { status: 403 },
      );
    }

    const service = await createServiceClient();
    const { data: empresa } = await service
      .from("empresas")
      .select("id, paypal_subscription_id, estado_suscripcion")
      .eq("id", equipo.empresa_id)
      .single();

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    if (empresa.paypal_subscription_id) {
      await cancelPayPalSubscription(empresa.paypal_subscription_id);
    }

    // La cuenta vuelve a "sin plan": solo lectura hasta que se reactive.
    const patch: Record<string, unknown> = {
      estado_suscripcion: "cancelled",
      plan: null,
      paypal_subscription_id: null,
      proximo_cobro: null,
    };

    const { error } = await service.from("empresas").update(patch).eq("id", empresa.id);

    if (error) {
      // Fallback si la columna proximo_cobro aún no existe (migración 008 pendiente)
      const { error: err2 } = await service
        .from("empresas")
        .update({
          estado_suscripcion: "cancelled",
          plan: null,
          paypal_subscription_id: null,
        })
        .eq("id", empresa.id);
      if (err2) {
        return NextResponse.json({ error: "No se pudo cancelar la suscripción" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("cancel subscription error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
