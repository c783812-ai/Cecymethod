import { requireNutri } from "@/lib/auth";
import type { Patient } from "@/lib/types";
import { hoyISO } from "@/lib/diario";
import type { Carga, Fila } from "@/lib/previo";
import PrevioVista from "./PrevioVista";

export default async function Previo({ p }: { p: Patient }) {
  const { sb } = await requireNutri();
  const hoy = hoyISO();
  const d = new Date(); d.setDate(d.getDate() - 120);
  const lejos = hoyISO(d);
  const [{ data: cs }, { data: filas }, { data: cargas }, { data: plan }] = await Promise.all([
    sb.from("consultas").select("fecha").eq("patient_id", p.id).lt("fecha", hoy).order("fecha", { ascending: false }).limit(1),
    sb.from("diario").select("fecha, data").eq("patient_id", p.id).gte("fecha", lejos).order("fecha"),
    sb.from("cargas").select("ejercicio, fecha, data").eq("patient_id", p.id).gte("fecha", lejos),
    sb.from("plans").select("data").eq("patient_id", p.id).eq("activo", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const ultima = (cs?.[0]?.fecha as string | undefined) ?? null;
  const d30 = new Date(); d30.setDate(d30.getDate() - 30);
  const desde = ultima ?? hoyISO(d30);
  const { data: gustos } = await sb.from("gustos").select("platillo, valor").eq("patient_id", p.id).gte("created_at", desde);
  return <PrevioVista p={p} masculino={(plan?.data as { genero?: string } | undefined)?.genero === "m"} desde={desde} ultima={ultima} filas={(filas ?? []) as Fila[]} cargas={(cargas ?? []) as Carga[]} gustos={(gustos ?? []).map((g) => ({ comida: g.platillo as string, voto: Number(g.valor) }))} hoy={hoy} />;
}
