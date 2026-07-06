/** Hosts permitidos para webhooks salientes (Zapier, Make, etc.) */
const ALLOWED_HOSTS = new Set([
  "hooks.zapier.com",
  "hooks.zapier.com.",
  "hook.eu1.make.com",
  "hook.eu2.make.com",
  "hook.us1.make.com",
  "hook.us2.make.com",
  "hook.integromat.com",
]);

const DEV_ALLOWED_HOSTS = new Set(["webhook.site", "webhook.cool"]);

export function isAllowedWebhookUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "https:") return false;
    if (url.username || url.password) return false;

    const host = url.hostname.toLowerCase();
    if (ALLOWED_HOSTS.has(host)) return true;

    if (process.env.NODE_ENV !== "production" && DEV_ALLOWED_HOSTS.has(host)) {
      return true;
    }

    // Subdominios de Make (hook*.make.com)
    if (host.endsWith(".make.com") && host.startsWith("hook")) return true;

    return false;
  } catch {
    return false;
  }
}

export function webhookUrlErrorMessage(): string {
  return "URL no permitida. Usa un webhook de Zapier, Make u otro servicio compatible (HTTPS).";
}
