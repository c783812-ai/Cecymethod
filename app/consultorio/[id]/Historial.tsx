import { requireNutri } from "@/lib/auth";
import { borrarConsulta, registrarConsulta } from "../actions";

const TIPO = { primera: "Primera consulta", seguimiento: "Seguimiento", renovacion: "Renovación de programa" } as const;
const fechaCorta = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

/** Cuenta de consultas, planes y renovaciones, y lo que le gusta. Solo la ve Cecy. */
export default async function Historial({ id }: { id: string }) {
  const { sb } = await requireNutri();
  const [{ data: cs, error }, { count: planes }, { data: favs }] = await Promise.all([
    sb.from("consultas").select("id, fecha, tipo").eq("patient_id", id).order("fecha", { ascending: false }),
    sb.from("plans").select("id", { count: "exact", head: true }).eq("patient_id", id),
    sb.from("gustos").select("platillo, valor, created_at").eq("patient_id", id).order("created_at", { ascending: false }),
  ]);
  if (error) return <div className="card"><h3>Su historial</h3><p className="note">Falta pegar en Supabase el texto de consultas, gustos y pesos para usar esta parte.</p></div>;
  return <HistorialVista id={id} cs={cs ?? []} planes={planes ?? 0} favs={favs ?? []} />;
}

export function HistorialVista({ id, cs, planes, favs }: { id: string; cs: { id: string; fecha: string; tipo: string }[]; planes: number; favs: { platillo: string; valor: number }[] }) {
  const hoy = new Date().toISOString().slice(0, 10);
  const hechas = cs.filter((c) => c.fecha <= hoy);
  const renov = hechas.filter((c) => c.tipo === "renovacion").length;
  return (
    <div className="grid g2">
      <div className="card historial">
        <h3>Su historial contigo</h3>
        <div className="cuentas">
          <div><b className="num">{hechas.length}</b><span>{hechas.length === 1 ? "consulta" : "consultas"}</span></div>
          <div><b className="num">{planes}</b><span>{planes === 1 ? "plan" : "planes"}</span></div>
          <div><b className="num">{renov}</b><span>{renov === 1 ? "renovación" : "renovaciones"}</span></div>
        </div>
        <form action={registrarConsulta.bind(null, id)} className="regconsulta">
          <input type="date" name="fecha" defaultValue={hoy} aria-label="Fecha de la consulta" />
          <select name="tipo" defaultValue={hechas.length ? "seguimiento" : "primera"} aria-label="Tipo de consulta">
            {Object.entries(TIPO).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
          <button className="btn primary">Registrar consulta</button>
        </form>
        {cs.length > 0 && (
          <ul className="consultas">
            {cs.map((c) => (
              <li key={c.id}>
                <span>{fechaCorta(c.fecha)} · {TIPO[c.tipo as keyof typeof TIPO]}</span>
                <form action={borrarConsulta.bind(null, id, c.id)}><button className="linklike" aria-label="Quitar consulta">Quitar</button></form>
              </li>
            ))}
          </ul>
        )}
        <p className="note" style={{ margin: 0 }}>Solo la fecha y el tipo; ella no ve esta lista.</p>
      </div>
      <div className="card">
        <h3>Lo que le gusta y lo que no</h3>
        {favs.length ? (
          <>
            {favs.some((f) => f.valor > 0) && <><h5>👍 Le gustan</h5><ul className="favs">{favs.filter((f) => f.valor > 0).map((f) => <li key={f.platillo}>{f.platillo}</li>)}</ul></>}
            {favs.some((f) => f.valor < 0) && <><h5>👎 No le gustan, mejor no repetirlos</h5><ul className="favs">{favs.filter((f) => f.valor < 0).map((f) => <li key={f.platillo}>{f.platillo}</li>)}</ul></>}
          </>
        ) : <p className="note">Todavía no marca nada. Ella toca 👍 o 👎 en cualquier platillo de su menú.</p>}
      </div>
    </div>
  );
}
