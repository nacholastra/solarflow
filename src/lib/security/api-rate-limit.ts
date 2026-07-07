import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export function rateLimitResponse(
  request: Request,
  bucket: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`${bucket}:${ip}`, limit, windowMs);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Inténtalo más tarde." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec ?? 60) } },
    );
  }
  return null;
}
