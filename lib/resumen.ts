import { ANIMOS, CICLO, ESTRES, HECES, META, SUENO, ACTIVIDADES, MINUTOS, ALCOHOL, BEBIDAS, FUERA, type Meta, type Registro } from "./diario";

const prom = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const etiqueta = <T,>(ops: [T, string][], v: T | undefined) => ops.find(([k]) => k === v)?.[1];

export type Semana = ReturnType<typeof resumenSemana>;

/** Junta lo que la paciente marcó en la semana y escribe un borrador de mensaje para Cecy. */
export function resumenSemana(regs: Record<string, Registro>, fechas: string[], opts: { nombre: string; meta?: Meta; vasos: number }) {
  const dias = fechas.map((f) => ({ fecha: f, r: regs[f] }));
  const con = dias.filter((d) => d.r && Object.keys(d.r).length);
  const r = con.map((d) => d.r!);
  const comidas = r.reduce((s, x) => s + (x.comidas?.length ?? 0), 0);
  const deComidas = r.reduce((s, x) => s + (x.de ?? 0), 0);
  const metaProm = prom(r.filter((x) => x.pct != null).map((x) => x.pct!));
  const diasMeta = r.filter((x) => (x.pct ?? 0) >= 90).length;
  const agua = prom(r.filter((x) => x.agua != null).map((x) => x.agua!));
  const bano = prom(r.filter((x) => x.bano != null).map((x) => x.bano!));
  const estrenida = r.filter((x) => x.heces === "estrenimiento").length;
  const diarrea = r.filter((x) => x.heces === "diarrea").length;
  const estres = prom(r.filter((x) => x.estres != null).map((x) => x.estres!));
  const sueno = r.map((x) => x.sueno).filter(Boolean) as string[];
  const suenoCorto = sueno.filter((s) => s === "<6").length;
  const pasos = r.map((x) => x.pasos).filter((p): p is number => typeof p === "number");
  const activos = r.filter((x) => x.act?.some((a) => a !== "descanso")).length;
  const alcoholDias = r.filter((x) => x.alcohol && x.alcohol !== "no").length;
  const bebidas = r.reduce((s, x) => s + (x.alcohol === "1" ? 1 : x.alcohol === "2" ? 2 : x.alcohol === "3+" ? 3 : 0), 0);
  const bebidasMas = r.some((x) => x.alcohol === "3+");
  const fueraDias = r.filter((x) => x.fuera && x.fuera !== "no").length;
  const pasos7 = pasos.filter((p) => p >= 7000).length;
  const pasosProm = pasos.length ? Math.round(pasos.reduce((a, b) => a + b, 0) / pasos.length) : 0;
  const animos = dias.map((d) => d.r?.animo ?? "·");
  const ciclo = con.filter((d) => d.r!.ciclo === "irregular" || d.r!.ciclo === "regla").map((d) => `${d.fecha.slice(8)}/${d.fecha.slice(5, 7)}: ${etiqueta(CICLO, d.r!.ciclo)}`);
  const meds = con.filter((d) => d.r!.meds).map((d) => ({ fecha: d.fecha, que: d.r!.meds! }));
  const animosMalos = r.filter((x) => ["😔", "😰", "😤"].includes(x.animo ?? "")).length;

  // Borrador: primero lo que salió bien, luego un solo punto a mejorar.
  const bien: string[] = [];
  const mejorar: string[] = [];
  if (deComidas && comidas / deComidas >= 0.8) bien.push(`hiciste ${comidas} de tus ${deComidas} comidas`);
  else if (deComidas) mejorar.push(`hiciste ${comidas} de ${deComidas} comidas; vamos a buscar cómo hacer más fácil las que se te complican`);
  if (opts.meta && opts.meta !== "comidas" && metaProm != null) {
    if (metaProm >= 85) bien.push(`llegaste a tu meta de ${META[opts.meta].toLowerCase()} ${diasMeta} ${diasMeta === 1 ? "día" : "días"}`);
    else mejorar.push(`tu ${META[opts.meta].toLowerCase()} quedó en ${Math.round(metaProm)}% en promedio`);
  }
  if (agua != null) (agua >= opts.vasos * 0.85 ? bien : mejorar).push(agua >= opts.vasos * 0.85 ? `tomaste tu agua (${agua.toFixed(1)} vasos al día)` : `tomaste ${agua.toFixed(1)} de tus ${opts.vasos} vasos de agua al día`);
  if (activos >= 3) bien.push(`te moviste ${activos} días`);
  if (pasos7 >= 4) bien.push(`caminaste más de 7,000 pasos ${pasos7} días`);
  if (estrenida >= 2) mejorar.push(`te sentiste estreñida ${estrenida} días`);
  if (suenoCorto >= 2) mejorar.push(`dormiste menos de 6 horas ${suenoCorto} noches`);
  const nombre = opts.nombre.split(" ")[0];
  const mensaje = !con.length ? "" : [
    `Hola ${nombre} 💛 Acabo de checar tu semana.`,
    bien.length ? `Te quiero felicitar porque ${unir(bien)}.` : "Gracias por registrar tu semana, eso ya es un gran paso.",
    mejorar.length ? `Esta semana me gustaría que nos enfoquemos en algo: ${mejorar[0]}.` : "",
    meds.length ? `Vi que empezaste a tomar ${meds.map((m) => m.que).join(", ")}; cuéntame un poquito más para revisar que vaya bien con tu plan.` : "",
    "¡Vamos por otra semana! ✨",
  ].filter(Boolean).join("\n\n");

  return {
    dias, registrados: con.length, comidas, deComidas, metaProm, diasMeta, agua, bano, estrenida, diarrea, estres, sueno, suenoCorto, pasos, pasos7, pasosProm, activos, alcoholDias, bebidas, bebidasMas, fueraDias,
    animos, animosMalos, ciclo, meds, mensaje,
    textoSueno: (s?: string) => etiqueta(SUENO, s), textoPasos: (p?: number) => (typeof p === "number" ? p.toLocaleString("en-US") : undefined),
    textoActividad: (x?: Registro) => (x?.act?.length ? [x.act.map((a) => etiqueta(ACTIVIDADES, a)).join(", "), etiqueta(MINUTOS, x.min), x.kcal ? `${x.kcal} kcal` : ""].filter(Boolean).join(" · ") : undefined), textoAlcohol: (x?: Registro) => (x?.alcohol ? [x.alcohol === "2" ? "2 vasos o copas" : x.alcohol === "3+" ? "3 o más vasos o copas" : etiqueta(ALCOHOL, x.alcohol), x.bebida?.map((b) => etiqueta(BEBIDAS, b)).join(", ")].filter(Boolean).join(": ") : undefined),
    textoFuera: (x?: Registro) => (x?.fuera ? (x.fuera === "no" ? "No" : [etiqueta(FUERA, x.fuera), x.fueraQue].filter(Boolean).join(": ")) : undefined),
    textoHeces: (h?: Registro["heces"]) => etiqueta(HECES, h),
    textoEstres: (n?: number) => (n ? ESTRES[n - 1] : undefined), textoAnimo: (a?: string) => ANIMOS.find(([e]) => e === a)?.[1],
  };
}

function unir(xs: string[]) {
  return xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
}
