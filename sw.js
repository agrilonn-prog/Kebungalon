/* Kebun Galon — service worker. Naikkan nomor VERSI setiap kali index.html diubah agar pengguna dapat banner "Versi baru". */
const VERSI='v1', V='kebun-galon-'+VERSI;
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const CDN=/^https:\/\/(unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('kebun-galon-')&&n!==V).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){ // jaringan dulu (maks 3,5 dtk), jatuh ke cache saat offline/lemot
    const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put('./index.html',cp))}return res});
    const to=new Promise((_,rej)=>setTimeout(rej,3500));
    e.respondWith(Promise.race([net,to]).catch(()=>caches.match('./index.html').then(m=>m||net)));return;}
  if(u.origin===location.origin||CDN.test(r.url)){ // aset: cache dulu, perbarui diam-diam
    e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>{
      const f=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>hit);
      return hit||f;})));}
});
self.addEventListener('message',e=>{const d=e.data||{};
  if(d.type==='SKIP_WAITING')self.skipWaiting();
  if(d.type==='SHOW_REMINDER')self.registration.showNotification(d.title||'Kebun Galon',{body:d.body,tag:d.tag,icon:'./icons/icon-192.png',badge:'./icons/icon-192.png'});});
self.addEventListener('notificationclick',e=>{e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l)if('focus' in c)return c.focus();return self.clients.openWindow('./')}));});
