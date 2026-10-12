export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;
export type Dia = (typeof DIAS)[number];
export const TIEMPOS = [
  ["Desayuno", "8:00"],
  ["Colación 1", "11:00"],
  ["Comida", "14:00"],
  ["Colación 2", "17:00"],
  ["Cena", "20:00"],
] as const;
export const GRUPOS = ["Verduras", "Frutas", "Cereales", "Leguminosas", "Proteína", "Lácteos", "Grasas"] as const;
export const COLORES = ["rosa", "azul", "amarillo", "verde", "lila"] as const;
export type Color = (typeof COLORES)[number];

import type { Ingrediente, Sistema } from "./alimentos";

/** detalle: texto libre (o cómo prepararlo si hay ingredientes). imagen: nombre de una foto de public/platos. */
export type Comida = { titulo: string; detalle: string; ingredientes?: Ingrediente[]; imagen?: string };
export type Enfoque = { icono: string; titulo: string; texto: string; color: Color };
export type Suplemento = { que: string; cuanto: string; cuando: string };
export type Tip = { icono: string; titulo: string; texto: string; color: Color };

export type Plan = {
  titulo: string;
  inicio: string;
  proxima_revision: string;
  objetivo: string;
  kcal: string;
  proteina: string;
  horarios: string[]; // 5 horas, una por tiempo de comida
  enfoques: Enfoque[];
  porciones: Record<string, (number | null)[]>; // grupo -> 5 valores
  menu: Record<Dia, Comida[]>; // 5 comidas por día
  domingo: string;
  suplementos: Suplemento[];
  tips: Tip[];
  sistema?: Sistema; // de qué lista salen los cambios; smae si no se dice
};

export type Ejercicio = { nombre: string; series: string; descanso: string; aproximacion?: string[] };
export type FilaRutina = { a: Ejercicio; b: Ejercicio; c: Ejercicio };
export type DiaRutina = { dia: string; calentamiento: [string, string][]; ejercicios: FilaRutina[]; cierre?: string };
export type Rutina = { titulo: string; subtitulo: string; opciones: [string, string, string]; dias: DiaRutina[] };

export type Patient = {
  id: string;
  user_id: string | null;
  email: string;
  nombre: string;
  ciudad: string | null;
  proxima_cita: string | null;
  metas: string[];
  plan_visible: boolean;
  routine_key: string | null;
  routine_visible: boolean;
  invitada_at: string | null;
  created_at: string;
};

export function planVacio(): Plan {
  const menu = Object.fromEntries(DIAS.map((d) => [d, TIEMPOS.map(() => ({ titulo: "", detalle: "" }))])) as Record<Dia, Comida[]>;
  return {
    titulo: "Plan 1 · Nutrición basada en tus análisis",
    inicio: "",
    proxima_revision: "",
    objetivo: "",
    kcal: "",
    proteina: "",
    horarios: TIEMPOS.map((t) => t[1]),
    enfoques: [],
    porciones: Object.fromEntries(GRUPOS.map((g) => [g, [null, null, null, null, null]])),
    menu,
    domingo: "Repite tu día favorito o arma tus comidas con la guía del plato. Si comes fuera, usa tu mano para medir.",
    suplementos: [],
    tips: [],
  };
}
