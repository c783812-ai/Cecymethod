import { requireNutri } from "@/lib/auth";
import type { Pago, Paquete } from "@/lib/pagos";
import type { Consulta } from "@/lib/mes";
import MiMes from "./MiMes";

export const metadata = { title: "Mi mes · Cecy" };

export default async function MesPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m: q } = await searchParams;
  const actual = new Date().toISOString().slice(0, 7);
  const m = q && /^\d{4}-\d{2}$/.test(q) && q <= actual ? q : actual;
  const { sb } = await requireNutri();
  const [{ data: ps }, { data: pqs }, { data: pgs }, { data: cs }] = await Promise.all([
    sb.from("patients").select("*"),
    sb.from("paquetes").select("*"),
    sb.from("pagos").select("*"),
    sb.from("consultas").select("patient_id, fecha, tipo"),
  ]);
  return <MiMes m={m} actual={actual} pacientes={ps ?? []} paquetes={(pqs ?? []) as Paquete[]} pagos={(pgs ?? []) as Pago[]} consultas={(cs ?? []) as Consulta[]} />;
}
