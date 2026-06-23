import type { Metadata } from "next";
import { Inter, Marcellus, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
});
const tiro = Tiro_Devanagari_Hindi({
  variable: "--font-tiro",
  subsets: ["devanagari"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Divasya — Your Spiritual Companion",
  description:
    "AI Jyotishi, deity companion, mala counter, virtual temple and astrologer consults — a Sanatani-first experience.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${marcellus.variable} ${tiro.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
