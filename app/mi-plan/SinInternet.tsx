"use client";
import { useEffect, useState } from "react";

/** Registra el service worker para que la app abra sin internet y avisa cuando no hay conexión. */
export default function SinInternet() {
  const [fuera, setFuera] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const f = () => setFuera(!navigator.onLine);
    f();
    window.addEventListener("online", f);
    window.addEventListener("offline", f);
    return () => { window.removeEventListener("online", f); window.removeEventListener("offline", f); };
  }, []);
  if (!fuera) return null;
  return <div className="offline">Sin internet: ves tu plan como estaba la última vez. Cuando vuelva la señal, ábrela otra vez para que lo que anotes se guarde en tu cuenta.</div>;
}
