/* Service worker: lets the store open fast and work offline for pages you've already seen */
const V = 'ap-store-v1';
const SHELL = ['./', 'index.html', 'css/theme.css', 'css/layout.css', 'css/components.css',
  'js/config.js', 'js/utils.js', 'js/demo.js', 'js/data.js', 'js/components.js', 'js/install.js', 'js/pages.js', 'js/main.js',
  'assets/logo.png', 'assets/icon-192.png', 'manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
