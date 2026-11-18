const CACHE='manas-news24-launch-v38';
const CACHE_PREFIX='manas-news24-';
const ASSETS=['./','./index.html','./notify.html','./admin.html','./smart-pagemaker.html','./social-poster.html','./reader-submit.html','./media-lab.html','./local-news.html','./operations-center.html','./news-pipeline.html','./daily-edition.html','./news-sources.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const routeKey=url=>{const p=new URL(url).pathname;const file=p.split('/').pop();return file||'index.html'};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./'+routeKey(req.url),copy)))}return res}).catch(()=>caches.match('./'+routeKey(req.url)).then(hit=>hit||caches.match('./index.html').then(home=>home||new Response('इंटरनेट कनेक्शन उपलब्ध नहीं है।',{headers:{'Content-Type':'text/plain; charset=utf-8'}})))));return}
 event.respondWith(fetch(req).catch(()=>caches.match(req)))
});
self.addEventListener('push',event=>{let data={};try{data=event.data?event.data.json():{body:event.data?.text()||''}}catch(_){data={body:event.data?.text()||''}}const title=data.title||'मानस न्यूज-24';const options={body:data.body||'नई खबर पढ़ने के लिए टैप करें।',icon:data.icon||'./icon-192.png',badge:data.badge||'./icon-192.png',image:data.image||undefined,data:{url:data.url||'https://manasnews.blogspot.com/'},tag:data.tag||'manas-news24-news',renotify:false,vibrate:[120,60,120]};event.waitUntil(self.registration.showNotification(title,options))});
self.addEventListener('notificationclick',event=>{event.notification.close();const target=event.notification.data?.url||'https://manasnews.blogspot.com/';event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const client of list){if('focus'in client){client.navigate(target);return client.focus()}}return self.clients.openWindow(target)}))});
