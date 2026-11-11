"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const bytes = (b64: string) => {
  const s = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};
const esIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/** Activar o quitar el recordatorio diario de las 8 p.m. para llenar el registro. */
export default function Recordatorio({ pid, clave }: { pid: string; clave: string | null }) {
  const [estado, setEstado] = useState<"" | "no" | "iphone" | "bloqueado" | "activo" | "inactivo" | "trabajando" | "error">("");
  useEffect(() => {
    if (!clave) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) { setEstado(esIphone() ? "iphone" : "no"); return; }
    if (Notification.permission === "denied") { setEstado("bloqueado"); return; }
    navigator.serviceWorker.getRegistration("/").then(async (reg) => {
      const sub = await reg?.pushManager.getSubscription();
      if (sub) { guardar(sub); setEstado("activo"); } else setEstado("inactivo");
    }).catch(() => setEstado("inactivo"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  const guardar = (sub: PushSubscription) =>
    supabaseBrowser().from("push_subs").upsert({ endpoint: sub.endpoint, patient_id: pid, sub: sub.toJSON(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone });

  const activar = async () => {
    setEstado("trabajando");
    try {
      if ((await Notification.requestPermission()) !== "granted") { setEstado("bloqueado"); return; }
      await navigator.serviceWorker.register("/sw.js");
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes(clave!) }));
      const { error } = await guardar(sub);
      setEstado(error ? "error" : "activo");
    } catch { setEstado("error"); }
  };
  const quitar = async () => {
    setEstado("trabajando");
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) { await supabaseBrowser().from("push_subs").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); }
    setEstado("inactivo");
  };

  if (!clave || !estado || estado === "no") return null;
  return (
    <div className="card recordatorio">
      <b>🔔 Recordatorio de las 8 p.m.</b>
      {estado === "activo" ? (
        <p className="note" style={{ margin: "4px 0 0" }}>✓ Activado: si a las 8 p.m. aún no llenas tu registro, te llega un aviso. <button className="linklike" onClick={quitar}>Quitarlo</button></p>
      ) : estado === "iphone" ? (
        <p className="note" style={{ margin: "4px 0 0" }}>En iPhone, primero agrega esta app a tu pantalla de inicio (botón Compartir ⬆️ y luego &quot;Agregar a inicio&quot;) y ábrela desde ahí para activar el recordatorio.</p>
      ) : estado === "bloqueado" ? (
        <p className="note" style={{ margin: "4px 0 0" }}>Las notificaciones están bloqueadas. Actívalas en los ajustes de tu celular para esta app y vuelve aquí.</p>
      ) : (
        <>
          <p className="note" style={{ margin: "4px 0 8px" }}>Te llega un aviso a las 8 p.m. (tu hora) si ese día aún no llenas tu registro.</p>
          <button className="btn primary" disabled={estado === "trabajando"} onClick={activar}>{estado === "trabajando" ? "Activando…" : "Activar recordatorio"}</button>
          {estado === "error" && <p className="note" style={{ color: "var(--warn)" }}>No se pudo activar. Inténtalo más tarde.</p>}
        </>
      )}
    </div>
  );
}
