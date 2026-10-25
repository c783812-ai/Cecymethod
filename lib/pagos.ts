export const MONEDAS = ["EUR", "USD", "MXN"] as const;
export type Moneda = (typeof MONEDAS)[number];
export type Paquete = { id: string; patient_id: string; nombre: string; moneda: Moneda; total: number; inicio: string; fin?: string | null; nota: string | null };
export type Pago = { id: string; paquete_id: string; patient_id: string; fecha: string; monto: number; nota: string | null };

/** Los precios de la página principal, para no escribirlos cada vez. */
export const PRESETS: { nombre: string; precio: Record<Moneda, number>; meses?: number }[] = [
  { nombre: "Consulta online", precio: { EUR: 130, USD: 150, MXN: 2570 } },
  { nombre: "Programa 3 meses", precio: { EUR: 300, USD: 350, MXN: 5930 }, meses: 3 },
  { nombre: "Guía de glúteos", precio: { EUR: 20, USD: 23, MXN: 440 } },
];

export function dinero(n: number, m: Moneda) {
  const v = n.toLocaleString("es-MX", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  return m === "EUR" ? `€${v}` : m === "USD" ? `$${v} USD` : `$${v} MXN`;
}

/** Suma por moneda: { EUR: 300, MXN: 2570 }, sin mezclar monedas. */
export function porMoneda<T>(xs: T[], m: (x: T) => Moneda, v: (x: T) => number) {
  const r: Partial<Record<Moneda, number>> = {};
  for (const x of xs) r[m(x)] = (r[m(x)] ?? 0) + Number(v(x));
  return r;
}
export const textoMonedas = (r: Partial<Record<Moneda, number>>) =>
  MONEDAS.filter((m) => r[m]).map((m) => dinero(r[m]!, m)).join(" · ") || "—";

export function saldo(pq: Paquete, pagos: Pago[]) {
  const pagado = pagos.filter((p) => p.paquete_id === pq.id).reduce((s, p) => s + Number(p.monto), 0);
  return { pagado, pendiente: Math.max(0, Number(pq.total) - pagado) };
}

export const fechaCorta = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

/** Fecha (YYYY-MM-DD) que cae n meses después. */
export function masMeses(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}
