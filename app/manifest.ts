import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Divasya — Spiritual Companion",
    short_name: "Divasya",
    description:
      "Panchang, Kundli, AI Jyotishi, Japa and Darshan — your daily Sanatani spiritual companion.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FCF9E8",
    theme_color: "#C88131",
    lang: "en",
    dir: "ltr",
    categories: ["lifestyle", "education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
