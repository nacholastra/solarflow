import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin } from "@/lib/security/api-origin";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/session";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // El panel de administración es totalmente independiente de Supabase Auth.
  const adminResponse = await handleAdminRoutes(request, pathname);
  if (adminResponse) return adminResponse;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/verify-email");
  const isDashboard = pathname.startsWith("/dashboard");
  const isProtectedApi =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/auth/register") &&
    !pathname.startsWith("/api/auth/resend-confirmation") &&
    !pathname.startsWith("/api/invite/") &&
    !pathname.startsWith("/api/leads") &&
    !pathname.startsWith("/api/localidades") &&
    !pathname.startsWith("/api/paypal/webhook");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (isDashboard || isProtectedApi) {
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

    if (!user && isDashboard) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && !user.email_confirmed_at && isDashboard) {
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
    if (isDashboard || isProtectedApi) {
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

/**
 * Protege el panel /admin y /api/admin con su propia sesión (cookie firmada),
 * sin ninguna relación con el login principal de empresas.
 * Devuelve una respuesta si la ruta es del admin; null en caso contrario.
 */
async function handleAdminRoutes(
  request: NextRequest,
  pathname: string,
): Promise<NextResponse | null> {
  const isAdminAuthApi = pathname === "/api/admin/login" || pathname === "/api/admin/logout";
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin");

  if (!isAdminApi && !isAdminPage) return null;

  // Login/logout gestionan la cookie ellos mismos.
  if (isAdminAuthApi) return NextResponse.next({ request });

  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authed = secret ? await verifyAdminToken(token, secret) : false;

  if (isAdminApi) {
    if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    return NextResponse.next({ request });
  }

  if (isAdminLogin) {
    if (authed) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  // Resto de /admin
  if (!authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next({ request });
}
