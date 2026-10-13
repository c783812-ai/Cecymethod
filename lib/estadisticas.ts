import { hoyISO, type Diario, type Registro } from "./diario";

export type Periodo = "semana" | "mes";

const fecha = (iso: string) => new Date(`${iso}T12:00:00`);
const mas = (iso: string, n: number) => { const d = fecha(iso); d.setDate(d.getDate() + n); return hoyISO(d); };

/** Fechas de la semana (lunes a domingo) o del mes de calendario que contiene `hoy`; `atras` = cuántos periodos antes. */
export function fechasDe(p: Periodo, hoy = hoyISO(), atras = 0): string[] {
  if (p === "semana") {
    const lunes = mas(hoy, -((fecha(hoy).getDay() + 6) % 7) - 7 * atras);
    return Array.from({ length: 7 }, (_, i) => mas(lunes, i));
  }
  const d = fecha(hoy); d.setDate(1); d.setMonth(d.getMonth() - atras);
  const out: string[] = [];
  for (const m = d.getMonth(); d.getMonth() === m; d.setDate(d.getDate() + 1)) out.push(hoyISO(d));
  return out;
}

const DUERME_BIEN = ["7-8", "8.5-10", ">10"];

/** Números para que la paciente vea cómo le fue: todo sale de su propio registro. */
export function estadisticas(d: Diario, fechas: string[], vasos: number) {
  const regs = fechas.map((f) => d[f]).filter((r): r is Registro => !!r && Object.keys(r).length > 0);
  const comidas = regs.reduce((s, r) => s + (r.comidas?.length ?? 0), 0);
  const deComidas = regs.reduce((s, r) => s + (r.de ?? 0), 0);
  const pasos = regs.map((r) => r.pasos).filter((p): p is number => typeof p === "number");
  return {
    registrados: regs.length,
    comidas, deComidas,
    pctComidas: deComidas ? Math.round((comidas / deComidas) * 100) : null,
    diasCompletos: regs.filter((r) => !!r.de && (r.comidas?.length ?? 0) >= r.de).length,
    diasMeta: regs.filter((r) => (r.pct ?? 0) >= 90).length,
    conMeta: regs.filter((r) => r.pct != null).length,
    diasAgua: regs.filter((r) => (r.agua ?? 0) >= vasos).length,
    aguaProm: promedio(regs.filter((r) => r.agua != null).map((r) => r.agua!)),
    activos: regs.filter((r) => r.act?.some((a) => a !== "descanso")).length,
    pasosProm: pasos.length ? Math.round(promedio(pasos)!) : null,
    duermeBien: regs.filter((r) => DUERME_BIEN.includes(r.sueno ?? "")).length,
    conSueno: regs.filter((r) => r.sueno).length,
    /** Por día: qué tanto de sus comidas hizo (null = no registró). */
    porDia: fechas.map((f) => { const r = d[f]; return { fecha: f, pct: r?.de ? Math.min(100, Math.round(((r.comidas?.length ?? 0) / r.de) * 100)) : null }; }),
  };
}

function promedio(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}
