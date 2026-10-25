"use client";
import { useEffect, useState } from "react";

/** Una cita cuenta como próxima hasta 2 horas después de empezar. */
export const esFutura = (iso: string | null | undefined, ahora = new Date()) => !!iso && new Date(iso).getTime() > ahora.getTime() - 2 * 3600e3;

export const citaLarga = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
export const citaCorta = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Enlace que abre Google Calendar con el evento ya lleno. */
export function linkGoogle(titulo: string, iso: string, minutos = 60, detalle = "") {
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ini = new Date(iso), fin = new Date(ini.getTime() + minutos * 60000);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${f(ini)}/${f(fin)}&details=${encodeURIComponent(detalle)}`;
}

/** El texto de la próxima consulta en la hora del teléfono de quien la ve; si no hay fecha, el texto viejo. */
export function useCita(p: { cita_at?: string | null; proxima_cita: string | null }) {
  const [t, setT] = useState<string | null>(p.cita_at ? null : p.proxima_cita);
  useEffect(() => { setT(p.cita_at ? (esFutura(p.cita_at) ? citaLarga(p.cita_at) : null) : p.proxima_cita); }, [p.cita_at, p.proxima_cita]);
  return t;
}

/** Fecha mostrada en la hora local (evita que el servidor la pinte en otra zona). */
export function FechaLocal({ iso, larga }: { iso: string; larga?: boolean }) {
  const [t, setT] = useState("");
  useEffect(() => setT(larga ? citaLarga(iso) : citaCorta(iso)), [iso, larga]);
  return <>{t}</>;
}
