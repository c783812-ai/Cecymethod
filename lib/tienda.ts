/**
 * Suplementos por categoría: para qué sirven, cómo tomarlos y dónde comprarlos.
 * Las pacientes lo ven en la pestaña Suplementos; Cecy ve además las ideas según sus metas.
 * Contenido general (borrador para que Cecy lo revise): no sustituye su indicación.
 */
import productos from "./tiendaProductos.json";

/** Amazon de cada país donde puede haber pacientes. Suiza y el resto de la UE compran en Amazon Alemania. */
export const MERCADOS = {
  MX: { dom: "amazon.com.mx", nombre: "Amazon México" }, US: { dom: "amazon.com", nombre: "Amazon EE. UU." }, CA: { dom: "amazon.ca", nombre: "Amazon Canadá" },
  UK: { dom: "amazon.co.uk", nombre: "Amazon Reino Unido" }, ES: { dom: "amazon.es", nombre: "Amazon España" }, DE: { dom: "amazon.de", nombre: "Amazon Alemania" },
  AE: { dom: "amazon.ae", nombre: "Amazon Emiratos" },
} as const;
export type Mercado = keyof typeof MERCADOS;
export const MERCADO_DE: Record<string, Mercado> = { MX: "MX", US: "US", CA: "CA", UK: "UK", ES: "ES", DE: "DE", CH: "DE", EU: "DE", AE: "AE" };

/** Un producto recomendado. urls: su página en cada Amazon (si no hay, se busca por `busca`); ml: Mercado Libre México. */
export type Producto = { cat: string; n: string; marca: string; pres?: string; busca: string; urls: Partial<Record<Mercado, string>>; ml?: string; paises?: Mercado[]; nivel?: "accesible" | "premium"; precio?: string };
export type Categoria = {
  id: string; emoji: string; nombre: string; para: string[];
  sirve: string; como: string; cuando: string; separar?: string; ojo?: string;
  r: RegExp; // reconoce el suplemento en el plan
};

