import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/consultorio", "/mi-plan", "/auth", "/documentos-54c0b9e1", "/pagar"] }, sitemap: "https://cecymethod.com/sitemap.xml" };
}
