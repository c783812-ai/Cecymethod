import type { Ejercicio, FilaRutina, Rutina } from "./types";

export const e = (nombre: string, series: string, descanso: string, aproximacion?: string[]): Ejercicio =>
  aproximacion ? { nombre, series, descanso, aproximacion } : { nombre, series, descanso };
export const todos = (x: Ejercicio): FilaRutina => ({ a: x, b: x, c: x });
export const ab = (x: Ejercicio, c: Ejercicio): FilaRutina => ({ a: x, b: x, c });
export const a_bc = (a: Ejercicio, bc: Ejercicio): FilaRutina => ({ a, b: bc, c: bc });

/** Nombre anterior (en español) -> nombre original en inglés, para pasar los videos ya subidos. */
export const NOMBRE_EN: Record<string, string> = {
  "Peso muerto con piernas rígidas con mancuernas": "Dumbbell Stiff Leg Deadlift",
  "Peso muerto con piernas rígidas": "Stiff Leg Deadlift",
  "Sentadilla frontal": "Front Squat",
  "Sentadilla goblet": "Goblet Squat",
  "Hip thrust con barra en pulsos": "Barbell Hip Thrust Pulse",
  "Hip thrust con compañera con pausa": "Pause Partner Hip Thrust",
  "Hip thrust con compañera": "Partner Hip Thrust",
  "Hip thrust con mancuerna en pulsos": "Dumbbell Hip Thrust Pulse",
  "Patada de glúteo en polea, de rodillas": "Cable Kneeling Glute Kickback",
  "Extensión de cadera en cuadrupedia con banda": "Band Quadruped Hip Extension",
  "Abducción de cadera en máquina, inclinada al frente": "Forward Lean Machine Seated Hip Abduction",
  "Abducción de cadera sentada con banda, inclinada al frente": "Forward Lean Band Seated Hip Abduction",
  "Hiperextensión a 45° con mancuerna": "Dumbbell 45-Degree Hyperextension",
  "Peso muerto rumano a una pierna con apoyo, con mancuerna": "Braced Dumbbell Single-Leg RDL",
  "Prensa de piernas": "Leg Press",
  "Sentadilla skater": "Skater Squat",
  "Hip thrust a una pierna con mancuerna": "Dumbbell Single-Leg Hip Thrust",
  "Patada de glúteo de pie con banda": "Band Standing Glute Kickback",
  "Abducción de cadera de pie con banda": "Band Standing Hip Abduction",
  "Peso muerto sumo": "Sumo Deadlift",
  "Sentadilla sumo con mancuerna": "Dumbbell Sumo Squat",
  "Zancada inversa con carga al frente": "Front-Loaded Reverse Lunge",
  "Zancada inversa en déficit con mancuernas": "Dumbbell Deficit Reverse Lunge",
  "Hip thrust con barra con pausa": "Pause Barbell Hip Thrust",
  "Hip thrust con mancuerna con pausa": "Pause Dumbbell Hip Thrust",
  "Elevación de cadera de lado con apoyo, rango extra": "Braced Extra Range Side-Lying Hip Raise",
  "Caminata lateral con banda": "Lateral Band Walk"
};

export const GUIA_GLUTEOS: Rutina = {
  titulo: "Guía de glúteos",
  subtitulo: "3 días por semana",
  opciones: ["Gimnasio", "En casa", "Mancuernas y bandas"],
  dias: [
    {
      dia: "Día 1",
      calentamiento: [],
      ejercicios: [
        ab(e("Stiff Leg Deadlift", "3 × 8", "3–5 min", ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~80%"]), e("Dumbbell Stiff Leg Deadlift", "3 × 12", "2–4 min")),
        ab(e("Front Squat", "3 × 5", "3–5 min", ["1 × 8 con ~50% de tu peso de trabajo", "1 × 5 con ~60%", "1 × 3 con ~75%"]), e("Goblet Squat", "3 × 12", "2–4 min")),
        { a: e("Barbell Hip Thrust Pulse", "3 × 15", "2–4 min"), b: e("Partner Hip Thrust", "3 × máximo de repeticiones", "2–4 min"), c: e("Dumbbell Hip Thrust Pulse", "3 × 20", "2–3 min") },
        a_bc(e("Cable Kneeling Glute Kickback", "2 × 10 por lado", "1–2 min"), e("Band Quadruped Hip Extension", "2 × 20 por lado", "1–2 min")),
        a_bc(e("Forward Lean Machine Seated Hip Abduction", "2 × 20", "1–2 min"), e("Forward Lean Band Seated Hip Abduction", "2 × 30", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 2",
      calentamiento: [],
      ejercicios: [
        a_bc(e("Dumbbell 45-Degree Hyperextension", "3 × 12", "2–4 min", ["1 × 8 con ~50% de tu peso de trabajo", "1 × 5 con ~70%"]), e("Braced Dumbbell Single-Leg RDL", "3 × 12 por lado", "2–4 min")),
        a_bc(e("Leg Press", "3 × 8", "3–5 min", ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~80%"]), e("Skater Squat", "3 × 10 por lado", "2–4 min")),
        todos(e("Dumbbell Single-Leg Hip Thrust", "3 × 8 por lado", "2–4 min")),
        todos(e("Band Standing Glute Kickback", "2 × 20 por lado", "1–2 min")),
        todos(e("Band Standing Hip Abduction", "2 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 3",
      calentamiento: [],
      ejercicios: [
        ab(e("Sumo Deadlift", "3 × 5", "3–5 min", ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~70%", "1 × 3 con ~80%"]), e("Dumbbell Sumo Squat", "3 × 12", "2–4 min")),
        ab(e("Front-Loaded Reverse Lunge", "3 × 5 por lado", "3–5 min", ["1 × 8 con ~50% de tu peso de trabajo", "1 × 5 con ~70%"]), e("Dumbbell Deficit Reverse Lunge", "3 × 10 por lado", "2–4 min")),
        { a: e("Pause Barbell Hip Thrust", "3 × 6 · 3 s arriba", "2–4 min", ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~80%"]), b: e("Pause Partner Hip Thrust", "3 × máximo de repeticiones · 3 s arriba", "2–4 min"), c: e("Pause Dumbbell Hip Thrust", "3 × 15 · 3 s arriba", "2–4 min") },
        todos(e("Braced Extra Range Side-Lying Hip Raise", "2 × 15 por lado", "1–2 min")),
        todos(e("Lateral Band Walk", "2 × 20 cada dirección", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
  ],
};

/** El calentamiento es un solo video de Cecy para todos los días. */
export const CALENTAMIENTO = "Calentamiento";

/** Todos los ejercicios distintos de una rutina, con los días en que aparecen. */
export function ejerciciosDe(r: Rutina) {
  const m = new Map<string, { dias: Set<string>; calentamiento: boolean }>();
  m.set(CALENTAMIENTO, { dias: new Set(r.dias.map((d) => d.dia)), calentamiento: true });
  for (const d of r.dias) {
    for (const f of d.ejercicios)
      for (const o of [f.a, f.b, f.c]) {
        if (!m.has(o.nombre)) m.set(o.nombre, { dias: new Set(), calentamiento: false });
        m.get(o.nombre)!.dias.add(d.dia);
      }
  }
  return [...m.entries()].map(([nombre, v]) => ({ nombre, dias: [...v.dias], calentamiento: v.calentamiento }));
}
