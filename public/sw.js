importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js',
);

if (workbox) {
  console.log('Workbox is loaded.');

  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
  workbox.precaching.cleanupOutdatedCaches();

  // ✅ Cache Static Assets
  workbox.routing.registerRoute(
    /\.(?:js|css|woff2|png|jpg|jpeg|gif|svg|ico|webp)$/i,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-assets',
    }),
  );

  // ✅ Cache API Requests
  workbox.routing.registerRoute(
    /^https:\/\/example-api\.com\/.*/,
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
    }),
  );

  // ✅ Activate Service Worker Immediately
  self.addEventListener('activate', (event) => {
    console.log('Service Worker Activated');
    event.waitUntil(self.clients.claim());
  });
} else {
  console.error('Workbox failed to load.');
}
