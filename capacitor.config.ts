import type { CapacitorConfig } from "@capacitor/cli";

// The Android shell for the live web app. Remote-URL mode: the WebView loads
// production Vercel directly, so every web deploy reaches the app instantly —
// the same always-fresh property the old TWA had — while the Capacitor bridge
// adds what a TWA never could: native plugins. SocialLogin drives Google's
// on-device account sheet, which is what removes the browser from sign-in
// (the bridge for it lives in lib/db.ts signInGoogle).
//
// appId must stay com.sanatanivibes.astro_app forever: the client's live Play
// Store listing carries that package name (their original app), and Divasya
// ships as an update to it. The internal Android namespace remains
// life.divasya.app so no source moves; only the applicationId differs.
const config: CapacitorConfig = {
  appId: "com.sanatanivibes.astro_app",
  appName: "Divasya",
  webDir: "public",
  server: {
    url: "https://divasya-seven.vercel.app",
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
