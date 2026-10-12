import { a_bc, ab, e, todos } from "../gluteos";
import type { Rutina } from "../types";

/** Series de aproximación: w(50, 70) -> "1 × 8 con ~50% de tu peso de trabajo", "1 × 5 con ~70%". */
const REPS = [8, 5, 3];
const w = (...p: number[]) => p.map((x, i) => `1 × ${REPS[i]} con ~${x}%${i === 0 ? " de tu peso de trabajo" : ""}`);

/** Mes 8: Lower Day 1, 2 y 3, con nombres en inglés y solo "Calentamiento". */
export const MES_8: Rutina = {
  titulo: "Guía de glúteos",
  subtitulo: "3 días por semana",
  opciones: ["Gimnasio", "En casa", "Mancuernas y bandas"],
  dias: [
    {
      dia: "Día 1",
      calentamiento: [],
      ejercicios: [
        ab(e("Barbell Hip Thrust", "3 × 8", "3–5 min", ["Usa el mismo peso todo el mes y cada semana intenta sumar repeticiones", ...w(50, 70)]), e("Dumbbell Hip Thrust", "3 × 20", "2–4 min")),
        todos(e("Side-Lying Hip Raise", "3 × 12 por lado", "1–2 min")),
        ab(e("Barbell RDL", "3 × 10", "2–4 min", w(50)), e("Dumbbell RDL", "3 × 12", "2–4 min")),
        ab(e("Bodyweight High Step-Up", "3 × 10 por lado", "2–4 min"), e("Dumbbell Reverse Lunge", "3 × 20 por lado", "2–4 min")),
        a_bc(e("Cable Standing Glute Kickback", "2 × 12 por lado", "1–2 min"), e("Band Standing Glute Kickback", "2 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 2",
      calentamiento: [],
      ejercicios: [
        ab(e("Knee-Banded Bar Plus Band Hip Thrust", "3 × 8", "3–5 min", w(50)), e("Knee-Banded Dumbbell Hip Thrust", "3 × 15", "2–4 min")),
        a_bc(e("Forward Lean Machine Seated Hip Abduction", "3 × 15", "1–2 min"), e("Forward Lean Band Seated Hip Abduction", "3 × 30", "1–2 min")),
        a_bc(e("Dumbbell 45-Degree Hyperextension", "3 × 10", "2–4 min"), e("Dumbbell Lying Leg Curl", "3 × 10", "1–2 min")),
        a_bc(e("Leg Press", "3 × 10", "2–4 min", w(50)), e("Dumbbell Sumo Squat", "3 × 12", "2–4 min")),
        todos(e("Band Standing Hip Abduction", "2 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 3",
      calentamiento: [],
      ejercicios: [
        ab(e("Barbell Sumo Hip Thrust Pulse", "3 × 12", "3–5 min", w(50)), e("Dumbbell Sumo Hip Thrust Pulse", "3 × 20", "2–4 min")),
        todos(e("Bent Over Glute Medius Hip Thrust", "3 × 10 por lado", "1–2 min")),
        todos(e("Rotational B-Stance Dumbbell RDL", "3 × 10 por lado", "2–4 min")),
        ab(e("Back Squat", "3 × 8", "3–5 min", w(50)), e("Dumbbell Bulgarian Split Squat", "3 × 10 por lado", "2–4 min")),
        a_bc(e("Cable Kneeling Glute Kickback", "2 × 20 por lado", "1–2 min"), e("Band Quadruped Hip Extension", "2 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
  ],
};
