const C = 'isekai-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.pathname.endsWith('version.json') || u.hostname.endsWith('supabase.co')) return;
  const cdn = u.hostname.includes('cdnjs') || u.hostname.includes('jsdelivr');
  if (cdn) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const cp = res.clone();
      caches.open(C).then(c => c.put(e.request, cp));
      return res;
    })));
    return;
  }
  e.respondWith(
    fetch(e.request).then(res => {
      const cp = res.clone();
      caches.open(C).then(c => c.put(e.request, cp));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
