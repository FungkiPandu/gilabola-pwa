importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

const urlsToCache = [
    "/",
    { url: '/index.html', revision: '1' },
    { url: '/manifest.json', revision: '1' },
    { url: '/icon_512.png', revision: '1' },
    { url: '/navigation.html', revision: '1' },
    { url: '/assets/css/main.css', revision: '1' },
    { url: '/assets/css/materialize.min.css', revision: '1' },
    { url: '/assets/js/module/jquery-3.4.1.min.js', revision: '1' },
    { url: '/assets/js/module/materialize.min.js', revision: '1' },
    { url: '/assets/js/module/idb.js', revision: '1' },
    { url: '/assets/js/nav.js', revision: '2' },
    { url: '/assets/js/main.js', revision: '2' },
    { url: '/assets/js/api.js', revision: '3' },
    { url: '/assets/js/db.js', revision: '1' },
    { url: '/assets/images/gbk.jpg', revision: '1' },
];

workbox.precaching.precacheAndRoute(urlsToCache);

const apiBaseUrl = "https://api.football-data.org";

workbox.routing.registerRoute(
    new RegExp(apiBaseUrl),
    new workbox.strategies.CacheFirst({
        cacheName: 'api-cache',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200],
            }),
        ],
    })
);

workbox.routing.registerRoute(
    // Cache image files.
    /\.(?:png|jpg|jpeg|svg|gif)$/,
    new workbox.strategies.CacheFirst({
        cacheName: 'image-cache',
    })
);

self.addEventListener('push', function (event) {
    let body;
    if (event.data) {
        body = event.data.text();
    } else {
        body = 'Push message no payload';
    }
    let options = {
        body: body,
        icon: 'assets/icon_512.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    event.waitUntil(
        self.registration.showNotification('Push Notification', options)
    );
});
