// Rock Rush – gjør at spillet virker uten nett
const CACHE='rock-rush-v1';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-180.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // Selve spillet: prøv nettet først (så du får nye versjoner), ellers bruk lagret kopi
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r})
      .catch(()=>caches.match('./index.html')));
    return;
  }
  // Alt annet (ikoner, skrift): bruk lagret kopi, ellers hent og lagre
  e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{
    if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}
    return r;
  })));
});
