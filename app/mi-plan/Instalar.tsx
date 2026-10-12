"use client";
import { useEffect, useRef, useState } from "react";

type Aviso = "" | "boton" | "ios" | "android";
type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Invita a la paciente a poner su plan en la pantalla de inicio, como una app. */
export default function Instalar() {
  const [modo, setModo] = useState<Aviso>("");
  const ev = useRef<PromptEvent | null>(null);
  useEffect(() => {
    try { if (localStorage.getItem("instalar-listo")) return; } catch {}
    const nav = navigator as Navigator & { standalone?: boolean };
    if (matchMedia("(display-mode: standalone)").matches || nav.standalone) return;
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) { setModo("ios"); return; }
    if (/android/i.test(ua)) setModo("android");
    const h = (e: Event) => { e.preventDefault(); ev.current = e as PromptEvent; setModo("boton"); };
    addEventListener("beforeinstallprompt", h);
    return () => removeEventListener("beforeinstallprompt", h);
  }, []);
  if (!modo) return null;
  const cerrar = () => { try { localStorage.setItem("instalar-listo", "1"); } catch {} setModo(""); };
  return (
    <div className="card instalar">
      <button className="x" aria-label="Cerrar" onClick={cerrar}>✕</button>
      <b>📲 Pon tu plan en tu pantalla de inicio</b>
      {modo === "boton" ? (
        <>
          <p className="note">Así abres tu plan con un toque, como una app.</p>
          <button className="btn primary" onClick={async () => { await ev.current?.prompt(); const c = await ev.current?.userChoice; if (c?.outcome === "accepted") cerrar(); }}>Agregar a mi inicio</button>
        </>
      ) : modo === "ios" ? (
        <p className="note">En Safari toca <b>Compartir</b> <span aria-hidden="true">⬆️</span> y luego <b>Agregar a inicio</b>. Te queda el ícono de Cecy Method como una app.</p>
      ) : (
        <p className="note">En Chrome toca el menú <b>⋮</b> y luego <b>Agregar a pantalla de inicio</b>. Te queda el ícono de Cecy Method como una app.</p>
      )}
    </div>
  );
}