export const CATEGORIAS: Categoria[] = [
  { id: "magnesio-glicinato", emoji: "🌙", nombre: "Magnesio glicinato", para: ["Dormir", "Estrés", "Calambres"], r: /magnesio.*(glicin|bisglic)|glicinato de magnesio/i,
    sirve: "Ayuda a relajarte, a dormir mejor y a bajar calambres. Es el que menos afloja el estómago.",
    como: "200 a 400 mg de magnesio al día (revisa en la etiqueta cuánto magnesio trae cada cápsula).", cuando: "En la cena o 30 a 60 minutos antes de dormir, con agua.",
    separar: "2 horas lejos del hierro y del calcio.", ojo: "Si tienes problemas de riñón, o tomas antibióticos o levotiroxina, pregúntale a Cecy antes." },
  { id: "magnesio-citrato", emoji: "🚽", nombre: "Magnesio citrato", para: ["Ir al baño"], r: /magnesio.*citrato|citrato de magnesio/i,
    sirve: "Ayuda a ir al baño cuando hay estreñimiento, porque jala agua al intestino.",
    como: "Empieza con 200 mg y sube poco a poco hasta 400 mg si lo necesitas.", cuando: "En la noche, con un vaso grande de agua.",
    separar: "2 horas lejos del hierro y del calcio.", ojo: "Si te da diarrea, baja la dosis. No lo tomes si tienes problemas de riñón sin preguntarle a Cecy." },
  { id: "omega-3", emoji: "🐟", nombre: "Omega-3", para: ["Inflamación", "Corazón", "Ánimo"], r: /omega|aceite de pescado|fish oil|krill|\bdha\b|\bepa\b/i,
    sirve: "Grasas buenas que ayudan a bajar la inflamación, a tu corazón, a los triglicéridos y al ánimo.",
    como: "1 a 2 g de EPA + DHA al día (suma los dos en la etiqueta).", cuando: "Con tu comida o cena, que tenga algo de grasa. Si te repite a pescado, tómalo en la cena.",
    ojo: "Si tomas anticoagulantes o tienes una cirugía cerca, pregúntale a Cecy." },
  { id: "vitamina-d3-k2", emoji: "☀️", nombre: "Vitamina D3 (con K2)", para: ["Huesos", "Defensas", "Ánimo"], r: /vitamina d|vit\.? d|\bd3\b|colecalciferol|k2/i,
    sirve: "Ayuda a tus huesos, a tus defensas y a tu ánimo. Casi todas la tenemos baja, sobre todo en invierno.",
    como: "1,000 a 2,000 UI al día. Más solo si tus análisis lo piden.", cuando: "Con la comida que tenga grasa (aguacate, aceite, nueces).",
    ojo: "Si tomas anticoagulantes, no tomes la que trae K2 sin preguntarle a Cecy." },
  { id: "hierro", emoji: "🩸", nombre: "Hierro bisglicinato", para: ["Energía", "Anemia"], r: /hierro|ferroso|ferrico|\biron\b/i,
    sirve: "Sube tus reservas de hierro si tus análisis salen bajos o tienes reglas abundantes. Es el que menos molesta el estómago.",
    como: "Solo si Cecy o tu médico te lo indican por tus análisis. Lo usual: 18 a 30 mg al día.", cuando: "En ayunas o con una fruta con vitamina C (naranja, fresas, kiwi).",
    separar: "1 a 2 horas lejos del café, el té, los lácteos y la fibra.", ojo: "Puede poner tus heces oscuras, es normal. Separa 4 horas de la levotiroxina." },
  { id: "proteina-whey", emoji: "🥤", nombre: "Proteína whey (aislada)", para: ["Músculo", "Saciedad"], r: /whey|isolat|prote[ií]na de suero/i,
    sirve: "Te ayuda a llegar a tu proteína del día para formar músculo y quedarte satisfecha. La aislada casi no tiene lactosa.",
    como: "1 medida (20 a 30 g de proteína).", cuando: "Después de entrenar, o en el desayuno o una colación. Con agua o leche vegetal.",
    ojo: "Si eres alérgica a la proteína de la leche, usa la vegetal." },
  { id: "proteina-vegetal", emoji: "🌱", nombre: "Proteína vegetal", para: ["Músculo", "Vegana"], r: /prote[ií]na vegetal|chícharo|guisante|pea protein|falcon/i,
    sirve: "Proteína de chícharo y arroz para formar músculo, ideal si eres vegana o no te cae bien la whey.",
    como: "1 medida (20 a 30 g de proteína).", cuando: "Después de entrenar, o en el desayuno o una colación." },
  { id: "creatina", emoji: "💪", nombre: "Creatina monohidratada", para: ["Músculo", "Fuerza", "Rendimiento"], r: /creatin/i,
    sirve: "Te da más fuerza en tus series y ayuda a ganar músculo. Es de lo más estudiado y seguro.",
    como: "3 a 5 g al día, todos los días, aunque no entrenes.", cuando: "A cualquier hora, con agua o en tu batido.",
    ojo: "Toma suficiente agua. Si tienes problemas de riñón, pregúntale a Cecy." },
  { id: "psyllium", emoji: "🌾", nombre: "Psyllium (fibra)", para: ["Ir al baño", "Saciedad", "Colesterol"], r: /psyllium|psilio|plantago|metamucil|fibra/i,
    sirve: "Fibra que ayuda a ir al baño, te da saciedad y ayuda a bajar el colesterol.",
    como: "Empieza con 1 cucharadita (5 g) al día y sube a 2 si lo necesitas.", cuando: "En un vaso grande de agua, antes de una comida o en la noche. Toma más agua en el día.",
    separar: "2 horas lejos de tus medicamentos y otros suplementos." },
  { id: "probiotico", emoji: "🦠", nombre: "Probiótico", para: ["Digestión", "Después de antibióticos"], r: /probi[oó]tic|lactobacil|bifido/i,
    sirve: "Bacterias buenas para tu intestino. Ayudan sobre todo durante y después de tomar antibióticos.",
    como: "1 cápsula al día.", cuando: "En ayunas o con el desayuno.",
    separar: "2 horas lejos del antibiótico.", ojo: "Si tienes las defensas muy bajas por algún tratamiento, pregúntale a Cecy." },
  { id: "inositol", emoji: "🌸", nombre: "Inositol 40:1", para: ["SOP", "Insulina", "Ciclo"], r: /inositol/i,
    sirve: "Ayuda con la resistencia a la insulina y a regular el ciclo en el SOP (ovario poliquístico).",
    como: "2 g de myo-inositol (+ 50 mg de D-chiro) dos veces al día.", cuando: "Antes del desayuno y antes de la cena.",
    ojo: "Si estás embarazada o buscas embarazo, pregúntale a Cecy." },
  { id: "colageno", emoji: "✨", nombre: "Colágeno hidrolizado", para: ["Piel", "Articulaciones"], r: /col[aá]geno/i,
    sirve: "Ayuda a la piel, el cabello y las articulaciones. No cuenta como tu proteína del día.",
    como: "10 g al día.", cuando: "A cualquier hora, en tu café, agua o licuado. Con vitamina C funciona mejor." },
  { id: "b12", emoji: "⚡", nombre: "Vitamina B12", para: ["Energía", "Vegana"], r: /b-?12|cobalamina|complejo b/i,
    sirve: "Para tu energía y tus nervios. Es indispensable si eres vegana, o si tomas metformina u omeprazol.",
    como: "Según la etiqueta (normalmente 500 a 1,000 mcg al día).", cuando: "En la mañana, con o sin desayuno." },
  { id: "multivitaminico-mujer", emoji: "💊", nombre: "Multivitamínico de mujer", para: ["Base"], r: /multivit|multi-?vit|centrum|supradyn/i,
    sirve: "Una base de vitaminas y minerales para cubrir huecos de tu alimentación.",
    como: "1 al día, o lo que diga la etiqueta.", cuando: "Con el desayuno o la comida.",
    ojo: "Si ya tomas un prenatal, no sumes otro multivitamínico." },
  { id: "ashwagandha", emoji: "🍃", nombre: "Ashwagandha (KSM-66)", para: ["Estrés", "Dormir"], r: /ashwagandha|withania/i,
    sirve: "Ayuda a manejar el estrés y a dormir mejor.",
    como: "300 a 600 mg al día, por temporadas de 8 a 12 semanas.", cuando: "En la cena o antes de dormir.",
    ojo: "No en embarazo ni lactancia. Si tienes problemas de tiroides o enfermedades autoinmunes, o tomas pastillas para dormir, pregúntale a Cecy." },
  { id: "melatonina", emoji: "😴", nombre: "Melatonina", para: ["Dormir", "Jet lag"], r: /melatonin/i,
    sirve: "Ayuda a conciliar el sueño, sobre todo con jet lag o cambios de horario.",
    como: "0.5 a 1 mg, por temporadas.", cuando: "30 a 60 minutos antes de dormir.",
    ojo: "No en embarazo ni lactancia. Si tomas anticoagulantes o pastillas para dormir, pregúntale a Cecy." },
  { id: "electrolitos", emoji: "💧", nombre: "Electrolitos", para: ["Entrenamiento", "Calor"], r: /electrol/i,
    sirve: "Reponen las sales que pierdes al sudar mucho.",
    como: "1 sobre en 500 ml de agua.", cuando: "Cuando entrenas más de 1 hora, hace mucho calor o sudas mucho.",
    ojo: "Si tienes presión alta o problemas de riñón, pregúntale a Cecy." },
  { id: "zinc", emoji: "🛡️", nombre: "Zinc", para: ["Defensas", "Piel"], r: /\bzinc\b/i,
    sirve: "Ayuda a tus defensas y a la piel (acné).",
    como: "15 a 25 mg al día, por temporadas.", cuando: "Con la comida o la cena.",
    separar: "2 horas lejos del hierro, el calcio y los lácteos.", ojo: "No lo tomes en dosis altas por meses sin preguntarle a Cecy." },
  { id: "prenatal", emoji: "🤰", nombre: "Prenatal con metilfolato", para: ["Embarazo"], r: /prenatal|metilfolato|f[oó]lico|folato/i,
    sirve: "Vitaminas para antes y durante el embarazo, con folato para el bebé.",
    como: "1 al día.", cuando: "Con una comida. Idealmente desde 3 meses antes de buscar embarazo.",
    ojo: "Si tomas un prenatal, no sumes otro multivitamínico." },
];

