/** URL pública del sitio (Vercel). Usada para SEO, sitemap y Open Graph. */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  return "https://solarflow-kappa.vercel.app";
}
