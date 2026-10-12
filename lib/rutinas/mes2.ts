import { a_bc, ab, e } from "../gluteos";
import type { Rutina } from "../types";

const asc = ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~70%", "1 × 3 con ~80%"];

/** Mes 2: tres días de pierna y glúteo (Lower Day 1, 2 y 3), con nombres en inglés y solo "Calentamiento". */
export const MES_2: Rutina = {
  titulo: "Guía de glúteos",
  subtitulo: "3 días por semana",
  opciones: ["Gimnasio", "En casa", "Mancuernas y bandas"],
  dias: [
    {
      dia: "Día 1",
      calentamiento: [],
      ejercicios: [
        ab(e("Back Squat", "3 × 5", "3–5 min", asc), e("Deficit Dumbbell Bulgarian Split Squat", "3 × 8 por lado", "2–4 min")),
        a_bc(e("Seated Leg Curl", "3 × 10", "1–2 min"), e("Dumbbell Lying Leg Curl", "3 × 12", "1–2 min")),
        ab(e("Pause Barbell Hip Thrust", "3 × 6 · 3 s arriba", "2–4 min", ["1 × 8 con ~60% de tu peso de trabajo", "1 × 5 con ~70%"]), e("Pause Dumbbell Hip Thrust", "3 × 12 · 3 s arriba", "2–3 min")),
        a_bc(e("Forward Lean Machine Seated Hip Abduction", "3 × 20", "1–2 min"), e("Side-Lying Hip Raise", "3 × 12 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 2",
      calentamiento: [],
      ejercicios: [
        ab(e("Sumo Barbell Box Squat", "3 × 5", "3–5 min", asc), e("Between Bench Dumbbell Sumo Squat", "3 × 12", "2–4 min")),
        a_bc(e("Dumbbell Single-Leg 45-Degree Hyperextension", "3 × 12 por lado", "2–3 min"), e("Braced Dumbbell Single-Leg Stiff Leg Deadlift", "3 × 10 por lado", "2–3 min")),
        ab(e("Barbell Hip Thrust Pulse", "3 × 20", "2–4 min"), e("Dumbbell Hip Thrust Pulse", "3 × 30", "2–3 min")),
        a_bc(e("Cable Standing Glute Medius Kickback", "3 × 12 por lado", "1–2 min"), e("Band Standing Glute Medius Kickback", "3 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
    {
      dia: "Día 3",
      calentamiento: [],
      ejercicios: [
        { a: e("Front Squat", "3 × 5", "3–5 min", asc), b: e("High Step-Up", "3 × 10 por lado", "2–4 min"), c: e("Dumbbell Reverse Lunge", "3 × 10 por lado", "2–4 min") },
        ab(e("Good Morning", "3 × 10", "2–4 min", ["1 × 8 con ~50% de tu peso de trabajo"]), e("Dumbbell Stiff Leg Deadlift", "3 × 10", "2–4 min")),
        a_bc(e("Bar Plus Band Hip Thrust", "3 × 12", "2–4 min", ["1 × 8 con ~50% de tu peso de trabajo"]), e("Foot-Elevated Single-Leg Hip Thrust", "3 × 12 por lado", "2–3 min")),
        ab(e("Ankle Weight Side-Lying Hip Raise", "3 × 10 por lado", "1–2 min"), e("Braced Extra Range Side-Lying Hip Raise", "3 × 20 por lado", "1–2 min")),
      ],
      cierre: "10 minutos libres",
    },
  ],
};
