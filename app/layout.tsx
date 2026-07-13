import type { Metadata, Viewport } from "next";
import { Marcellus, Noto_Serif, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/pwa-register";

// Brand type system: lapidary serif display + serif body, Noto Serif
// Devanagari for regional script (per brand guidelines).
const marcellus = Marcellus({ variable: "--font-marcellus", subsets: ["latin"], weight: "400" });
const notoSerif = Noto_Serif({
  variable: "--font-serif-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const notoDeva = Noto_Serif_Devanagari({
  variable: "--font-deva-serif",
  subsets: ["devanagari"],
  weight: ["400", "500"],
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
  themeColor: "#C88131",
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
      className={`${marcellus.variable} ${notoSerif.variable} ${notoDeva.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div id="app-root">{children}</div>
        <PWARegister />
      </body>
    </html>
  );
}
