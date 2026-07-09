import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/config/site";
import { safeRedirectPath } from "@/lib/security/safe-redirect";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const origin = getSiteUrl();

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("auth callback error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const safeNext = safeRedirectPath(next, "/dashboard");
  return NextResponse.redirect(`${origin}${safeNext}`);
}
