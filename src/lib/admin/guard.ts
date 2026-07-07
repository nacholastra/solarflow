import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "./session";

/** True si la petición tiene una cookie de sesión admin válida. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value, secret);
}
