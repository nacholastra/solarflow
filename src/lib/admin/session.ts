/**
 * Sesión del panel de administración, totalmente independiente de Supabase Auth.
 * Token firmado con HMAC-SHA256 usando Web Crypto (compatible con edge y node).
 */

export const ADMIN_COOKIE = "sf_admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 horas

const encoder = new TextEncoder();

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(value: string): Uint8Array<ArrayBuffer> {
  let s = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  s += "=".repeat(pad);
  const bin = atob(s);
  const arr = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createAdminToken(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_COOKIE_MAX_AGE;
  const payload = base64url(encoder.encode(JSON.stringify({ exp })));
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${base64url(signature)}`;
}

export async function verifyAdminToken(
  token: string | undefined | null,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  try {
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64url(signature),
      encoder.encode(payload),
    );
    if (!valid) return false;

    const decoded = JSON.parse(new TextDecoder().decode(fromBase64url(payload))) as {
      exp?: number;
    };
    return typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