/** Ideas para Cecy según las metas de la paciente (solo se ven en el consultorio). */
export const POR_META: { meta: string; r: RegExp; cats: string[]; nota: string }[] = [
  { meta: "Dormir mejor", r: /dorm|sueño|insomni|descans/i, cats: ["magnesio-glicinato", "melatonina", "ashwagandha"], nota: "Primero magnesio glicinato; melatonina solo por temporadas." },
  { meta: "Estrés o ansiedad", r: /estr[eé]s|ansiedad|cortisol|nervi/i, cats: ["magnesio-glicinato", "ashwagandha", "omega-3"], nota: "Ashwagandha por ciclos de 8 a 12 semanas; revisar tiroides." },
  { meta: "Ir al baño", r: /estreñ|estren|baño|evacu|intestin/i, cats: ["psyllium", "magnesio-citrato", "probiotico"], nota: "Psyllium + más agua primero; citrato si no basta." },
  { meta: "Digestión o inflamación", r: /digest|inflam|hinch|distens|colitis|gastritis|gases/i, cats: ["probiotico", "omega-3", "psyllium"], nota: "Si hay distensión fuerte, ojo con el psyllium al inicio (empezar bajo)." },
  { meta: "Ganar músculo", r: /m[uú]sculo|masa|fuerza|gl[uú]te|tonific|pierna/i, cats: ["proteina-whey", "proteina-vegetal", "creatina"], nota: "Creatina 3 a 5 g diario; proteína solo si no llega con comida." },
  { meta: "Bajar grasa", r: /bajar|grasa|peso|adelgaz|definir|kilos/i, cats: ["proteina-whey", "psyllium"], nota: "La proteína y la fibra ayudan a la saciedad; no hay suplemento que queme grasa." },
  { meta: "SOP o insulina", r: /\bsop\b|ovario|poliqu|insulina|gluc|prediab/i, cats: ["inositol", "omega-3", "vitamina-d3-k2"], nota: "Inositol 40:1, 4 g al día en dos tomas; revisar vitamina D en análisis." },
  { meta: "Energía o anemia", r: /energ|cansan|fatiga|anemia|hierro|ferritina/i, cats: ["hierro", "b12", "vitamina-d3-k2"], nota: "Hierro solo con análisis (ferritina); B12 si es vegana o toma metformina." },
  { meta: "Piel, cabello y uñas", r: /piel|cabello|pelo|uñas|acn/i, cats: ["colageno", "zinc", "omega-3"], nota: "Zinc por temporadas; revisar hierro si hay caída de cabello." },
  { meta: "Defensas", r: /defensa|inmun|enferm|gripa|resfr/i, cats: ["vitamina-d3-k2", "zinc"], nota: "" },
  { meta: "Embarazo", r: /embaraz|bebé|concebir|fertil|lactan/i, cats: ["prenatal", "omega-3"], nota: "Nada de ashwagandha ni melatonina; omega-3 con DHA." },
  { meta: "Entrenamiento o calor", r: /rendim|corr|marat|entren|deport|sud/i, cats: ["electrolitos", "creatina"], nota: "" },
  { meta: "Vegana o vegetariana", r: /vegan|vegetarian/i, cats: ["b12", "proteina-vegetal", "omega-3"], nota: "Omega-3 de alga." },
  { meta: "Huesos o menopausia", r: /hueso|osteop|menopa/i, cats: ["vitamina-d3-k2", "magnesio-glicinato"], nota: "Revisar calcio de la dieta antes de suplementar calcio." },
];

