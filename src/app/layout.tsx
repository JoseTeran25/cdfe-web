import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CdFe App — Comunidad de Fe Sur",
    template: "%s | CdFe App",
  },
  description:
    "Plataforma de gestión para el ministerio de alabanza de la iglesia Comunidad de Fe Sur.",
  keywords: ["ministerio", "alabanza", "iglesia", "música", "setlist"],
  authors: [{ name: "Comunidad de Fe Sur" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-surface text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
