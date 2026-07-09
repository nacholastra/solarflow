import { createHash } from "crypto";

/** Hash irreversible de IP para trazabilidad anti-abuso (RGPD). */
export function hashClientIp(ip: string): string | null {
  if (!ip || ip === "unknown") return null;
  const salt = process.env.LEAD_IP_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!salt) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
