import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";

const LEGAL_PATHS = [
  "/privacidad",
  "/terminos",
  "/aviso-legal",
  "/cookies",
  "/dpa",
  "/ayuda",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    ...LEGAL_PATHS.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "/ayuda" ? 0.7 : 0.5,
    })),
  ];

  return staticPages;
}
