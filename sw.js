// Минимальный service worker: нужен, чтобы Chrome на Android предложил «Установить приложение». Ничего не кэширует.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
