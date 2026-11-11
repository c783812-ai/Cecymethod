// Fases del ciclo menstrual con tips generales de alimentación y ejercicio. Borrador para que Cecy lo revise.
// Los días son aproximados: la ovulación suele ser unos 14 días antes de la siguiente regla.

export type Fase = { id: "menstrual" | "folicular" | "ovulatoria" | "lutea" | "premenstrual"; n: string; ic: string; que: string; tips: string[] };

export const FASES: Record<Fase["id"], Fase> = {
  menstrual: {
    id: "menstrual", n: "Menstrual", ic: "🌑", que: "Tu energía puede estar más baja y puedes tener cólicos.",
    tips: [
      "Repón hierro: carne magra, huevo, lentejas o frijoles con algo de vitamina C (limón, naranja, pimiento).",
      "Omega 3 (salmón, sardina, chía, nuez) y magnesio pueden ayudar con los cólicos.",
      "Toma suficiente agua y algo caliente: té de jengibre o manzanilla.",
      "Si te sientes cansada, camina, estira o haz yoga. Si tienes energía, entrena normal.",
    ],
  },
  folicular: {
    id: "folicular", n: "Folicular", ic: "🌒", que: "Tu energía y tu ánimo suelen ir subiendo.",
    tips: [
      "Buen momento para subir pesos en tu rutina y probar recetas nuevas de tu plan.",
      "Toleras bien los carbohidratos complejos: avena, camote, arroz integral, fruta.",
      "Incluye alimentos fermentados (yogur natural, kéfir) y verduras variadas.",
    ],
  },
  ovulatoria: {
    id: "ovulatoria", n: "Ovulación", ic: "🌕", que: "Suele ser tu punto más alto de energía.",
    tips: [
      "Aprovecha para tus entrenamientos más intensos.",
      "Verduras crucíferas (brócoli, coliflor, col) y fibra ayudan a tu cuerpo con las hormonas.",
      "Hidrátate bien, sobre todo si entrenas fuerte.",
    ],
  },
  lutea: {
    id: "lutea", n: "Lútea", ic: "🌖", que: "Es normal que tengas un poco más de hambre.",
    tips: [
      "Pon proteína y fibra en cada comida para quedar satisfecha más tiempo.",
      "Planea tus colaciones para no llegar con mucha hambre a la siguiente comida.",
      "Magnesio: semillas de calabaza, almendras, espinaca, chocolate 70 % (un cuadrito).",
      "Cuida tus horas de sueño: dormir poco aumenta los antojos.",
    ],
  },
  premenstrual: {
    id: "premenstrual", n: "Premenstrual", ic: "🌘", que: "Pueden aparecer hinchazón, antojos y cambios de ánimo.",
    tips: [
      "Menos sal y alimentos procesados, y más agua, para la hinchazón.",
      "Baja la cafeína si te sientes ansiosa o duermes mal.",
      "Si se te antoja algo dulce, elige uno de tus antojos de la app y disfrútalo sin culpa.",
      "Ejercicio moderado y caminar te ayudan con el ánimo.",
    ],
  },
};

/** Día del ciclo (1 = primer día de la regla) y su fase. */
export function faseDe(dia: number, largo: number, duraRegla = 5): Fase {
  const ov = Math.max(10, largo - 14);
  if (dia <= duraRegla) return FASES.menstrual;
  if (dia < ov - 1) return FASES.folicular;
  if (dia <= ov + 1) return FASES.ovulatoria;
  if (dia > largo - 5) return FASES.premenstrual;
  return FASES.lutea;
}
