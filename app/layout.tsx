import type { Metadata, Viewport } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-outfit" });
const dmsans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-dmsans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://cecymethod.com"),
  // La tarjeta con foto que sale al compartir el link en WhatsApp, Instagram o Facebook.
  openGraph: { siteName: "Cecy Method", locale: "es_MX", type: "website", images: [{ url: "/cecilia-hero.jpg", alt: "Cecilia Rivera, nutrióloga" }] },
  title: "Cecilia Rivera · Nutrióloga",
  description: "Nutrición basada en tus análisis de sangre, para latinas que viven lejos de casa.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  appleWebApp: { capable: true, title: "Cecy Method", statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: "#1D2849", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${outfit.variable} ${dmsans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
