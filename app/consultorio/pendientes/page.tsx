import { requireNutri } from "@/lib/auth";
import type { Patient } from "@/lib/types";
import type { Pago, Paquete } from "@/lib/pagos";
import Tablero from "./Tablero";

export const metadata = { title: "Pendientes · Cecy" };

export default async function Pendientes() {
  const { sb } = await requireNutri();
  const [{ data: ps }, { data: pqs }, { data: pgs }, { data: planes }] = await Promise.all([
    sb.from("patients").select("*").order("nombre"),
    sb.from("paquetes").select("*"),
    sb.from("pagos").select("*"),
    sb.from("plans").select("patient_id, created_at").eq("activo", true),
  ]);
  return <Tablero pacientes={(ps ?? []) as Patient[]} paquetes={(pqs ?? []) as Paquete[]} pagos={(pgs ?? []) as Pago[]} planes={(planes ?? []) as { patient_id: string; created_at: string }[]} hoy={new Date().toISOString()} />;
}
