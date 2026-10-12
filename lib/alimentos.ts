// Biblioteca de alimentos de Cecy (SMAE + europeos + renal). Los datos viven en public/alimentos/*.json
// y se arman con scripts/build_alimentos.py. Se cargan solo cuando hacen falta.

export type Sistema = "smae" | "renal" | "suplementos";
export type Alimento = {
  id: string; n: string; g: string; c: number; u: string; pn: number;
  k: number; p: number; l: number; h: number; f?: number; o: "smae" | "europa" | "renal" | "sup";
  nota?: string; paises?: string[]; // solo suplementos
  k_mg?: number; na?: number; fo?: number; agua?: number; ca?: number;
};
/** Un ingrediente de una comida: el alimento (copiado, para no cargar la biblioteca) y cuántos equivalentes. */
/** m: [proteína, hidratos, grasa] de 1 porción (x = 1); los platillos viejos no lo traen. */
export type Ingrediente = { id: string; n: string; g: string; c: number; u: string; pn: number; x: number; s?: "sup"; m?: [number, number, number] };

const cache: Partial<Record<Sistema, Promise<Alimento[]>>> = {};
export function cargarAlimentos(s: Sistema = "smae") {
  return (cache[s] ??= fetch(`/alimentos/${s}.json`).then((r) => {
    if (!r.ok) throw new Error("No se pudo cargar la lista de alimentos");
    return r.json();
  }));
}

export const comoIngrediente = (a: Alimento, x = 1): Ingrediente => ({
  id: a.id, n: a.n, g: a.g, c: a.c, u: a.u, pn: a.pn, x, ...(a.o === "sup" ? { s: "sup" as const } : {}),
  ...(a.p != null || a.h != null || a.l != null ? { m: [a.p ?? 0, a.h ?? 0, a.l ?? 0] as [number, number, number] } : {}),
});

