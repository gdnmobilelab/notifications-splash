import analytics from 'google-analytics-protocol';

self.addEventListener('activate', function(event) {
    console.info("Activating version " + VERSION);
    event.waitUntil(
        analytics({
            t: 'event',
            ec: 'activate',
            el: VERSION
        })
        .then(() => {
            return self.clients.claim();
        })
    );
});

self.addEventListener('install', function(event) {
    console.info("Installing version " + VERSION);
    event.waitUntil(
        analytics({
            t: 'event',
            ec: 'install',
            el: VERSION
        })
        .then(() => {
            return self.skipWaiting();
        })
    );
})