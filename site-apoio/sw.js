/* Gestão Mafra — service worker (REDE PRIMEIRO)
   Objetivo: permitir que o app reabra mesmo SEM internet (ex.: a câmera do
   Android recarregou a página no meio de uma vistoria em campo).
   Estratégia: sempre tenta a REDE primeiro — assim, com internet, o deploy
   novo é carregado na hora e nada fica "preso" em versão antiga. O cache só
   entra como socorro quando a rede falha. */
const CACHE = "mafra-shell-v2";

self.addEventListener("install", function () { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil((async function () {
    const ks = await caches.keys();
    await Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", function (e) {
  const req = e.request;
  if (req.method !== "GET") return;                       // só leitura
  let url; try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;        // só os nossos arquivos
  if (url.search.indexOf("ping=") >= 0) return;           // teste de conexão real: nunca usar cache

  e.respondWith((async function () {
    try {
      const resp = await fetch(req);                      // REDE PRIMEIRO
      if (resp && resp.ok) {
        try { const c = await caches.open(CACHE); c.put(req, resp.clone()); } catch (_) {}
      }
      return resp;
    } catch (err) {
      const c = await caches.open(CACHE);
      const hit = await c.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === "navigate") {
        const idx = (await c.match("/")) || (await c.match("/index.html")) || (await c.match(self.registration.scope));
        if (idx) return idx;
      }
      throw err;
    }
  })());
});
