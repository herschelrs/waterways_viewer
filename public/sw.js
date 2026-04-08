const TILE_DOMAINS = [
    'tiles.openfreemap.org',
    'basemap.nationalmap.gov',
    'hydro.nationalmap.gov',
    'gis.blm.gov',
    's3.amazonaws.com',
    'elevation-tiles-prod'
];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
    const url = e.request.url;
    if (!TILE_DOMAINS.some(d => url.includes(d))) return;

    e.respondWith(
        caches.open('tiles-v1').then(cache =>
            cache.match(e.request).then(cached => {
                if (cached) {
                    self.clients.matchAll().then(clients =>
                        clients.forEach(c => c.postMessage({ type: 'cache-hit', url }))
                    );
                    return cached;
                }
                return fetch(e.request).then(resp => {
                    if (resp.ok) {
                        cache.put(e.request, resp.clone());
                        self.clients.matchAll().then(clients =>
                            clients.forEach(c => c.postMessage({ type: 'cache-store', url }))
                        );
                    }
                    return resp;
                });
            })
        )
    );
});
