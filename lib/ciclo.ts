import { GUIA_GLUTEOS } from "./gluteos";
import type { Rutina } from "./types";

/**
 * Rutina del mes: todas las pacientes (y Cecy) hacen la misma rutina cada mes del calendario.
 * Cambia sola el día 1 de cada mes a las 12:00 AM (hora de la paciente) y, al terminar la lista, vuelve a empezar.
 * Para agregar un mes nuevo: se agrega aquí y Cecy toca "Actualizar" en Videos.
 */
export const CICLO: { key: string; rutina: Rutina }[] = [
  { key: "gluteos", rutina: GUIA_GLUTEOS },
];
export const CICLO_KEY = "ciclo";

// Octubre de 2026 es el Mes 1
const ANCLA = 2026 * 12 + 9;

export function mesDelCiclo(d = new Date(), n = CICLO.length) {
  const i = d.getFullYear() * 12 + d.getMonth() - ANCLA;
  return ((i % n) + n) % n;
}

/** "1 de noviembre": cuándo cambia a la siguiente rutina. */
export function proximoCambio(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toLocaleDateString("es-MX", { day: "numeric", month: "long" });
}
