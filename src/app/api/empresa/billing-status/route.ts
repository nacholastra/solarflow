import { NextResponse } from "next/server";
import { getBillingStatus } from "@/lib/dashboard/billing-status";
import { getDashboardContext } from "@/lib/dashboard/session";

export async function GET() {
  try {
    const context = await getDashboardContext();
    if (!context) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const status = await getBillingStatus(context.empresaId);
    if (!status) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ...status, rol: context.rol });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
