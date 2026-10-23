// Only caches the public page and JavaScript. Never caches API requests or contact information.
const CACHE = 'goessel-bingo-local-first-v2-' + self.registration.scope;
const SHELL = ['index.html', 'app.js'].map(p => new URL(p, self.registration.scope).href);
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))));
self.addEventListener('activate', e => e.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('goessel-bingo-local-first-') && k.endsWith(self.registration.scope) && k !== CACHE).map(k => caches.delete(k)))), self.clients.claim()])));
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET')
        return;
    const u = new URL(e.request.url), scope = new URL(self.registration.scope);
    if (u.origin !== scope.origin)
        return;
    const navigation = e.request.mode === 'navigate' && (u.pathname === scope.pathname || u.pathname === new URL('index.html', scope).pathname), asset = SHELL.includes(u.href);
    if (!navigation && !asset)
        return;
    const key = navigation ? SHELL[0] : u.href;
    e.respondWith(fetch(e.request).then(r => {
        if (r.ok) {
            const copy = r.clone();
            e.waitUntil(caches.open(CACHE).then(c => c.put(key, copy)));
        }
        return r;
    }).catch(() => caches.match(key).then(r => r || Response.error())));
});
