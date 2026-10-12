import { a_bc, ab, e, todos } from "../gluteos";
import type { Rutina } from "../types";

/** Series de aproximación: w(60, 80) -> "1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~80%". */
const REPS = [8, 5, 3];
const w = (...p: number[]) => p.map((x, i) => `1 × ${REPS[i]} con ~${x}%${i === 0 ? " de tu peso de trabajo" : ""}`);

/** Mes 4: Day 1, 3 y 5 de su programa (aquí Día 1, 2 y 3), con nombres en inglés y solo "Calentamiento". */
export const MES_4: Rutina = {
  titulo: "Guía de glúteos",
  subtitulo: "3 días por semana",
  opciones: ["Gimnasio", "En casa", "Mancuernas y bandas"],
  dias: [
    {
      dia: "Día 1",
      calentamiento: [],
      ejercicios: [
        ab(e("Stiff Leg Deadlift", "3 × 8", "3–5 min", w(60, 80)), e("Dumbbell Stiff Leg Deadlift", "3 × 12", "2–4 min")),
        ab(e("Front Squat", "3 × 5", "3–5 min", w(50, 60, 75)), e("Goblet Squat", "3 × 12", "2–4 min")),
        { a: e("Barbell Hip Thrust Pulse", "3 × 15", "2–4 min"), b: e("Partner Hip Thrust", "3 × al máximo", "2–4 min"), c: e("Dumbbell Hip Thrust Pulse", "3 × 20", "2–3 min") },
        a_bc(e("Cable Kneeling Glute Kickback", "2 × 10 por lado", "1–2 min"), e("Band Quadruped Hip Extension", "2 × 20 por lado", "1–2 min")),
        a_bc(e("Forward Lean Machine Seated Hip Abduction", "2 × 20", "1–2 min"), e("Forward Lean Band Seated Hip Abduction", "2 × 30", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 2",
      calentamiento: [],
      ejercicios: [
        a_bc(e("Dumbbell 45-Degree Hyperextension", "3 × 12", "2–4 min", w(50, 70)), e("Braced Dumbbell Single-Leg RDL", "3 × 12 por lado", "2–4 min")),
        a_bc(e("Leg Press", "3 × 8", "3–5 min", w(60, 80)), e("Skater Squat", "3 × 10 por lado", "2–4 min")),
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
        ab(e("Sumo Deadlift", "3 × 5", "3–5 min", w(60, 70, 80)), e("Dumbbell Sumo Squat", "3 × 12", "2–4 min")),
        ab(e("Front-Loaded Reverse Lunge", "3 × 5 por lado", "3–5 min", w(50, 70)), e("Dumbbell Deficit Reverse Lunge", "3 × 10 por lado", "2–4 min")),
        { a: e("Pause Barbell Hip Thrust", "3 × 6 · 3 s arriba", "2–4 min", w(60, 80)), b: e("Pause Partner Hip Thrust", "3 × al máximo · 3 s arriba", "2–4 min"), c: e("Pause Dumbbell Hip Thrust", "3 × 15 · 3 s arriba", "2–4 min") },
        todos(e("Braced Extra Range Side-Lying Hip Raise", "2 × 15 por lado", "1–2 min")),
        todos(e("Lateral Band Walk", "2 × 20 hacia cada lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
  ],
};
