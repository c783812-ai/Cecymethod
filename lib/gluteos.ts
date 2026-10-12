import type { Ejercicio, FilaRutina, Rutina } from "./types";

const e = (nombre: string, series: string, descanso: string, aproximacion?: string[]): Ejercicio =>
  aproximacion ? { nombre, series, descanso, aproximacion } : { nombre, series, descanso };
const todos = (x: Ejercicio): FilaRutina => ({ a: x, b: x, c: x });
const ab = (x: Ejercicio, c: Ejercicio): FilaRutina => ({ a: x, b: x, c });
const a_bc = (a: Ejercicio, bc: Ejercicio): FilaRutina => ({ a, b: bc, c: bc });

export const GUIA_GLUTEOS: Rutina = {
  titulo: "Guía de glúteos",
  subtitulo: "3 días por semana",
  opciones: ["Gimnasio", "En casa", "Mancuernas y bandas"],
  dias: [
    {
      dia: "Día 1",
      calentamiento: [
        ["Estiramiento dinámico de flexores de cadera e isquiotibiales", "2 × 8 por lado"],
        ["Enhebrar la aguja", "2 × 8 por lado"],
        ["Limpiaparabrisas lumbar", "2 × 10 por lado"],
        ["Apretar glúteos de pie", "2 × 30 s"],
      ],
      ejercicios: [
        ab(e("Peso muerto con piernas rígidas", "3 × 8", "3–5 min", ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~80%"]), e("Peso muerto con piernas rígidas con mancuernas", "3 × 12", "2–4 min")),
        ab(e("Sentadilla frontal", "3 × 5", "3–5 min", ["1 × 8 con ~50% de tu peso de trabajo", "1 × 5 con ~60%", "1 × 3 con ~75%"]), e("Sentadilla goblet", "3 × 12", "2–4 min")),
        { a: e("Hip thrust con barra en pulsos", "3 × 15", "2–4 min"), b: e("Hip thrust con compañera", "3 × máximo de repeticiones", "2–4 min"), c: e("Hip thrust con mancuerna en pulsos", "3 × 20", "2–3 min") },
        a_bc(e("Patada de glúteo en polea, de rodillas", "2 × 10 por lado", "1–2 min"), e("Extensión de cadera en cuadrupedia con banda", "2 × 20 por lado", "1–2 min")),
        a_bc(e("Abducción de cadera en máquina, inclinada al frente", "2 × 20", "1–2 min"), e("Abducción de cadera sentada con banda, inclinada al frente", "2 × 30", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 3",
      calentamiento: [
        ["Gato-vaca", "3 × 10 cada dirección"],
        ["Rodilla al pecho con rotación", "3 × 8 cada dirección"],
        ["Caminata lateral con banda", "3 × 10 cada dirección"],
      ],
      ejercicios: [
        a_bc(e("Hiperextensión a 45° con mancuerna", "3 × 12", "2–4 min", ["1 × 8 con ~50% de tu peso de trabajo", "1 × 5 con ~70%"]), e("Peso muerto rumano a una pierna con apoyo, con mancuerna", "3 × 12 por lado", "2–4 min")),
        a_bc(e("Prensa de piernas", "3 × 8", "3–5 min", ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~80%"]), e("Sentadilla skater", "3 × 10 por lado", "2–4 min")),
        todos(e("Hip thrust a una pierna con mancuerna", "3 × 8 por lado", "2–4 min")),
        todos(e("Patada de glúteo de pie con banda", "2 × 20 por lado", "1–2 min")),
        todos(e("Abducción de cadera de pie con banda", "2 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 5",
      calentamiento: [
        ["Bird dog", "2 × 6 por lado"],
        ["Balanceo de pierna adelante y atrás", "2 × 12 por pierna"],
        ["Balanceo de pierna de lado a lado", "2 × 12 cada dirección"],
      ],
      ejercicios: [
        ab(e("Peso muerto sumo", "3 × 5", "3–5 min", ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~70%", "1 × 3 con ~80%"]), e("Sentadilla sumo con mancuerna", "3 × 12", "2–4 min")),
        ab(e("Zancada inversa con carga al frente", "3 × 5 por lado", "3–5 min", ["1 × 8 con ~50% de tu peso de trabajo", "1 × 5 con ~70%"]), e("Zancada inversa en déficit con mancuernas", "3 × 10 por lado", "2–4 min")),
        { a: e("Hip thrust con barra con pausa", "3 × 6 · 3 s arriba", "2–4 min", ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~80%"]), b: e("Hip thrust con compañera con pausa", "3 × máximo de repeticiones · 3 s arriba", "2–4 min"), c: e("Hip thrust con mancuerna con pausa", "3 × 15 · 3 s arriba", "2–4 min") },
        todos(e("Elevación de cadera de lado con apoyo, rango extra", "2 × 15 por lado", "1–2 min")),
        todos(e("Caminata lateral con banda", "2 × 20 cada dirección", "1–2 min")),
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
