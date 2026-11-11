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
