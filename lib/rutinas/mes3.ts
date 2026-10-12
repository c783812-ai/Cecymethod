import { a_bc, ab, e, todos } from "../gluteos";
import type { Rutina } from "../types";

const asc2 = ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~75%"];
const w50 = ["1 × 8 con ~50% de tu peso de trabajo"];

/** Mes 3: Lower Day 1, 2 y 3, con nombres en inglés y solo "Calentamiento". */
export const MES_3: Rutina = {
  titulo: "Guía de glúteos",
  subtitulo: "3 días por semana",
  opciones: ["Gimnasio", "En casa", "Mancuernas y bandas"],
  dias: [
    {
      dia: "Día 1",
      calentamiento: [],
      ejercicios: [
        ab(e("Barbell Hip Thrust", "1 × 20, 1 × 15, 1 × 10", "3–5 min", asc2), e("Dumbbell Hip Thrust", "3 × 15", "2–4 min")),
        ab(e("Pause Barbell Hip Thrust", "2 × 8 · 3 s arriba", "2–4 min"), e("Pause Dumbbell Hip Thrust", "2 × 12 · 3 s arriba", "2–4 min")),
        todos(e("Dumbbell Deficit Reverse Lunge", "3 × 6 por lado", "2–4 min", w50)),
        a_bc(e("Dumbbell 45-Degree Hyperextension", "3 × 12", "2–4 min"), e("Single-Leg Straight-Leg Bridge", "3 × al máximo por lado", "1–2 min")),
        todos(e("Extra Range Fire Hydrant", "2 × 15 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 2",
      calentamiento: [],
      ejercicios: [
        ab(e("Barbell Hip Thrust", "1 × 12, 1 × 10, 1 × 8", "3–5 min", asc2), e("Dumbbell Hip Thrust", "3 × 20", "2–4 min")),
        ab(e("Bar Plus Band Hip Thrust", "2 × 10", "2–4 min"), e("Dumbbell Plus Band Hip Thrust", "2 × 12", "2–4 min")),
        a_bc(e("Smith Machine Squat", "1 × 12, 1 × 10, 1 × 8", "3–5 min", w50), e("Dumbbell Between Bench Squat", "3 × 10", "2–4 min")),
        ab(e("Barbell RDL", "3 × 10", "2–4 min", w50), e("Dumbbell RDL", "3 × 12", "2–3 min")),
        a_bc(e("Cable Standing Glute Medius Kickback", "2 × 12 por lado", "1–2 min"), e("Band Standing Glute Medius Kickback", "3 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 3",
      calentamiento: [],
      ejercicios: [
        ab(e("Barbell Hip Thrust", "1 × 10, 1 × 8, 1 × 5", "3–5 min", ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~70%", "1 × 3 con ~80%"]), e("Dumbbell Hip Thrust", "3 × 12", "2–4 min")),
        ab(e("Barbell Hip Thrust Pulse", "2 × 20", "2–4 min"), e("Dumbbell Hip Thrust Pulse", "2 × 30", "2–4 min")),
        a_bc(e("Smith Machine Good Morning", "1 × 12, 1 × 10, 1 × 8", "2–4 min", w50), e("Band Lying Leg Curl", "3 × 12", "1–2 min")),
        ab(e("Glute Dominant Step-Up", "3 × 8 por lado", "2–4 min"), e("Skater Squat", "3 × 10 por lado", "2–4 min")),
        todos(e("Pause Dumbbell and Band Hip Hinge Abduction", "3 × 10 · 3 s", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
  ],
};
