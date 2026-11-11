import type { MetadataRoute } from "next";
import { GUIAS } from "@/lib/guiasCatalogo";

const S = "https://cecymethod.com";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: S, priority: 1 },
    { url: `${S}/empezar`, priority: 0.8 },
    { url: `${S}/guias`, priority: 0.8 },
    ...GUIAS.map((g) => ({ url: `${S}/guias/${g.id}`, priority: 0.6 })),
    { url: `${S}/suplementos`, priority: 0.5 },
    { url: `${S}/privacidad`, priority: 0.2 },
  ];
}
