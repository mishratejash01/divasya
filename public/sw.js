// Minimal, safe service worker for Divasya.
// Purpose: make the app installable (PWA / Play TWA) + a graceful offline shell.
// It never touches API/auth or POST requests, and is network-first for pages.
const CACHE = "divasya-shell-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.add("/").catch(() => {})));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // never intercept POST (chat/auth/events)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // same-origin only
  if (url.pathname.startsWith("/api/")) return; // never cache API/auth
  // Network-first for page navigations; fall back to the cached shell offline.
  // Every successful navigation refreshes that shell. Without this the shell
  // is whatever was cached at install time, and after a deploy it points at
  // hashed chunks that no longer exist — an offline visit then renders a blank
  // page instead of the offline app.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put("/", copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match("/", { ignoreSearch: true }))
    );
  }
});
