import type { Ingrediente } from "./alimentos";
import type { Comida } from "./types";

/** Lo que la paciente marca cada día. Las llaves son fechas "2026-10-12". */
export type Registro = {
  comidas?: number[]; // tiempos de comida marcados como listos (0 a 4)
  de?: number; // cuántas comidas tenía ese día
  pct?: number; // avance de su meta (0 a 100), calculado con sus cambios
  agua?: number; // vasos de 250 ml
  bano?: number; // veces que fue al baño
  heces?: "normal" | "diarrea" | "estrenimiento";
  animo?: string; // emoji de ÁNIMOS
  sueno?: string; // valor de SUENO
  estres?: number; // 1 a 5
  ciclo?: string; // valor de CICLO
  meds?: string; // "" = ninguno; si no, lo que escribió
};
export type Diario = Record<string, Registro>;

export const META = { proteina: "Proteína", carbohidratos: "Carbohidratos", grasas: "Grasas", comidas: "Hacer mis 5 comidas" } as const;
export type Meta = keyof typeof META;

export const ANIMOS: [string, string][] = [["😄", "Feliz"], ["🙂", "Bien"], ["😐", "Normal"], ["😔", "Triste"], ["😰", "Ansiosa"], ["😤", "Irritable"], ["😴", "Cansada"]];
export const SUENO: [string, string][] = [["<6", "Menos de 6 h"], ["6-7", "6 a 7 h"], ["7-8", "7 a 8 h"], ["8.5-10", "8½ a 10 h"], [">10", "Más de 10 h"]];
export const CICLO: [string, string][] = [["normal", "Todo normal"], ["regla", "Estoy en mi regla"], ["irregular", "Algo irregular"], ["na", "No aplica"]];
export const HECES: [Registro["heces"] & string, string][] = [["normal", "Normal"], ["estrenimiento", "Estreñida"], ["diarrea", "Diarrea"]];
export const ESTRES = ["Nada", "Poco", "Algo", "Bastante", "Mucho"];
export const BANO_SUGERIDO = 3;

export const hoyISO = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Proteína, hidratos y grasa de 1 equivalente por subgrupo SMAE, para platillos armados antes de guardar los macros.
const REF: [RegExp, [number, number, number]][] = [
  [/prote[ií]na en polvo/i, [24, 3, 1.5]], [/meal prep/i, [35, 40, 15]], [/batido listo/i, [20, 10, 3]], [/barra de prote/i, [20, 15, 7]], [/bebida vegetal con prote/i, [7, 3, 3]],
  [/col[aá]geno/i, [9, 0, 0]], [/^(fibra|polvo verde|c[uú]rcuma|creatina|vitamina|probi|multivit|electrolit|saborizante|caf[eé]|omega|magnesio|endulzante|kombucha|vinagre)/i, [0, 0, 0]],
  [/verdura/i, [2, 4, 0]], [/fruta/i, [0, 15, 0]], [/cereales? c\/g|cereales con grasa/i, [2, 15, 5]], [/cereal/i, [2, 15, 0]],
  [/legumin/i, [8, 20, 1]], [/mbag|muy bajo aporte/i, [7, 0, 1]], [/a\.o\.a bag|bajo aporte/i, [7, 0, 3]], [/mag|moderado aporte/i, [7, 0, 5]],
  [/aag|alto aporte/i, [7, 0, 8]], [/leche descremada/i, [9, 12, 2]], [/leche semi/i, [9, 12, 4]], [/leche/i, [9, 12, 8]],
  [/c\/prote|con prote/i, [3, 3, 5]], [/grasa|aceite/i, [0, 0, 5]], [/az[uú]car/i, [0, 10, 0]],
];

/** [proteína, hidratos, grasa] en gramos de un ingrediente con su cantidad. */
export function macros(i: Ingrediente): [number, number, number] {
  const base = i.m ?? REF.find(([r]) => r.test(i.g))?.[1] ?? [0, 0, 0];
  return [base[0] * i.x, base[1] * i.x, base[2] * i.x];
}

/** Cuánto aporta cada tiempo de comida a la meta (en g, o 1 por comida si la meta es hacer las comidas). */
export function aporte(comidas: (Comida & { ingredientes?: Ingrediente[] })[], meta: Meta) {
  const k = meta === "proteina" ? 0 : meta === "carbohidratos" ? 1 : 2;
  return comidas.map((c) => (!c.titulo ? 0 : meta === "comidas" ? 1 : (c.ingredientes ?? []).reduce((s, i) => s + macros(i)[k], 0)));
}
