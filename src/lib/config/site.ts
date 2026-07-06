/** URL pública del sitio (Vercel). Usada para SEO, sitemap y PayPal. */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configured && !isLocalhost(configured)) {
    return ensureHttps(configured);
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) {
    return ensureHttps(vercelProd);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "")}`;
  }

  return "https://solarflow-kappa.vercel.app";
}

function isLocalhost(url: string): boolean {
  try {
    const withProtocol = url.startsWith("http") ? url : `https://${url}`;
    const host = new URL(withProtocol).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

function ensureHttps(url: string): string {
  const clean = url.replace(/\/$/, "");
  if (clean.startsWith("https://")) return clean;
  if (clean.startsWith("http://")) return `https://${clean.slice(7)}`;
  return `https://${clean}`;
}
