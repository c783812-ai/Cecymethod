/**
 * Guía para Cecy al asignar suplementos: cuándo tomarlos y con qué no juntarlos.
 * Solo se ve en el consultorio, la paciente no la ve.
 */

export const MOMENTOS = ["En ayunas", "Desayuno", "Comida", "Cena", "Antes de dormir", "Con cualquier comida", "Antes de entrenar", "Después de entrenar", "Cualquier hora"] as const;
export type Momento = (typeof MOMENTOS)[number];

export type Guia = {
  nombre: string;
  r: RegExp; // reconoce el suplemento por su nombre o su grupo
  cuando: Momento[];
  separar?: { de: string; horas: number; r?: RegExp }[]; // tomarlo lejos de esto; r reconoce esos alimentos en la misma comida
  ojo?: string[]; // interacciones con medicamentos o condiciones
  tip?: string;
};

const CAFE = /caf[eé]|espresso|capuchino|t[eé] (negro|verde|matcha)|matcha|cola\b/i;
const LACTEOS = /leche|yogur|queso|k[eé]fir|reques[oó]n|jocoque|skyr|lact/i;
const FIBRA = /avena|salvado|chía|chia|linaza|psyllium|fibra|integral|frijol|lenteja|garbanzo/i;
const CALCIO = /leche|yogur|queso|k[eé]fir|calcio|tofu|sardina/i;

