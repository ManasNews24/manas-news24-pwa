const CACHE='manas-news24-launch-v6';
const CACHE_PREFIX='manas-news24-';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(
  keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key))
 )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./index.html',copy)));}
   return response;
  }).catch(()=>caches.match('./index.html').then(cached=>cached||new Response('इंटरनेट कनेक्शन उपलब्ध नहीं है। कृपया इंटरनेट चालू करके मानस न्यूज-24 खोलें।',{headers:{'Content-Type':'text/plain; charset=utf-8'}}))));
  return;
 }
 event.respondWith(fetch(request).catch(()=>caches.match(request)));
});
