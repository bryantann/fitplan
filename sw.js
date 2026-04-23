const CACHE = 'fitplan-v2';
const ASSETS = [
  '/fitplan/',
  '/fitplan/index.html',
  '/fitplan/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // addAll fails if any request fails — use individual adds instead
      Promise.allSettled(ASSETS.map(url =>
        fetch(url).then(res => {
          if (res.ok) return c.put(url, res);
        }).catch(() => {}) // silently skip missing files
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Don't intercept Supabase or API calls — let them go direct
  var url = e.request.url;
  if (url.includes('supabase.co') || url.includes('googleapis.com') || url.includes('anthropic.com')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
