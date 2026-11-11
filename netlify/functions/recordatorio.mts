// Cada hora revisa a quién le tocan las 8 p.m. en su zona horaria y le manda el recordatorio de su registro
// (solo si ese día todavía no anotó nada). Corre en Netlify, no en el navegador.
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

export const config = { schedule: "@hourly" };

const HORA = 20;

function hoyEn(tz: string, d: Date) {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(d).map((x) => [x.type, x.value]));
    return { fecha: `${p.year}-${p.month}-${p.day}`, hora: Number(p.hour) };
  } catch {
    return null;
  }
}

export default async () => {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data: k } = await sb.from("push_config").select("publica, privada").eq("id", 1).maybeSingle();
  if (!k) return new Response("sin llaves");
  webpush.setVapidDetails("mailto:cecilia.nutdxb@gmail.com", k.publica, k.privada);

  const { data: subs } = await sb.from("push_subs").select("endpoint, patient_id, sub, tz, ultimo, patients!inner(estado, nombre)");
  const ahora = new Date();
  let enviados = 0;
  for (const s of subs ?? []) {
    const t = hoyEn(s.tz, ahora);
    if (!t || t.hora !== HORA || s.ultimo === t.fecha) continue;
    const pac = s.patients as unknown as { estado?: string; nombre: string };
    if (pac.estado && pac.estado !== "activa") continue;
    await sb.from("push_subs").update({ ultimo: t.fecha }).eq("endpoint", s.endpoint);
    const { data: ya } = await sb.from("diario").select("fecha").eq("patient_id", s.patient_id).eq("fecha", t.fecha).maybeSingle();
    if (ya) continue; // ya llenó su registro hoy
    const nombre = pac.nombre.split(" ")[0];
    try {
      await webpush.sendNotification(s.sub, JSON.stringify({ title: "Cecy Method", body: `${nombre}, recuerda llenar tu registro de hoy 💛`, url: "/mi-plan" }));
      enviados++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await sb.from("push_subs").delete().eq("endpoint", s.endpoint); // ya no existe ese celular
    }
  }
  return new Response(`enviados: ${enviados}`);
};
