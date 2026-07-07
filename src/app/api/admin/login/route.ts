import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/security/api-origin";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  createAdminToken,
} from "@/lib/admin/session";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = new TextEncoder().encode(a);
  const bufB = new TextEncoder().encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) diff |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
  return diff === 0;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const limited = rateLimitResponse(request, "admin-login", 10, 300_000);
  if (limited) return limited;

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!username || !password || !secret) {
    return NextResponse.json({ error: "Panel de administración no configurado" }, { status: 503 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const okUser = timingSafeEqual(body.username, username);
  const okPass = timingSafeEqual(body.password, password);
  if (!okUser || !okPass) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const token = await createAdminToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
