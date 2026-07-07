import { getSiteUrl } from "@/lib/config/site";

/** Comprueba que la petición mutante provenga del mismo origen de la app. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  let allowedOrigin: string;
  try {
    allowedOrigin = new URL(getSiteUrl()).origin;
  } catch {
    return process.env.NODE_ENV !== "production";
  }

  if (origin) return origin === allowedOrigin;

  if (referer) {
    try {
      return new URL(referer).origin === allowedOrigin;
    } catch {
      return false;
    }
  }

  return process.env.NODE_ENV !== "production";
}
