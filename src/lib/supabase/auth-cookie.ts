import type { NextRequest } from "next/server";

/** Indica si hay cookie de sesión Supabase sin llamar a la API de auth. */
export function hasSupabaseAuthCookie(request: NextRequest): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (projectRef && request.cookies.get(`sb-${projectRef}-auth-token`)?.value) {
    return true;
  }
  return request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
}
