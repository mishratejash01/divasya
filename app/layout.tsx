import type { Metadata, Viewport } from "next";
import { Poppins, Mukta, Marcellus } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/pwa-register";

// Body / UI — Poppins: geometric-humanist, rounded and friendly, matching the
// reference app's body type.
const poppins = Poppins({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Devanagari runs (shlokas, mantras, deity names) — Mukta reads cleanly and
// pairs well with the Latin body.
const mukta = Mukta({
  variable: "--font-deva",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Headings — Marcellus: an elegant roman/inscriptional serif with a temple feel,
// used for every title and ceremonial accent.
const marcellus = Marcellus({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
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
      className={`${poppins.variable} ${mukta.variable} ${marcellus.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div id="app-root">{children}</div>
        <PWARegister />
      </body>
    </html>
  );
}