export const GUIA: Guia[] = [
  {
    nombre: "Hierro", r: /hierro|ferroso|ferrico|bisglicinato de hierro|\biron\b/i, cuando: ["En ayunas"],
    separar: [{ de: "café y té", horas: 1, r: CAFE }, { de: "lácteos y calcio", horas: 2, r: CALCIO }, { de: "fibra, avena y leguminosas", horas: 1, r: FIBRA }],
    ojo: ["Con vitamina C o un cítrico se absorbe mejor", "Separar 4 h de levotiroxina y de antiácidos (omeprazol)", "Si le cae pesado, puede ir con una comida ligera sin lácteos"],
  },
  {
    nombre: "Calcio", r: /calcio|calcium/i, cuando: ["Comida", "Cena"],
    separar: [{ de: "hierro", horas: 2, r: /hierro/i }, { de: "zinc", horas: 2, r: /zinc/i }],
    ojo: ["Máximo 500 mg por toma", "Carbonato: con comida; citrato: a cualquier hora", "Separar 4 h de levotiroxina"],
  },
  {
    nombre: "Vitamina D", r: /vitamina d|vit\.? d|\bd3\b|colecalciferol/i, cuando: ["Comida"],
    tip: "Va con la comida que tenga grasa (aguacate, aceite, nueces) para que se absorba",
    ojo: ["Si toma diuréticos tiazídicos, vigilar calcio"],
  },
  {
    nombre: "Vitamina K2", r: /k2|menaquinona|mk-?7/i, cuando: ["Comida"],
    tip: "Con grasa, igual que la vitamina D",
    ojo: ["No si toma anticoagulantes tipo warfarina/acenocumarol"],
  },
  {
    nombre: "Omega-3", r: /omega|aceite de pescado|fish oil|krill|\bdha\b|\bepa\b/i, cuando: ["Comida", "Cena"],
    tip: "Con comida con grasa; si da reflujo con sabor a pescado, en la cena o congelado",
    ojo: ["Con anticoagulantes o antes de una cirugía, revisar dosis"],
  },
  {
    nombre: "Magnesio", r: /magnesio|magnesium/i, cuando: ["Cena", "Antes de dormir"],
    separar: [{ de: "hierro", horas: 2, r: /hierro/i }, { de: "lácteos y calcio", horas: 2, r: CALCIO }],
    tip: "Glicinato o bisglicinato para sueño y estrés; citrato si hay estreñimiento",
    ojo: ["Separar 2 h de antibióticos (quinolonas, tetraciclinas) y 4 h de levotiroxina", "Cuidado en enfermedad renal"],
  },
  {
    nombre: "Zinc", r: /\bzinc\b|\bzn\b/i, cuando: ["Comida", "Cena"],
    separar: [{ de: "hierro", horas: 2, r: /hierro/i }, { de: "lácteos y calcio", horas: 2, r: CALCIO }],
    tip: "En ayunas se absorbe mejor pero puede dar náusea; con comida va bien",
    ojo: ["Separar 2 h de antibióticos", "Uso largo de dosis altas baja el cobre"],
  },
  {
    nombre: "Vitamina B12", r: /b-?12|cobalamina|metilcobalamina/i, cuando: ["En ayunas", "Desayuno"],
    tip: "De día, porque puede quitar el sueño",
    ojo: ["La metformina y el omeprazol bajan la B12: buena idea vigilarla"],
  },
  {
    nombre: "Complejo B", r: /complejo b|b complex|vitaminas? del complejo/i, cuando: ["Desayuno"],
    tip: "De día, con comida para que no dé náusea; la orina amarilla es normal",
  },
  {
    nombre: "Ácido fólico / folato", r: /f[oó]lico|folato|metilfolato/i, cuando: ["Desayuno", "Cualquier hora"],
    ojo: ["Con metotrexato, solo si su médico lo indica"],
  },
  {
    nombre: "Vitamina C", r: /vitamina c|vit\.? c|asc[oó]rbico/i, cuando: ["Desayuno", "Comida"],
    tip: "Junto con el hierro ayuda a absorberlo",
  },
  {
    nombre: "Multivitamínico", r: /multivit|multi-?vit|centrum|supradyn/i, cuando: ["Desayuno", "Comida"],
    separar: [{ de: "café y té", horas: 1, r: CAFE }],
    tip: "Con comida; revisar si trae hierro antes de sumarle otro",
  },
  {
    nombre: "Probióticos", r: /probi[oó]tic|lactobacil|bifido/i, cuando: ["En ayunas", "Desayuno"],
    ojo: ["Separar 2 h de antibióticos", "En inmunosupresión, revisar con su médico"],
  },
  {
    nombre: "Fibra", r: /fibra|psyllium|psilio|inulina|metamucil/i, cuando: ["Antes de dormir", "Comida"],
    tip: "Con un vaso grande de agua; subirla poco a poco",
    ojo: ["Separar 2 h de medicamentos y de otros suplementos (los atrapa)"],
  },
  {
    nombre: "Creatina", r: /creatin/i, cuando: ["Cualquier hora", "Después de entrenar"],
    tip: "Lo importante es tomarla diario; con algo de carbohidrato o proteína va bien",
    ojo: ["Cuidado en enfermedad renal", "Puede subir un poco la creatinina en estudios sin que sea daño"],
  },
  {
    nombre: "Proteína en polvo", r: /prote[ií]na en polvo|whey|isolat|batido listo|bebida vegetal con prote|barra de prote/i, cuando: ["Después de entrenar", "Desayuno"],
    tip: "Cuenta como equivalente de proteína de esa comida",
    ojo: ["Si es de suero y hay intolerancia a la lactosa, mejor aislado o vegetal"],
  },
  {
    nombre: "Colágeno", r: /col[aá]geno/i, cuando: ["Cualquier hora", "En ayunas"],
    tip: "Con vitamina C (un cítrico) ayuda a formar colágeno",
  },
  {
    nombre: "Cúrcuma", r: /c[uú]rcuma|curcumin|turmeric/i, cuando: ["Comida"],
    tip: "Con grasa y pimienta negra para absorberse",
    ojo: ["Con anticoagulantes o antes de una cirugía, revisar", "Evitar si hay cálculos en vesícula"],
  },
  {
    nombre: "Electrolitos", r: /electrol/i, cuando: ["Antes de entrenar", "Después de entrenar"],
    ojo: ["En hipertensión o enfermedad renal, revisar el sodio y potasio"],
  },
  {
    nombre: "Polvo verde", r: /polvo verde|greens|ag1|athletic greens/i, cuando: ["En ayunas", "Desayuno"],
    separar: [{ de: "café", horas: 1, r: CAFE }],
    ojo: ["Algunos traen vitamina K: cuidado con anticoagulantes", "Revisar que no duplique el multivitamínico"],
  },
  {
    nombre: "Vinagre de manzana", r: /vinagre de manzana|cider vinegar/i, cuando: ["Comida", "Cena"],
    tip: "10 ml en 150 ml de agua tibia, con popote, antes o con la comida",
    ojo: ["No en gastritis o reflujo", "Con insulina o diuréticos, cuidado con el potasio y la glucosa"],
  },
  {
    nombre: "Kombucha", r: /kombucha/i, cuando: ["Comida", "Cualquier hora"],
    ojo: ["Trae algo de cafeína y alcohol mínimo: no en embarazo", "Elegir sin azúcar"],
  },
  {
    nombre: "Ashwagandha", r: /ashwagandha|withania/i, cuando: ["Cena", "Antes de dormir"],
    ojo: ["No en embarazo ni en hipertiroidismo", "Con levotiroxina o sedantes, revisar con su médico"],
  },
  {
    nombre: "Melatonina", r: /melatonin/i, cuando: ["Antes de dormir"],
    tip: "30 a 60 min antes de dormir",
    ojo: ["Con anticoagulantes o antidepresivos, revisar"],
  },
  {
    nombre: "Inositol", r: /inositol/i, cuando: ["En ayunas", "Cena"],
    tip: "Común en SOP; se suele repartir en 2 tomas",
  },
  {
    nombre: "Berberina", r: /berberin/i, cuando: ["Comida", "Cena"],
    tip: "Con las comidas principales, repartida",
    ojo: ["No en embarazo ni lactancia", "Con metformina o insulina, riesgo de bajar mucho la glucosa", "Interfiere con varios medicamentos: revisar"],
  },
  {
    nombre: "Selenio", r: /selenio|selenium/i, cuando: ["Desayuno", "Comida"],
    ojo: ["No pasar de 200 µg al día (2 nueces de Brasil ya dan mucho)"],
  },
  {
    nombre: "Coenzima Q10", r: /q10|coenzima|ubiquinol/i, cuando: ["Comida"],
    tip: "Con grasa; de día porque puede quitar el sueño",
    ojo: ["Con warfarina, revisar", "Útil si toma estatinas"],
  },
  {
    nombre: "Café / cafeína", r: /^caf[eé]|cafe[ií]na|pre-?entreno|pre-?workout/i, cuando: ["Desayuno", "Antes de entrenar"],
    tip: "No después de las 2 pm para no afectar el sueño",
    ojo: ["Separar 1 h del hierro y 2 h del calcio"],
  },
];

/** La guía que le toca a un suplemento por su nombre (o su grupo). */
export function guiaDe(...textos: (string | undefined)[]) {
  const t = textos.filter(Boolean).join(" ");
  return t ? GUIA.find((g) => g.r.test(t)) : undefined;
}

/** Qué choca en la misma comida: devuelve avisos tipo "Separar 1 h de café y té (Café americano)". */
export function choques(g: Guia, otros: string[]) {
  return (g.separar ?? []).flatMap((s) => {
    const hay = otros.filter((n) => s.r?.test(n) && !g.r.test(n));
    return hay.length ? [`Separar ${s.horas} h de ${s.de} (${hay.join(", ")})`] : [];
  });
}
