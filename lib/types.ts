export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;
export const DIAS7 = [...DIAS, "Domingo"] as const;
export type Dia = (typeof DIAS7)[number];
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
import type { Meta } from "./diario";
import type { Genero } from "./paciente";

/** detalle: texto libre (o cómo prepararlo si hay ingredientes). */
export type Comida = { titulo: string; detalle: string; ingredientes?: Ingrediente[]; recomendacion?: string };
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
  menu: Record<Dia, Comida[]>; // 5 comidas por día; los planes viejos no traen Domingo
  domingo: string; // texto del domingo libre, cuando el domingo no tiene menú
  suplementos: Suplemento[];
  tips: Tip[];
  sistema?: Sistema; // de qué lista salen los cambios; smae si no se dice
  agua?: number; // vasos de 250 ml al día
  meta?: Meta; // la barrita de avance del día
  genero?: Genero; // "m": los textos de la app van en masculino y no sale lo del ciclo
  evitar?: string[]; // grupos de lib/paciente EVITAR que no salen en "Cambiar" ni en antojos
  evitar_otros?: string[]; // palabras sueltas que tampoco salen (por ejemplo "betabel")
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
  suplementos_visible?: boolean; // puede ver la pestaña Suplementos (columna de la migración 0004)
  invitada_at: string | null;
  diario_consentido_at?: string | null; // aceptó compartir su diario con Cecy
  estado?: "activa" | "pausa" | "termino"; // migración 0007; sin columna cuenta como activa
  cita_at?: string | null; // fecha y hora exacta de la próxima consulta (migración 0007)
  ultima_visita?: string | null; // última vez que abrió la app (migración 0005)
  created_at: string;
};

/** El domingo tiene menú solo si Cecy le puso platillos; si no, es domingo libre. */
export const tieneDomingo = (p: Plan) => !!p.menu.Domingo?.some((m) => m?.titulo?.trim());
export const diasDe = (p: Plan): readonly Dia[] => (tieneDomingo(p) ? DIAS7 : DIAS);

export function planVacio(): Plan {
  const menu = Object.fromEntries(DIAS7.map((d) => [d, TIEMPOS.map(() => ({ titulo: "", detalle: "" }))])) as Record<Dia, Comida[]>;
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
