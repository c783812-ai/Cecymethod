import { requireNutri } from "@/lib/auth";
import { hoyISO, type Registro } from "@/lib/diario";
import ListaDomingo, { type Fila } from "./ListaDomingo";
import { alertasDe } from "@/lib/alertas";

export const metadata = { title: "Domingo · Cecy" };

/** Lista del domingo: quién registró su semana, para escribirles en orden. */
export default async function Domingo() {
  const { sb } = await requireNutri();
  const lunes = new Date();
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  const desde = hoyISO(lunes);
  const [{ data: ps }, { data: filas }] = await Promise.all([
    sb.from("patients").select("id, nombre, user_id, diario_consentido_at").order("nombre"),
    sb.from("diario").select("patient_id, fecha, data").gte("fecha", desde),
  ]);
  const lista: Fila[] = (ps ?? []).map((p) => {
    const suyas = (filas ?? []).filter((f) => f.patient_id === p.id && Object.keys((f.data as Registro) ?? {}).length);
    const ultima = suyas.map((f) => f.fecha as string).sort().pop() ?? null;
    return { id: p.id, nombre: p.nombre, activa: !!p.user_id, comparte: !!p.diario_consentido_at, dias: suyas.length, ultima, alertas: alertasDe(suyas.map((f) => f.data as Registro)) };
  });
  return (
    <section className="main" style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <div className="phead">
        <div>
          <div className="eyebrow">Semana del {lunes.getDate()}/{lunes.getMonth() + 1}</div>
          <h1>Tu lista del domingo</h1>
          <div className="meta">Primero las que tienen algo para revisar. Toca su nombre para ver su semana y copiar el mensaje.</div>
        </div>
      </div>
      <ListaDomingo filas={lista} semana={desde} />
    </section>
  );
}
