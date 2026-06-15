// Lexio service worker — app-shell + runtime caching so the app loads offline.
// Hand-rolled (bundler-agnostic). All user data already lives in IndexedDB; this
// only caches the static shell and assets.

const VERSION = "lexio-v3";
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
// "/" is the marketing landing page; "/dashboard" is the app entry (PWA
// start_url). Precache the core routes so first load and the offline fallback
// work. (/discover still needs the network for /api/word-sets data.)
const APP_SHELL = [
  "/",
  "/dashboard",
  "/discover",
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache AI generation or other API calls.
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: network-first, fall back to cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          // Fall back to the app shell for app routes, else the landing page.
          const isAppRoute = url.pathname !== "/";
          const fallback = isAppRoute
            ? (await caches.match("/dashboard")) || (await caches.match("/"))
            : await caches.match("/");
          return fallback || Response.error();
        }),
    );
    return;
  }

  // Static assets (Next chunks, icons, fonts): stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
