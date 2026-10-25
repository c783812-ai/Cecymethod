import { ACTIVIDADES, ANIMOS, SUENO, hoyISO, type Registro } from "./diario";
import { hambrePorTiempo } from "./alertas";

export type Fila = { fecha: string; data: Registro };
export type Carga = { ejercicio: string; fecha: string; data: { u?: "kg" | "lb"; s?: { p?: number | string; r?: number | string }[] } };

const lleno = (r?: Registro) => !!r && Object.keys(r).length > 0;
const prom = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const contar = <T,>(xs: T[]) => { const m = new Map<T, number>(); for (const x of xs) m.set(x, (m.get(x) ?? 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
const BAJO = ["😔", "😰", "😤"];

/** Todo lo que registró en el periodo, en números que se leen rápido. */
export function resumenPeriodo(filas: Fila[]) {
  const regs = filas.map((f) => f.data).filter(lleno);
  const comidasDe = regs.reduce((s, r) => s + (r.de ?? 0), 0);
  const comidasHechas = regs.reduce((s, r) => s + Math.min(r.comidas?.length ?? 0, r.de ?? 0), 0);
  const n = (ok: (r: Registro) => boolean) => regs.filter(ok).length;
  const activos = n((r) => (r.act ?? []).some((a) => a !== "descanso"));
  const acts = contar(regs.flatMap((r) => (r.act ?? []).filter((a) => a !== "descanso")));
  return {
    dias: regs.length,
    comidasPct: comidasDe ? Math.round((comidasHechas / comidasDe) * 100) : null,
    fuera: n((r) => !!r.fuera && r.fuera !== "no"),
    fueraQue: regs.map((r) => r.fueraQue?.trim()).filter((x): x is string => !!x).slice(-5),
    alcohol: n((r) => !!r.alcohol && r.alcohol !== "no"),
    alcoholMucho: n((r) => r.alcohol === "3+"),
    agua: prom(regs.map((r) => r.agua).filter((x): x is number => typeof x === "number")),
    pasos: prom(regs.map((r) => r.pasos).filter((x): x is number => typeof x === "number" && x > 0)),
    estres: prom(regs.map((r) => r.estres).filter((x): x is number => typeof x === "number")),
    suenoComun: (() => { const c = contar(regs.map((r) => r.sueno).filter(Boolean) as string[])[0]; return c ? SUENO.find(([k]) => k === c[0])?.[1] ?? null : null; })(),
    suenoPoco: n((r) => r.sueno === "<6"),
    animos: contar(regs.map((r) => r.animo).filter(Boolean) as string[]).slice(0, 3).map(([e, k]) => `${e} ${ANIMOS.find(([x]) => x === e)?.[1] ?? ""} ${k}`),
    animoBajo: n((r) => BAJO.includes(r.animo ?? "")),
    activos,
    actividades: acts.slice(0, 3).map(([a, k]) => `${ACTIVIDADES.find(([x]) => x === a)?.[1] ?? a} ${k}`),
    estrenimiento: n((r) => r.heces === "estrenimiento"),
    diarrea: n((r) => r.heces === "diarrea"),
    hambre: hambrePorTiempo(regs).filter((t) => t.marcadas > 0),
    meds: [...new Set(regs.map((r) => r.meds?.trim()).filter((x): x is string => !!x))],
  };
}

const kg = (p: number, u?: string) => (u === "lb" ? p * 0.4536 : p);
/** Por ejercicio: el peso más alto de la primera vez y de la última, en la unidad que usa ella. */
export function progresoCargas(cargas: Carga[]) {
  const por = new Map<string, Carga[]>();
  for (const c of cargas) por.set(c.ejercicio, [...(por.get(c.ejercicio) ?? []), c]);
  const max = (c: Carga) => Math.max(0, ...(c.data.s ?? []).map((s) => Number(s.p) || 0));
  return [...por.entries()]
    .map(([ejercicio, xs]) => {
      const o = xs.sort((a, b) => a.fecha.localeCompare(b.fecha)).filter((c) => max(c) > 0);
      if (o.length < 2) return null;
      const a = o[0], b = o[o.length - 1], u = b.data.u ?? "kg";
      const de = u === (a.data.u ?? "kg") ? max(a) : Math.round(kg(max(a), a.data.u) / (u === "lb" ? 0.4536 : 1));
      return { ejercicio, de, a: max(b), u, veces: o.length, sube: max(b) - de };
    })
    .filter((x): x is NonNullable<typeof x> => !!x && x.sube > 0)
    .sort((x, y) => kg(y.sube, y.u) - kg(x.sube, x.u));
}

const masDias = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return hoyISO(d); };

/** Compara los 5 días antes de su regla con el resto de sus días (sin contar la regla). Necesita al menos una regla registrada. */
export function patronCiclo(filas: Fila[]) {
  const d = new Map(filas.filter((f) => lleno(f.data)).map((f) => [f.fecha, f.data]));
  const regla = (f: string) => d.get(f)?.ciclo === "regla";
  const inicios = [...d.keys()].sort().filter((f) => regla(f) && !regla(masDias(f, -1)));
  const pre = new Set(inicios.flatMap((f) => [1, 2, 3, 4, 5].map((k) => masDias(f, -k))).filter((f) => d.has(f) && !regla(f)));
  const resto = [...d.keys()].filter((f) => !pre.has(f) && !regla(f));
  const enRegla = [...d.keys()].filter(regla);
  if (!inicios.length || pre.size < 3 || resto.length < 5) return { listo: false as const, reglas: inicios.length, diasPre: pre.size };
  const tasa = (fs: string[], ok: (r: Registro) => boolean) => fs.filter((f) => ok(d.get(f)!)).length / fs.length;
  const media = (fs: string[], v: (r: Registro) => number | undefined) => prom(fs.map((f) => v(d.get(f)!)).filter((x): x is number => typeof x === "number"));
  const P = [...pre];
  const hambre = (r: Registro) => (r.hs ?? []).some((x) => x?.s === 1);
  const medidas: [string, number | null, number | null, "pct" | "num"][] = [
    ["Quedó con hambre después de comer", tasa(P, hambre), tasa(resto, hambre), "pct"],
    ["Comió fuera del plan", tasa(P, (r) => !!r.fuera && r.fuera !== "no"), tasa(resto, (r) => !!r.fuera && r.fuera !== "no"), "pct"],
    ["Ánimo bajo (triste, ansiosa o irritable)", tasa(P, (r) => BAJO.includes(r.animo ?? "")), tasa(resto, (r) => BAJO.includes(r.animo ?? "")), "pct"],
    ["Durmió menos de 6 h", tasa(P, (r) => r.sueno === "<6"), tasa(resto, (r) => r.sueno === "<6"), "pct"],
    ["Estrés (1 a 5)", media(P, (r) => r.estres), media(resto, (r) => r.estres), "num"],
    ["Alcohol", tasa(P, (r) => !!r.alcohol && r.alcohol !== "no"), tasa(resto, (r) => !!r.alcohol && r.alcohol !== "no"), "pct"],
  ];
  const filasT = medidas.filter(([, a, b]) => a !== null && b !== null).map(([t, a, b, k]) => ({ t, pre: a!, resto: b!, k, nota: k === "pct" ? a! - b! >= 0.2 : a! - b! >= 0.8 }));
  return { listo: true as const, reglas: inicios.length, diasPre: P.length, diasResto: resto.length, diasRegla: enRegla.length, filas: filasT, destacados: filasT.filter((f) => f.nota).map((f) => f.t) };
}

function mejorRacha(fechas: string[]) {
  let best = 0, n = 0, prev = "";
  for (const f of [...fechas].sort()) { n = prev && masDias(prev, 1) === f ? n + 1 : 1; best = Math.max(best, n); prev = f; }
  return best;
}

/** Mensaje de logros del mes, listo para mandar por WhatsApp. */
export function mensajeLogros(nombre: string, filas: Fila[], cargas: ReturnType<typeof progresoCargas>, masculino = false) {
  const r = resumenPeriodo(filas);
  const fechas = filas.filter((f) => lleno(f.data)).map((f) => f.fecha);
  const completas = filas.filter((f) => f.data.de && (f.data.comidas?.length ?? 0) >= f.data.de).map((f) => f.fecha);
  const lineas: string[] = [];
  if (r.dias) lineas.push(`📝 Registraste ${r.dias} ${r.dias === 1 ? "día" : "días"}${mejorRacha(fechas) >= 3 ? `, con una racha de ${mejorRacha(fechas)} días seguidos` : ""}.`);
  if (r.comidasPct !== null) lineas.push(`🍽️ Hiciste el ${r.comidasPct}% de tus comidas del plan${mejorRacha(completas) >= 3 ? ` y ${mejorRacha(completas)} días seguidos con todas` : ""}.`);
  if (r.activos) lineas.push(`💪 Te moviste ${r.activos} ${r.activos === 1 ? "día" : "días"}.`);
  for (const c of cargas.slice(0, 3)) lineas.push(`🏋️ ${c.ejercicio}: de ${c.de} a ${c.a} ${c.u}.`);
  if (r.pasos) lineas.push(`🚶 Promedio de ${Math.round(r.pasos).toLocaleString("es-MX")} pasos al día.`);
  if (!lineas.length) return null;
  const orgullosa = masculino ? "orgulloso" : "orgullosa";
  return `¡Hola, ${nombre.split(" ")[0]}! 🌟 Te comparto tus logros de este mes:\n\n${lineas.join("\n")}\n\nEstoy muy ${orgullosa} de ti. ¡Vamos por más! 💛\nCecy`;
}
