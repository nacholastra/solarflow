import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin } from "@/lib/security/api-origin";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/verify-email");
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminArea = pathname.startsWith("/admin");
  const isProtectedApi =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/register") &&
    !pathname.startsWith("/api/auth/resend-confirmation") &&
    !pathname.startsWith("/api/invite/") &&
    !pathname.startsWith("/api/leads") &&
    !pathname.startsWith("/api/localidades") &&
    !pathname.startsWith("/api/paypal/webhook");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (isDashboard || isAdminArea || isProtectedApi) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && (isDashboard || isAdminArea)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      if (isAdminArea) url.searchParams.set("next", "/admin");
      return NextResponse.redirect(url);
    }

    if (user && !user.email_confirmed_at && (isDashboard || isAdminArea)) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-email";
      url.searchParams.set("email", user.email ?? "");
      return NextResponse.redirect(url);
    }

    if (user && isAuthPage && !pathname.startsWith("/invite") && !pathname.startsWith("/verify-email")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (!user && isProtectedApi) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (user && isProtectedApi && MUTATING_METHODS.has(request.method) && !isSameOrigin(request)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    return supabaseResponse;
  } catch (e) {
    console.error("Middleware error:", e);
    if (isDashboard || isAdminArea || isProtectedApi) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }
}