const FR: [number, string][] = [[0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"]];
export function fraccion(v: number) {
  const w = Math.floor(v + 1e-6), r = v - w;
  if (r < 0.04) return String(w);
  if (r > 0.96) return String(w + 1);
  const f = FR.find(([x]) => Math.abs(r - x) < 0.04);
  if (f) return (w ? String(w) : "") + f[1];
  return String(Math.round(v * 10) / 10);
}

const PLURAL: Record<string, string> = { taza: "tazas", pieza: "piezas", rebanada: "rebanadas", cucharada: "cucharadas", cucharadita: "cucharaditas", medida: "medidas", cuadrito: "cuadritos", lata: "latas", vaso: "vasos", sobre: "sobres", galleta: "galletas", hoja: "hojas", rollo: "rollos", paquete: "paquetes", filete: "filetes", copa: "copas", botella: "botellas", "cápsula": "cápsulas", tableta: "tabletas", comprimido: "comprimidos", gota: "gotas", cazo: "cazos", barra: "barras", pastilla: "pastillas", perla: "perlas" };
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
  const peso = (n: number, u = "g") => (n >= 1000 ? `${String(Math.round(n / 100) / 10).replace(".", ",")} ${u === "ml" ? "l" : "kg"}` : `${n} ${u}`);
  if (a.u === "g" || a.u === "ml" || !a.u) return peso(Math.round(v), a.u || "g");
  return `${fraccion(v)} ${unidad(a.u, v)}${a.pn ? ` · ${peso(g)}` : ""}`;
}

// Emoji por alimento (por palabra del nombre). Si no hay uno que le quede, va solo el nombre.
const EMOJI: [RegExp, string][] = [
  [/jitomate|tomate/i, "🍅"],
  [/cacahuate|man[ií]\b|erdnuss/i, "🥜"],
  [/huevo|clara/i, "🥚"], [/pollo|pavo|gallina/i, "🍗"], [/(^|\s)res\b|bistec|carne|cerdo|lomo|ternera|cordero|rinderhack/i, "🥩"],
  [/jam[oó]n|tocino|salchicha|chorizo|salami/i, "🥓"], [/camar[oó]n|langost|garnel/i, "🦐"], [/almeja|ostion|ostión|mejill[oó]n/i, "🦪"], [/pulpo|calamar/i, "🦑"],
  [/salm[oó]n|at[uú]n|pescado|bacalao|abadejo|merluza|trucha|sardina|arenque|caballa|tilapia|mojarra|robalo|huachinango|sierra/i, "🐟"],
  [/queso|cottage|reques[oó]n|quark|mozzarella|parmesano/i, "🧀"], [/yogur|skyr|k[eé]fir|leche|griego/i, "🥛"], [/mantequilla/i, "🧈"],
  [/tofu|tempeh|edamame|soya|soja/i, "🫘"], [/frijol|lenteja|garbanzo|alubia|haba|chícharo seco|linsen/i, "🫘"],
[/almendra|nuez|nueces|avellana|pistache|anacardo/i, "🌰"], [/semilla|ch[ií]a|linaza|ajonjol[ií]|pepita/i, "🌱"],
  [/aguacate/i, "🥑"], [/aceite|oliva\b/i, "🫒"], [/aceituna/i, "🫒"], [/(^|\s)coco(\s|$)/i, "🥥"],
  [/(^|\s)pan(\s|$)|bolillo|baguette|brot|br[oö]tchen|toast|tostado|pumpernickel|telera|bagel|croissant/i, "🍞"], [/pretzel|brezel/i, "🥨"],
  [/tortilla|taco|wrap|pita/i, "🫓"], [/arroz/i, "🍚"], [/pasta|espagueti|spaghetti|fideo|macarr[oó]n|tallar[ií]n|nudeln|spätzle|[ñn]oqui/i, "🍝"],
  [/avena|hafer|granola|m[uü]sli|cereal|hojuela/i, "🥣"], [/elote|ma[ií]z|palomita|polenta/i, "🌽"], [/(^|\s)papas?(\s|$)|kartoffel/i, "🥔"], [/camote|batata/i, "🍠"],
  [/galleta|knäcke|tortita de arroz|reiswaffel/i, "🍪"], [/hot ?cake|panqu|waffle/i, "🥞"],
  [/manzana|apfel/i, "🍎"], [/(^|\s)pera(\s|$)|birne/i, "🍐"], [/pl[aá]tano|banana/i, "🍌"], [/naranja|mandarina|toronja/i, "🍊"], [/lim[oó]n|(^|\s)lima(\s|$)/i, "🍋"],
  [/fresa/i, "🍓"], [/ar[aá]ndano|heidelbeer|frambuesa|himbeer|zarzamora|mora\b|frutos rojos|beeren|grosella/i, "🫐"], [/uva|pasa/i, "🍇"],
  [/sand[ií]a/i, "🍉"], [/mel[oó]n/i, "🍈"], [/pi[nñ]a/i, "🍍"], [/mango/i, "🥭"], [/durazno|melocot[oó]n|chabacano|albaricoque|aprikose/i, "🍑"],
  [/cereza|kirsch/i, "🍒"], [/kiwi/i, "🥝"],
  [/br[oó]coli/i, "🥦"], [/zanahoria/i, "🥕"], [/pepino|pepinillo/i, "🥒"], [/pimiento|chile|paprika/i, "🫑"],
  [/lechuga|espinaca|acelga|ar[uú]gula|can[oó]nigo|feldsalat|col\b|kale|rucola|hoja/i, "🥬"], [/champi[nñ][oó]n|hongo|seta/i, "🍄"],
  [/ejote|ch[ií]charo|guisante|bohnen/i, "🫛"], [/nopal/i, "🌵"], [/apio|esp[aá]rrago/i, "🥬"], [/casta[nñ]a/i, "🌰"],
  [/berenjena/i, "🍆"], [/cebolla|puerro/i, "🧅"], [/(^|\s)ajo(\s|$)/i, "🧄"], [/calabac|calabaza|zucchini|hokkaido/i, "🎃"],
  [/miel|honig/i, "🍯"], [/chocolate|cacao/i, "🍫"], [/az[uú]car|mermelada|konfit[uü]re|cajeta/i, "🍬"], [/helado|nieve/i, "🍨"],
  [/caf[eé]/i, "☕"], [/(^|\s)t[eé](\s|$)/i, "🍵"], [/agua\b/i, "💧"], [/prote[ií]na de suero|whey/i, "🥤"],
];
const SUP: Record<string, string> = {
  "Proteína en polvo": "🥤", "Colágeno marino": "🐟", Fibra: "🌾", "Polvo verde": "🥬", Cúrcuma: "🫚", Creatina: "💪",
  "Vitamina B12": "💊", Probióticos: "💊", Multivitamínico: "💊", Electrolitos: "💧", "Saborizante de agua sin calorías": "💧", Café: "☕",
  "Omega-3": "🐟", Magnesio: "💊", "Vitamina D": "☀️", "Batido listo para tomar": "🥤", "Barra de proteína": "🍫",
  "Endulzante sin calorías": "🍃", "Bebida vegetal con proteína": "🥛",
  Kombucha: "🫖", "Vinagre de manzana": "🍎",
};
export const icono = (nombre: string, g = "") => SUP[g] ?? EMOJI.find(([r]) => r.test(nombre))?.[1] ?? "";
export const BANDERA: Record<string, string> = { MX: "🇲🇽", US: "🇺🇸", CA: "🇨🇦", ES: "🇪🇸", DE: "🇩🇪", CH: "🇨🇭" };
export const PAIS: Record<string, string> = { MX: "México", US: "EE. UU.", CA: "Canadá", ES: "España", DE: "Alemania", CH: "Suiza" };

const ICONO_GRUPO: [RegExp, string][] = [
  [/verdura/i, "🥦"], [/fruta/i, "🍎"], [/cereal/i, "🌾"], [/legumin/i, "🫘"], [/a\.o\.a|origen animal/i, "🍗"],
  [/leche/i, "🥛"], [/grasa|aceite/i, "🥑"], [/az[uú]car/i, "🍯"],
];
export const iconoGrupo = (g: string) => ICONO_GRUPO.find(([r]) => r.test(g))?.[1] ?? "";

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
