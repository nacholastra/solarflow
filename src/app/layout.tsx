import type { Metadata } from "next";
import { BRAND } from "@/lib/config/brand";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
