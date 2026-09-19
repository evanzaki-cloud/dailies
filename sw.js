// Offline support. On install, cache the app shell plus the hashed JS bundle
// referenced by index.html, so the app works offline from the very first
// visit (not just the second). Bump CACHE when shipping a new build.
const CACHE = "routine-v2";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    try {
      const html = await (await cache.match("./index.html")).text();
      const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1]);
      if (assets.length) await cache.addAll(assets);
    } catch (err) {
      // The bundle will still be cached on its first fetch below.
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  const put = async (r) => {
    if (r && r.ok) {
      const c = await caches.open(CACHE);
      c.put(req, r.clone());
    }
    return r;
  };

  if (req.mode === "navigate") {
    // Network first so updates arrive, but give up after 3 s (bad signal)
    // and serve the cached shell. Offline fails instantly and does the same.
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000));
    e.respondWith(
      Promise.race([fetch(req).then(put), timeout]).catch(async () =>
        (await caches.match(req)) || (await caches.match("./index.html")) || (await caches.match("./"))
      )
    );
    return;
  }

  // Assets: cache first, fetch and store on a miss.
  e.respondWith(caches.match(req).then((cached) => cached || fetch(req).then(put)));
});
