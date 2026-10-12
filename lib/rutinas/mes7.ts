import { a_bc, ab, e, todos } from "../gluteos";
import type { Rutina } from "../types";

/** Series de aproximación: w(50, 60, 75) -> "1 × 8 con ~50% de tu peso de trabajo", "1 × 5 con ~60%", "1 × 3 con ~75%". */
const REPS = [8, 5, 3];
const w = (...p: number[]) => p.map((x, i) => `1 × ${REPS[i]} con ~${x}%${i === 0 ? " de tu peso de trabajo" : ""}`);

/** Mes 7: Lower Day 1, 2 y 3, con nombres en inglés y solo "Calentamiento". */
export const MES_7: Rutina = {
  titulo: "Guía de glúteos",
  subtitulo: "3 días por semana",
  opciones: ["Gimnasio", "En casa", "Mancuernas y bandas"],
  dias: [
    {
      dia: "Día 1",
      calentamiento: [],
      ejercicios: [
        ab(e("Barbell Box Squat", "3 × 6", "3–5 min", w(50, 60, 75)), e("Dumbbell Squat", "3 × 12", "2–4 min")),
        a_bc(e("Seated Leg Curl", "3 × 10", "1–2 min"), e("Dumbbell Lying Leg Curl", "3 × 12", "1–2 min")),
        ab(e("Barbell Hip Thrust 1 1/4", "3 × 6", "2–4 min", w(50)), e("Dumbbell Hip Thrust 1 1/4", "3 × 15", "2–4 min")),
        todos(e("Side-Lying Hip Raise", "3 × 12 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 2",
      calentamiento: [],
      ejercicios: [
        a_bc(e("Smith Machine Deficit Reverse Lunge", "2 × 10 por lado", "2–4 min", w(50, 70)), e("Dumbbell Deficit Reverse Lunge", "2 × 10 por lado", "2–4 min")),
        a_bc(e("Dumbbell 45-Degree Hyperextension", "3 × 12", "2–4 min"), e("Braced Dumbbell Single-Leg Stiff Leg Deadlift", "2 × 10 por lado", "2–4 min")),
        todos(e("Knee-Banded Out-In Bodyweight Hip Thrust", "3 × 20", "2–4 min")),
        a_bc(e("Machine Glute Kickback", "3 × 10 por lado", "1–2 min"), e("Band Standing Glute Kickback", "3 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 3",
      calentamiento: [],
      ejercicios: [
        ab(e("Back Squat", "3 × 8", "3–5 min", w(50, 60, 75)), e("Goblet Squat", "3 × 15", "2–4 min")),
        ab(e("Barbell RDL", "3 × 10", "2–4 min", w(50)), e("Braced Dumbbell Single-Leg RDL", "2 × 10 por lado", "2–4 min")),
        ab(e("Pause Barbell Hip Thrust", "3 × 8 · 1 s arriba", "2–4 min", w(50)), e("Pause Dumbbell Hip Thrust", "3 × 20 · 1 s arriba", "2–4 min")),
        a_bc(e("Machine Seated Hip Abduction", "3 × 20", "1–2 min"), e("Band Seated Hip Abduction", "3 × 50", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
  ],
};