export const PRODUCTOS = productos as Producto[];

/** Tus IDs de afiliada de Amazon por país (no son contraseñas). Vacío = el link funciona, pero sin comisión. */
export const AFILIADO: Partial<Record<Mercado, string>> = {};
/** Links de afiliada de Mercado Libre por producto (los genera Cecy en su portal), por `busca`. */
export const AFILIADO_ML: Record<string, string> = {};

export function linkAmazon(p: Producto, m: Mercado) {
  const u = new URL(p.urls[m] ?? `https://www.${MERCADOS[m].dom}/s?k=${encodeURIComponent(p.busca)}`);
  const tag = AFILIADO[m];
  if (tag) u.searchParams.set("tag", tag);
  return u.toString();
}
export const linkML = (p: Producto) => AFILIADO_ML[p.busca] ?? p.ml ?? `https://listado.mercadolibre.com.mx/${encodeURIComponent(p.busca.toLowerCase().replace(/\s+/g, "-"))}`;
/** Si el producto se vende en ese Amazon: con link confirmado, o marcado en paises. Sin datos, se ofrece como búsqueda. */
export const enMercado = (p: Producto, m: Mercado) => !!p.urls[m] || !!p.paises?.includes(m) || (!p.paises && Object.keys(p.urls).length === 0);

export const categoriasDe = (metas: string[]) => POR_META.filter((x) => metas.some((t) => x.r.test(t)));
export const PARA = Array.from(new Set(CATEGORIAS.flatMap((c) => c.para)));
