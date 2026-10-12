import { a_bc, ab, e, todos } from "../gluteos";
import type { Rutina } from "../types";

/** Series de aproximación: w(50, 60, 80) -> "1 × 8 con ~50% de tu peso de trabajo", "1 × 5 con ~60%", "1 × 3 con ~80%". */
const REPS = [8, 5, 3];
const w = (...p: number[]) => p.map((x, i) => `1 × ${REPS[i]} con ~${x}%${i === 0 ? " de tu peso de trabajo" : ""}`);
const fuerte = w(50, 60, 80);

/** Mes 6: Lower Day 1, 2 y 3, con nombres en inglés y solo "Calentamiento". */
export const MES_6: Rutina = {
  titulo: "Guía de glúteos",
  subtitulo: "3 días por semana",
  opciones: ["Gimnasio", "En casa", "Mancuernas y bandas"],
  dias: [
    {
      dia: "Día 1",
      calentamiento: [],
      ejercicios: [
        ab(e("Back Squat", "1 × 5, 1 × 3, 1 × 1", "3–5 min", fuerte), e("Heels-Elevated Goblet Squat", "3 × 12", "2–4 min")),
        ab(e("Conventional Deadlift", "1 × 5, 1 × 3, 1 × 1", "3–5 min", fuerte), e("Dumbbell Stiff Leg Deadlift", "3 × 12", "2–4 min")),
        ab(e("Hinge Barbell Hip Thrust", "1 × 5, 1 × 3, 1 × 1", "3–5 min", fuerte), e("Pause Dumbbell Hip Thrust", "3 × 12 · 3 s arriba", "2–4 min")),
        todos(e("Knee-Banded Feet-Elevated Bodyweight Hip Thrust", "3 × 20", "2–4 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 2",
      calentamiento: [],
      ejercicios: [
        ab(e("Smith Machine Deficit Reverse Lunge", "2 × 10 por lado", "2–4 min", w(50, 60)), e("Dumbbell Reverse Lunge", "2 × 10 por lado", "2–4 min")),
        a_bc(e("Barbell 45-Degree Hyperextension", "2 × 10", "2–4 min", w(50, 60)), e("Braced Dumbbell Single-Leg RDL", "2 × 10 por lado", "2–4 min")),
        ab(e("Pause Barbell Hip Thrust", "4 × 5 · 5 s arriba", "3–5 min", w(50, 60)), e("Dumbbell Single-Leg Hip Thrust", "3 × 8 por lado", "2–4 min")),
        a_bc(e("Cable Standing Glute Medius Kickback", "3 × 12 por lado", "1–2 min"), e("Band Standing Glute Medius Kickback", "3 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 3",
      calentamiento: [],
      ejercicios: [
        ab(e("Front Squat", "1 × 8, 1 × 5, 1 × 3", "3–5 min", fuerte), e("Dumbbell Sumo Squat", "3 × 12", "2–4 min")),
        ab(e("Sumo Deadlift", "1 × 8, 1 × 5, 1 × 3", "3–5 min", fuerte), e("Dumbbell Sumo RDL", "3 × 12", "2–4 min")),
        ab(e("Scoop Barbell Hip Thrust", "1 × 8, 1 × 5, 1 × 3", "3–5 min", fuerte), e("Bodyweight Foot-Elevated Single-Leg Hip Thrust", "3 × al máximo por lado", "2–4 min")),
        a_bc(e("Forward Lean Machine Seated Hip Abduction", "3 × 20", "1–2 min"), e("Side-Lying Hip Raise", "3 × 12 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
  ],
};
