import { GUIA_GLUTEOS } from "./gluteos";
import type { Rutina } from "./types";
import { MES_2 } from "./rutinas/mes2";
import { MES_3 } from "./rutinas/mes3";
import { MES_4 } from "./rutinas/mes4";
import { MES_5 } from "./rutinas/mes5";
import { MES_6 } from "./rutinas/mes6";

/**
 * Rutina del mes: todas las pacientes (y Cecy) hacen la misma rutina cada mes del calendario.
 * Cambia sola el día 1 de cada mes a las 12:00 AM (hora de la paciente) y, al terminar la lista, vuelve a empezar.
 * Para agregar un mes nuevo: se agrega aquí y Cecy toca "Actualizar" en Videos.
 */
export const CICLO: { key: string; rutina: Rutina }[] = [
  { key: "gluteos", rutina: GUIA_GLUTEOS },
  { key: "mes-2", rutina: MES_2 },
  { key: "mes-3", rutina: MES_3 },
  { key: "mes-4", rutina: MES_4 },
  { key: "mes-5", rutina: MES_5 },
  { key: "mes-6", rutina: MES_6 },
];
export const CICLO_KEY = "ciclo";

// Noviembre de 2026 es el Mes 1 (octubre también usa el Mes 1, mientras arrancan las pacientes); diciembre es el Mes 2.
const ANCLA = 2026 * 12 + 10;
const indice = (d: Date) => Math.max(0, d.getFullYear() * 12 + d.getMonth() - ANCLA);

export function mesDelCiclo(d = new Date(), n = CICLO.length) {
  return indice(d) % n;
}

/** "1 de diciembre": cuándo cambia a la siguiente rutina. */
export function proximoCambio(d = new Date()) {
  const meses = indice(d) === 0 && d.getFullYear() * 12 + d.getMonth() < ANCLA ? 2 : 1;
  return new Date(d.getFullYear(), d.getMonth() + meses, 1).toLocaleDateString("es-MX", { day: "numeric", month: "long" });
}
