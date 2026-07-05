import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/widget/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
