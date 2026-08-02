import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/pwa-register";

// Type system: Inter at two weights only — 400 everywhere, 500 reserved for
// titles and the few labels that must hold rank. Loading just these two makes
// the rule structural: there is no 600/700 to fall back on.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Devanagari runs (shlokas, mantras, the tagline) need their own face — Inter
// has no Devanagari glyphs. Noto Sans Devanagari is the sans companion, so
// script and Latin sit on the same axis instead of clashing serif against sans.
const notoDeva = Noto_Sans_Devanagari({
  variable: "--font-deva",
  subsets: ["devanagari"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Divasya — Your Spiritual Companion",
  description:
    "Panchang, Kundli, AI Jyotishi, Japa and Darshan — daily guidance rooted in Indian wisdom for a more aware, balanced life.",
  applicationName: "Divasya",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Divasya" },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F26B0F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoDeva.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div id="app-root">{children}</div>
        <PWARegister />
      </body>
    </html>
  );
}
