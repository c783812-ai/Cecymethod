// Biblioteca de alimentos de Cecy (SMAE + europeos + renal). Los datos viven en public/alimentos/*.json
// y se arman con scripts/build_alimentos.py. Se cargan solo cuando hacen falta.

export type Sistema = "smae" | "renal";
export type Alimento = {
  id: string; n: string; g: string; c: number; u: string; pn: number;
  k: number; p: number; l: number; h: number; f?: number; o: "smae" | "europa" | "renal";
  k_mg?: number; na?: number; fo?: number; agua?: number; ca?: number;
};
/** Un ingrediente de una comida: el alimento (copiado, para no cargar la biblioteca) y cuántos equivalentes. */
export type Ingrediente = { id: string; n: string; g: string; c: number; u: string; pn: number; x: number };

const cache: Partial<Record<Sistema, Promise<Alimento[]>>> = {};
export function cargarAlimentos(s: Sistema = "smae") {
  return (cache[s] ??= fetch(`/alimentos/${s}.json`).then((r) => {
    if (!r.ok) throw new Error("No se pudo cargar la lista de alimentos");
    return r.json();
  }));
}

export const comoIngrediente = (a: Alimento, x = 1): Ingrediente => ({ id: a.id, n: a.n, g: a.g, c: a.c, u: a.u, pn: a.pn, x });

const FR: [number, string][] = [[0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"]];
export function fraccion(v: number) {
  const w = Math.floor(v + 1e-6), r = v - w;
  if (r < 0.04) return String(w);
  if (r > 0.96) return String(w + 1);
  const f = FR.find(([x]) => Math.abs(r - x) < 0.04);
  if (f) return (w ? String(w) : "") + f[1];
  return String(Math.round(v * 10) / 10);
}

const PLURAL: Record<string, string> = { taza: "tazas", pieza: "piezas", rebanada: "rebanadas", cucharada: "cucharadas", cucharadita: "cucharaditas", medida: "medidas", cuadrito: "cuadritos", lata: "latas", vaso: "vasos", sobre: "sobres", galleta: "galletas", hoja: "hojas", rollo: "rollos", paquete: "paquetes", filete: "filetes", copa: "copas" };
function unidad(u: string, v: number) {
  const t = u.trim();
  if (v <= 1) return t;
  const [first, ...rest] = t.split(" ");
  return [PLURAL[first.toLowerCase()] ?? first, ...rest].join(" ");
}

/** "1½ tazas · 150 g" para x equivalentes de un alimento. */
export function cantidad(a: { c: number; u: string; pn: number }, x: number) {
  const v = a.c * x;
  const g = Math.round((a.pn * x) / (a.pn * x >= 20 ? 5 : 1)) * (a.pn * x >= 20 ? 5 : 1);
  if (a.u === "g" || a.u === "ml" || !a.u) return `${Math.round(v)} ${a.u || "g"}`;
  return `${fraccion(v)} ${unidad(a.u, v)}${a.pn ? ` · ${g} g` : ""}`;
}

export const ICONO: [RegExp, string][] = [
  [/verdura/i, "🥦"], [/fruta/i, "🍎"], [/cereal/i, "🌾"], [/legumin/i, "🫘"], [/a\.o\.a|origen animal/i, "🍗"],
  [/leche/i, "🥛"], [/grasa|aceite/i, "🥑"], [/az[uú]car/i, "🍯"], [/libre|condimento/i, "🌿"], [/l[ií]quido/i, "💧"], [/etanol/i, "🍷"],
];
export const icono = (g: string) => ICONO.find(([r]) => r.test(g))?.[1] ?? "🍽️";

/** Nombre que entiende la paciente para el subgrupo. */
export function nombreSubgrupo(g: string) {
  const m: Record<string, string> = {
    "A.O.A MBAG": "Proteína muy baja en grasa", "A.O.A BAG": "Proteína baja en grasa", "A.O.A MAG": "Proteína con grasa moderada", "A.O.A AAG": "Proteína alta en grasa",
    "Cereales S/G": "Cereales sin grasa", "Cereales C/G": "Cereales con grasa", "Grasas S/Proteínas": "Grasas", "Grasas C/Proteínas": "Grasas con proteína (semillas)",
    "Azucares S/grasa": "Azúcares", "Azucares C/grasa": "Azúcares con grasa", "Leche semi": "Leche semidescremada", "Leche C/azúcar": "Leche con azúcar",
  };
  return m[g] ?? g;
}

const quitaAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export function buscar(lista: Alimento[], q: string, g?: string) {
  const words = quitaAcentos(q).split(/\s+/).filter(Boolean);
  return lista.filter((a) => (!g || a.g === g) && words.every((w) => quitaAcentos(a.n).includes(w)));
}
