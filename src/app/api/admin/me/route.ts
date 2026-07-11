import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthenticated } from "@/lib/admin/guard";

export async function GET() {
  try {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ authenticated: false });
    }

    const service = await createServiceClient();
    const { count, error } = await service
      .from("contact_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("gestionado", false);

    if (error) {
      console.error("admin me pending count:", error.message);
      return NextResponse.json({ authenticated: true, pendingInquiries: 0 });
    }

    return NextResponse.json({
      authenticated: true,
      pendingInquiries: count ?? 0,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
