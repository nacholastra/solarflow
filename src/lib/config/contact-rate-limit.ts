/** Límites del formulario de contacto público (anti-spam sin bloquear pruebas legítimas). */
export const CONTACT_FORM_RATE_LIMIT = {
  /** Por IP: evita floods automatizados. */
  perIp: { limit: 20, windowMs: 3_600_000 },
  /** Por correo: evita repetición del mismo remitente. */
  perEmail: { limit: 10, windowMs: 3_600_000 },
} as const;

export function formatRetryAfterMessage(retryAfterSec?: number): string {
  if (!retryAfterSec || retryAfterSec <= 0) {
    return "Has enviado varios mensajes recientemente. Espera un momento e inténtalo de nuevo.";
  }
  const minutes = Math.ceil(retryAfterSec / 60);
  if (minutes <= 1) {
    return "Has enviado varios mensajes recientemente. Inténtalo de nuevo en un minuto.";
  }
  return `Has enviado varios mensajes recientemente. Inténtalo de nuevo en ${minutes} minutos.`;
}
