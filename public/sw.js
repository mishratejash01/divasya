// Divasya service worker.
// Contract: the app must keep working partially offline, and a deploy must
// keep landing instantly. Those pull opposite ways, so the split is strict:
//   - navigations (HTML) are ALWAYS network-first — nobody gets pinned to an
//     old build; the cached shell only ever serves when the network fails
//   - /_next/static/* is cache-first — content-hashed, immutable by design
//   - images (our Cloudinary, YouTube thumbs, public/ art) are cache-first
//     with an entry cap, so once seen they work offline
//   - EVERYTHING else is untouched: non-GET, /api/*, Supabase, Razorpay,
//     Google, Gemini — the worker never sees money, auth, or live data
const VERSION = "v3";
const SHELL = `divasya-shell-${VERSION}`;
const ASSETS = `divasya-assets-${VERSION}`;
const IMAGES = `divasya-images-${VERSION}`;
const KEEP = [SHELL, ASSETS, IMAGES];

// cross-origin hosts we cache — image delivery only, nothing interactive
const IMAGE_HOSTS = ["res.cloudinary.com", "i.ytimg.com"];

// generous caps: a full browse of the app stays under them, and trimming
// oldest-first means a chunk the cached shell needs is the last to go
const MAX_ASSETS = 300;
const MAX_IMAGES = 250;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(SHELL).then((c) => c.add("/").catch(() => {})));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

async function trim(cacheName, max) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
  } catch { /* trimming is best-effort */ }
}

// cache-first: for immutable/static things. Opaque responses (no-cors image
// loads) are cacheable; anything else must be a real 200.
async function cacheFirst(event, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);
  if (hit) return hit;
  const res = await fetch(event.request);
  if (res && (res.ok || res.type === "opaque")) {
    await cache.put(event.request, res.clone()).catch(() => {});
    event.waitUntil(trim(cacheName, max));
  }
  return res;
}

// stale-while-revalidate: for public/ art that changes rarely — serve the
// copy we have, refresh it in the background so the next view is current.
async function staleWhileRevalidate(event, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);
  const refresh = fetch(event.request)
    .then(async (res) => {
      if (res && (res.ok || res.type === "opaque")) {
        await cache.put(event.request, res.clone()).catch(() => {});
        event.waitUntil(trim(cacheName, max));
      }
      return res;
    })
    .catch(() => null);
  if (hit) {
    event.waitUntil(refresh);
    return hit;
  }
  const res = await refresh;
  if (res) return res;
  return Response.error();
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // never intercept POST (payments/chat/auth)
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return;

  // ---- cross-origin: only our image hosts, only actual image loads.
  // Supabase, Razorpay, Google, YouTube embeds pass straight through.
  if (url.origin !== self.location.origin) {
    if (IMAGE_HOSTS.includes(url.hostname) && req.destination === "image") {
      event.respondWith(cacheFirst(event, IMAGES, MAX_IMAGES));
    }
    return;
  }

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
            caches.open(SHELL).then((c) => c.put("/", copy)).catch(() => {});
          }
          return res;
        })
        .catch(async () => (await caches.match("/", { ignoreSearch: true })) || Response.error())
    );
    return;
  }

  // Hashed build output: immutable, so cache-first is exactly right, and the
  // chunks the offline shell needs are guaranteed to be here once it ran once.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event, ASSETS, MAX_ASSETS));
    return;
  }

  // Our own static art and fonts (public/): brand marks, deity art, library
  // photos, gita.json. Refreshed in the background, served instantly.
  const staticish =
    req.destination === "image" || req.destination === "font" || req.destination === "manifest" ||
    /\.(png|jpe?g|webp|gif|svg|ico|json|woff2?|ttf)$/.test(url.pathname);
  if (staticish) {
    event.respondWith(staleWhileRevalidate(event, ASSETS, MAX_ASSETS));
    return;
  }
  // Anything else same-origin (RSC payloads, dynamic fetches): untouched.
});
