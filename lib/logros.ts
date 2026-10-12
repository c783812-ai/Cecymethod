import type { Diario, Registro } from "./diario";
import { hoyISO } from "./diario";

const antes = (iso: string, n = 1) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() - n); return hoyISO(d); };
const registro = (r?: Registro) => !!r && Object.keys(r).length > 0;

/** Días seguidos que cumplen algo, contando hasta hoy (si hoy aún no cumple, cuenta hasta ayer para no "romper" la racha temprano). */
function racha(d: Diario, hoy: string, ok: (r?: Registro) => boolean) {
  let f = ok(d[hoy]) ? hoy : antes(hoy);
  let n = 0;
  while (ok(d[f])) { n++; f = antes(f); }
  return n;
}
function mejor(d: Diario, ok: (r?: Registro) => boolean) {
  let best = 0, n = 0, prev = "";
  for (const f of Object.keys(d).sort()) {
    if (!ok(d[f])) { n = 0; prev = f; continue; }
    n = prev && antes(f) === prev && n ? n + 1 : 1;
    best = Math.max(best, n); prev = f;
  }
  return best;
}

export type Logro = { icono: string; texto: string; ok: boolean; nuevo: boolean };

export function logrosDe(d: Diario, vasos: number, hoy = hoyISO()) {
  const agua = (r?: Registro) => (r?.agua ?? 0) >= vasos;
  const comidas = (r?: Registro) => !!r?.de && (r.comidas?.length ?? 0) >= r.de;
  const calc = (x: Diario) => {
    const reg = mejor(x, registro), ag = mejor(x, agua), co = mejor(x, comidas);
    const total = Object.values(x).filter(registro).length;
    return [
      { icono: "🌱", texto: "Tu primer registro", ok: total >= 1 },
      { icono: "🔥", texto: "3 días seguidos", ok: reg >= 3 },
      { icono: "⭐", texto: "Una semana completa", ok: reg >= 7 },
      { icono: "💧", texto: "5 días con toda tu agua", ok: ag >= 5 },
      { icono: "🍽️", texto: "5 días con todas tus comidas", ok: co >= 5 },
      { icono: "🌟", texto: "2 semanas seguidas", ok: reg >= 14 },
      { icono: "🏆", texto: "Un mes registrando", ok: total >= 30 },
    ];
  };
  const sinHoy = Object.fromEntries(Object.entries(d).filter(([f]) => f !== hoy));
  const previos = calc(sinHoy);
  const logros: Logro[] = calc(d).map((l, i) => ({ ...l, nuevo: l.ok && !previos[i].ok }));
  return {
    registro: racha(d, hoy, registro),
    agua: racha(d, hoy, agua),
    comidas: racha(d, hoy, comidas),
    logros,
  };
}
