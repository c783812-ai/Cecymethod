import { a_bc, ab, e, todos } from "../gluteos";
import type { Rutina } from "../types";

/** Series de aproximación: w(60, 75) -> "1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~75%". */
const REPS = [8, 5, 3];
const w = (...p: number[]) => p.map((x, i) => `1 × ${REPS[i]} con ~${x}%${i === 0 ? " de tu peso de trabajo" : ""}`);

/** Mes 4: Lower Day 1, 2 y 3, con nombres en inglés y solo "Calentamiento". */
export const MES_4: Rutina = {
  titulo: "Guía de glúteos",
  subtitulo: "3 días por semana",
  opciones: ["Gimnasio", "En casa", "Mancuernas y bandas"],
  dias: [
    {
      dia: "Día 1",
      calentamiento: [],
      ejercicios: [
        { a: e("Plate Loaded Sumo RDL", "3 × 10", "2–4 min", w(60, 75)), b: e("Barbell Sumo RDL", "3 × 10", "2–4 min", w(60, 75)), c: e("Dumbbell Sumo RDL", "3 × 12", "2–4 min") },
        todos(e("Deficit Dumbbell Curtsy Lunge", "3 × 12 por lado", "2–4 min")),
        todos(e("Pause Dumbbell Single-Leg Hip Thrust Pulse", "3 × 10 por lado · 1 s arriba", "2–4 min")),
        todos(e("Dumbbell Side-Lying Clam", "3 × 12 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 2",
      calentamiento: [],
      ejercicios: [
        a_bc(e("Forward Lean Machine Seated Hip Abduction", "3 × 20", "1–2 min"), e("Side-Lying Hip Raise", "3 × 12 por lado", "1–2 min")),
        ab(e("Eccentric-Accentuated Barbell Hip Thrust", "3 × 10 · bajar en 4 s", "2–4 min"), e("Dumbbell Hip Thrust", "3 × 20", "2–3 min")),
        { a: e("Smith Machine Sumo Squat", "3 × 6", "3–5 min", w(60, 75)), b: e("Barbell Sumo Squat", "3 × 6", "3–5 min"), c: e("Dumbbell Sumo Squat", "3 × 12", "2–4 min") },
        { a: e("Band 45-Degree Hyperextension", "3 × 15", "2–4 min"), b: e("Dumbbell 45-Degree Hyperextension", "3 × 12", "2–4 min"), c: e("B-Stance Dumbbell RDL", "3 × 12 por lado", "2–4 min") },
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 3",
      calentamiento: [],
      ejercicios: [
        todos(e("Rotational Contralateral Dumbbell Single-Leg RDL", "3 × 10 por lado", "2–4 min", w(50))),
        a_bc(e("Sumo Leg Press", "3 × 8", "2–4 min", w(60, 75)), e("Tempo Dumbbell Sumo Squat", "3 × 5 · bajar en 5 s y 3 s abajo", "2–4 min")),
        ab(e("Knee-Banded Barbell Hip Thrust", "3 × 15", "2–4 min"), e("Knee-Banded Dumbbell Hip Thrust", "3 × 20", "2–3 min")),
        ab(e("Plate Bent Over Glute Medius Hip Thrust", "3 × 12 por lado", "1–2 min"), e("Bodyweight Bent Over Glute Medius Hip Thrust", "3 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
  ],
};
