import type { Registro } from "./diario";
import { TIEMPOS } from "./types";

/** Lo que conviene revisar primero con cada paciente al ver su semana. */
export function alertasDe(regs: Registro[]): string[] {
  const n = (ok: (r: Registro) => boolean) => regs.filter(ok).length;
  const out: string[] = [];
  const fuera = n((r) => !!r.fuera && r.fuera !== "no");
  if (fuera >= 3) out.push(`🍕 ${fuera} días fuera del plan`);
  const alcohol = n((r) => !!r.alcohol && r.alcohol !== "no");
  const mucho = n((r) => r.alcohol === "3+");
  if (alcohol >= 3 || mucho >= 1) out.push(`🍷 Alcohol ${alcohol} ${alcohol === 1 ? "día" : "días"}${mucho ? ` (${mucho} con 3 o más)` : ""}`);
  const estr = n((r) => r.heces === "estrenimiento");
  if (estr >= 2) out.push(`🚽 Estreñida ${estr} días`);
  const diarrea = n((r) => r.heces === "diarrea");
  if (diarrea >= 2) out.push(`🚽 Diarrea ${diarrea} días`);
  const sueno = n((r) => r.sueno === "<6");
  if (sueno >= 2) out.push(`😴 Durmió menos de 6 h ${sueno} noches`);
  const estres = n((r) => (r.estres ?? 0) >= 4);
  if (estres >= 3) out.push(`🌡️ Mucho estrés ${estres} días`);
  const animo = n((r) => ["😔", "😰", "😤"].includes(r.animo ?? ""));
  if (animo >= 3) out.push(`💛 Ánimo bajo ${animo} días`);
  const quedo = regs.flatMap((r) => r.hs ?? []).filter((x) => x?.s === 1).length;
  if (quedo >= 3) out.push(`🍽️ Quedó con hambre ${quedo} veces`);
  if (regs.some((r) => r.meds)) out.push("💊 Empezó algo nuevo");
  return out;
}

/** Por tiempo de comida: cuántas veces quedó saciada o con hambre después de comer. */
export function hambrePorTiempo(regs: Registro[]) {
  return TIEMPOS.map(([t], i) => {
    const xs = regs.map((r) => r.hs?.[i]?.s).filter((x): x is number => !!x);
    return { tiempo: t, marcadas: xs.length, saciada: xs.filter((x) => x === 2).length, conHambre: xs.filter((x) => x === 1).length };
  });
}
