import { MONEDAS, porMoneda, type Moneda, type Pago, type Paquete } from "./pagos";

export const ORIGENES: [string, string][] = [
  ["reel", "Instagram: un reel"],
  ["instagram", "Instagram: otro (perfil, historias, mensaje)"],
  ["whatsapp", "WhatsApp: catálogo o estado"],
  ["recomendacion", "Recomendación de alguien"],
  ["web", "Mi página web"],
  ["otro", "Otro"],
];
export const nombreOrigen = (k?: string | null) => ORIGENES.find(([x]) => x === k)?.[1] ?? "Sin anotar";

export type Consulta = { patient_id: string; fecha: string; tipo: string };

export const mesAntes = (m: string) => { const d = new Date(`${m}-15T12:00:00`); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); };
export const mesDespues = (m: string) => { const d = new Date(`${m}-15T12:00:00`); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 7); };
export const tituloMes = (m: string) => { const t = new Date(`${m}-15T12:00:00`).toLocaleDateString("es-MX", { month: "long", year: "numeric" }); return t[0].toUpperCase() + t.slice(1); };

/** Cobrado por moneda en un mes, y cuánto cambió contra el mes anterior. */
export function cobrado(pagos: Pago[], paquetes: Paquete[], m: string) {
  const moneda = new Map(paquetes.map((p) => [p.id, p.moneda]));
  const suma = (mm: string) => porMoneda(pagos.filter((p) => p.fecha.startsWith(mm)), (p) => moneda.get(p.paquete_id) ?? "EUR", (p) => p.monto);
  const hoy = suma(m), antes = suma(mesAntes(m));
  return MONEDAS.filter((k) => hoy[k] || antes[k]).map((k: Moneda) => {
    const a = hoy[k] ?? 0, b = antes[k] ?? 0;
    return { moneda: k, mes: a, antes: b, cambio: b ? Math.round(((a - b) / b) * 100) : null };
  });
}

/** Consultas del mes por tipo, quiénes son nuevas y de dónde llegaron. */
export function consultasDelMes(cs: Consulta[], pacientes: { id: string; nombre: string; origen?: string | null }[], m: string) {
  const delMes = cs.filter((c) => c.fecha.startsWith(m));
  const nombre = new Map(pacientes.map((p) => [p.id, p]));
  const nuevas = [...new Set(delMes.filter((c) => c.tipo === "primera").map((c) => c.patient_id))].map((id) => nombre.get(id)).filter((p): p is NonNullable<typeof p> => !!p);
  const renovaron = [...new Set(delMes.filter((c) => c.tipo === "renovacion").map((c) => c.patient_id))].map((id) => nombre.get(id)?.nombre).filter(Boolean) as string[];
  const origenes = new Map<string, number>();
  for (const p of nuevas) origenes.set(nombreOrigen(p.origen), (origenes.get(nombreOrigen(p.origen)) ?? 0) + 1);
  return {
    total: delMes.length,
    primera: delMes.filter((c) => c.tipo === "primera").length,
    seguimiento: delMes.filter((c) => c.tipo === "seguimiento").length,
    renovacion: delMes.filter((c) => c.tipo === "renovacion").length,
    nuevas: nuevas.map((p) => p.nombre),
    renovaron,
    origenes: [...origenes.entries()].sort((a, b) => b[1] - a[1]),
  };
}

/** De dónde llegaron todas tus pacientes (de siempre). */
export function origenesTodas(pacientes: { origen?: string | null }[]) {
  const r = new Map<string, number>();
  for (const p of pacientes) r.set(nombreOrigen(p.origen), (r.get(nombreOrigen(p.origen)) ?? 0) + 1);
  return [...r.entries()].sort((a, b) => (a[0] === "Sin anotar" ? 1 : b[0] === "Sin anotar" ? -1 : b[1] - a[1]));
}
