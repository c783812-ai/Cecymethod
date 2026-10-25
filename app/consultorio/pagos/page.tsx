import { requireNutri } from "@/lib/auth";
import type { Pago, Paquete } from "@/lib/pagos";
import ResumenPagos from "./ResumenPagos";

export const metadata = { title: "Pagos · Cecy" };

export default async function PagosResumen() {
  const { sb } = await requireNutri();
  const [{ data: ps }, { data: pqs, error }, { data: pgs }] = await Promise.all([
    sb.from("patients").select("id, nombre").order("nombre"),
    sb.from("paquetes").select("*").order("inicio", { ascending: false }),
    sb.from("pagos").select("*").order("fecha", { ascending: false }),
  ]);
  return <ResumenPagos pacientes={ps ?? []} paquetes={(pqs ?? []) as Paquete[]} pagos={(pgs ?? []) as Pago[]} falta={!!error} />;
}
