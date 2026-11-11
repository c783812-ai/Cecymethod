// Recordatorios de Cecy Method: muestra la notificación y abre la app al tocarla.
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch {}
  e.waitUntil(self.registration.showNotification(d.title || "Cecy Method", {
    body: d.body || "Recuerda llenar tu registro de hoy 💛",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: d.url || "/mi-plan" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/mi-plan";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((ws) => {
    for (const w of ws) if (w.url.includes("/mi-plan") && "focus" in w) return w.focus();
    return clients.openWindow(url);
  }));
});

// Sin internet: guarda la última versión de su app (/mi-plan) y los archivos que usa, para que se abra igual.
const PAGINAS = "paginas-v1";
const ARCHIVOS = "archivos-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => ![PAGINAS, ARCHIVOS].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  // Al salir de su cuenta se borra lo guardado, por si el teléfono es compartido.
  if (r.method === "POST" && u.pathname === "/salir") { e.waitUntil(caches.delete(PAGINAS)); return; }
  if (r.method !== "GET") return;
  if (r.mode === "navigate" && u.pathname === "/mi-plan" && !u.search) {
    // Primero internet; si no hay, lo último que vio.
    e.respondWith(fetch(r).then((res) => {
      if (res.ok && !res.redirected) { const c = res.clone(); caches.open(PAGINAS).then((x) => x.put("/mi-plan", c)); }
      return res;
    }).catch(() => caches.match("/mi-plan").then((c) => c || Response.error())));
    return;
  }
  const estatico = u.pathname.startsWith("/_next/static/") || u.pathname.startsWith("/alimentos/") || /\.(png|webp|jpg|svg|woff2?)$/.test(u.pathname);
  if (estatico) {
    // Lo guardado al instante y se actualiza en segundo plano.
    e.respondWith(caches.open(ARCHIVOS).then((x) => x.match(r).then((c) => {
      const red = fetch(r).then((res) => { if (res.ok) x.put(r, res.clone()); return res; }).catch(() => c);
      return c || red;
    })));
  }
});
