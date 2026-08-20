import type { CapacitorConfig } from "@capacitor/cli";

// The Android shell for the live web app. Remote-URL mode: the WebView loads
// production Vercel directly, so every web deploy reaches the app instantly —
// the same always-fresh property the old TWA had — while the Capacitor bridge
// adds what a TWA never could: native plugins. SocialLogin drives Google's
// on-device account sheet, which is what removes the browser from sign-in
// (the bridge for it lives in lib/db.ts signInGoogle).
//
// appId must stay life.divasya.app forever: it is the live Play Store listing,
// and with the original keystore this ships as a normal update.
const config: CapacitorConfig = {
  appId: "life.divasya.app",
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
