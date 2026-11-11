import { requireNutri } from "@/lib/auth";
import type { Patient } from "@/lib/types";
import type { Pago, Paquete } from "@/lib/pagos";
import Link from "next/link";
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
  const nuevas = ((ps ?? []) as Patient[]).filter((p) => p.estado === "nueva");
  const tablero = <Tablero pacientes={(ps ?? []) as Patient[]} paquetes={(pqs ?? []) as Paquete[]} pagos={(pgs ?? []) as Pago[]} planes={(planes ?? []) as { patient_id: string; created_at: string }[]} hoy={new Date().toISOString()} />;
  if (!nuevas.length) return tablero;
  return (
    <>
      <div className="card solicitud" style={{ margin: "16px 20px 0" }}>
        <h3 style={{ margin: 0 }}>Se registraron en tu página ({nuevas.length})</h3>
        <p className="note" style={{ margin: "4px 0 8px" }}>Cuando veas su pago, entra a su ficha y toca “Ya pagó: activar”.</p>
        {nuevas.map((p) => <div key={p.id}><Link href={`/consultorio/${p.id}`}><b>{p.nombre}</b></Link> <span className="note">· {p.paquete_pedido ?? ""}</span></div>)}
      </div>
      {tablero}
    </>
  );
}
