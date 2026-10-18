// Ajustes por paciente que vienen en su plan: si los textos van en masculino y qué alimentos no puede comer.
import { createContext, useContext } from "react";

export type Genero = "f" | "m";

/** Grupos que Cecy puede esconder de "Cambiar" (y de los antojos) para una paciente. */
export const EVITAR: { id: string; nombre: string; r: RegExp }[] = [
  { id: "carne-roja", nombre: "Carne roja (res, cerdo, cordero)", r: /(^|[\s(])(res\b|cerdo|puerco|ternera|cordero|carnero|borrego|cabrito|chivo|venado|bistec|bisteck|arrachera|chuleta|costilla|lomo|pierna de cerdo|carne(?! (de|molida de) (soya|pollo|pavo|faisán|faisam|faisám|avestruz|ganzo|ganso|pato|jaiba|cangrejo|pescado)| vegetal| (obscura|oscura|blanca))|carnitas(?! de pollo)|cecina|barbacoa|machaca\b|rinder|schwein|lamm|rindfleisch|steak|hamburguesa|albóndiga|albondiga|chamorro|aguayón|aguayon|suadero|sirloin|filete de res|t-bone|alce|chambarete|cuete|empuje|falda|filete (mignon|mignón|miñón|tampiqueña)|medall[oó]n de filete|puntas de filete|roast beef|tampiqueña|liebre|espaldilla|espinazo|maciza|retazo(?! de pollo)|rib eye|short loin|molida especial|suarero|jabal[ií])/i },
  { id: "visceras", nombre: "Vísceras", r: /h[ií]gado|ri[ñn][oó]n|molleja|menudo|pancita|panza|mondongo|sesos|\blengua\b|coraz[oó]n(?! de (lechuga|palmito|alcachofa))|tripa|moronga|\bbuche|leber|menudencia|ubre\b|cabeza de pescado/i },
  { id: "mariscos", nombre: "Mariscos", r: /camar[oó]n|langost|pulpo|calamar|ostion|ostión|almeja|mejill[oó]n|cangrejo|jaiba|callo de hacha|surimi|abul[oó]n|percebe|garnel|vieira|marisco|acocil|cangrej|caviar|hueva/i },
  { id: "embutidos", nombre: "Embutidos", r: /jam[oó]n|salchicha|chorizo|tocino|salami|longaniza|pepperoni|mortadela|chistorra|queso de puerco|pastrami|bacon|wurst|speck|salchich[oó]n|paté|pate\b/i },
  { id: "insectos", nombre: "Insectos y escamoles", r: /escamol|jumil|chapul|ahuahutle|gusano|oruga/i },
  { id: "pescado-azul", nombre: "Sardina, anchoa, arenque y macarela", r: /sardina|anchoa|boquer[oó]n|arenque|macarela|caballa|makrele|hering|charal/i },
  { id: "pescado", nombre: "Todo el pescado", r: /pescado|at[uú]n|salm[oó]n|tilapia|mojarra|robalo|huachinango|merluza|bacalao|abadejo|trucha|\bsierra\b|bagre|lenguado|dorado|\bmero\b|sardina|anchoa|arenque|macarela|caballa|lachs|fisch|thunfisch/i },
  { id: "huevo", nombre: "Huevo", r: /huevo|clara|yema|\bei\b|eier/i },
  { id: "yema", nombre: "Yema de huevo (deja las claras)", r: /yema|huevo entero|huevo (cocido|fresco|frito|revuelto|estrellado|batido|tibio|duro)|huevos? (entero|cocido|fresco|frito|revuelto)|\beier?\b/i },
  { id: "gluten", nombre: "Gluten (trigo, centeno, cebada)", r: /trigo(?! (negro|sarraceno))|centeno|cebada|(?<!fruto del )\bpan\b|bolillo|telera|baguette|bagel|croissant|pasta(?! de (cacahu?c?ate|almendra|anchoa|camar[oó]n|langosta|ajonjol[ií]|s[eé]samo))|espagueti|spaghetti|macarr[oó]n|fideo|cusc[uú]s|couscous|galleta(?:s)?(?! de (ma[ií]z|arroz))|harina(?! nixtamal| para tamales| de (alforf[oó]n|girasol|haba|ajonjol[ií]|ma[ií]z|arroz|almendras?|coco|garbanzo|lenteja|amaranto|soya|s[eé]samo|cacahuate|papa|yuca|linaza|ch[ií]a|quinoa|frijol))|tortilla de harina|seit[aá]n|bulgur|brot|br[oö]tchen|nudeln|(?<!buch)weizen|roggen|dinkel|espelta|salvado|pretzel|brezel|wrap|\bpita\b|knäcke/i },
  { id: "cacahuate", nombre: "Cacahuate", r: /cacahuate|man[ií]\b|erdnuss|peanut/i },
  { id: "nueces", nombre: "Nueces y semillas de árbol", r: /almendra|nuez(?! moscada)|nueces|avellana|pistache|pistacho|anacardo|nuez de la india|macadamia|pecana|casta[ñn]a|mand(el|eln)|haseln|walnuss|cashew/i },
  { id: "soya", nombre: "Soya", r: /soya|soja|tofu|tempeh|edamame|miso|\bsoy\b/i },
];

export type Evitar = { grupos: string[]; otros: string[] };

/** True si el alimento es de algo que la paciente no puede comer. `otros` son palabras sueltas que escribió Cecy (por ejemplo "betabel"). */
export function prohibido(nombre: string, ev?: Evitar | null) {
  if (!ev) return false;
  const n = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (ev.otros.some((w) => w && n.includes(w.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()))) return true;
  return ev.grupos.some((g) => EVITAR.find((e) => e.id === g)?.r.test(nombre));
}

/** De lo que trae el plan a la forma de trabajo; null si no hay nada que evitar. */
export function evitarDe(plan?: { evitar?: string[]; evitar_otros?: string[] } | null): Evitar | null {
  const grupos = plan?.evitar ?? [];
  const otros = (plan?.evitar_otros ?? []).map((w) => w.trim()).filter(Boolean);
  return grupos.length || otros.length ? { grupos, otros } : null;
}

// Palabras que la app dice en femenino; para un paciente hombre se cambian así.
const MASC: [RegExp, string][] = [
  [/\bAnsiosa\b/g, "Ansioso"], [/\bCansada\b/g, "Cansado"], [/\bSaciada\b/g, "Saciado"], [/\bEstreñida\b/g, "Estreñido"], [/\bestreñida\b/g, "estreñido"],
  [/\bcontenta\b/g, "contento"], [/\bTodas hacemos\b/g, "Todos hacemos"],
  [/‍♀️/g, ""], [/‍♀/g, ""],
];
/** El texto como se le dice a esta persona: igual para ellas, en masculino para ellos. */
export function g(texto: string, genero: Genero = "f") {
  return genero === "m" ? MASC.reduce((t, [r, s]) => t.replace(r, s), texto) : texto;
}

export type Ajustes = { genero: Genero; evitar: Evitar | null };
export const AjustesPaciente = createContext<Ajustes>({ genero: "f", evitar: null });
export const useAjustes = () => useContext(AjustesPaciente);
/** Atajo para componentes: const t = useG(); t("Cansada") */
export function useG() {
  const { genero } = useAjustes();
  return (texto: string) => g(texto, genero);
}
