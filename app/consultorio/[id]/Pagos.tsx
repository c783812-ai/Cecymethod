import { requireNutri } from "@/lib/auth";
import { MONEDAS, dinero, fechaCorta, saldo, type Pago, type Paquete } from "@/lib/pagos";
import { borrarPago, borrarPaquete, crearPaquete, editarPaquete, registrarPago } from "../actions";
import NuevoPaquete from "./NuevoPaquete";

/** Paquetes que compró la paciente y lo que va pagando. Solo lo ve Cecy. */
export default async function Pagos({ id }: { id: string }) {
  const { sb } = await requireNutri();
  const [{ data: pqs, error }, { data: pgs }] = await Promise.all([
    sb.from("paquetes").select("*").eq("patient_id", id).order("inicio", { ascending: false }),
    sb.from("pagos").select("*").eq("patient_id", id).order("fecha", { ascending: false }),
  ]);
  if (error) return <div className="card"><h3>Pagos</h3><p className="note">Falta pegar en Supabase el código de pagos para usar esta parte.</p></div>;
  return <PagosVista id={id} paquetes={(pqs ?? []) as Paquete[]} pagos={(pgs ?? []) as Pago[]} />;
}

export function PagosVista({ id, paquetes, pagos }: { id: string; paquetes: Paquete[]; pagos: Pago[] }) {
  const hoy = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid">
      {paquetes.map((pq) => {
        const { pagado, pendiente } = saldo(pq, pagos);
        const suyos = pagos.filter((p) => p.paquete_id === pq.id);
        return (
          <div key={pq.id} className="card pagos">
            <div className="pq-head">
              <div><h3 style={{ margin: 0 }}>{pq.nombre}</h3><span className="note">Desde {fechaCorta(pq.inicio)}{pq.fin ? ` · termina ${fechaCorta(pq.fin)}` : ""}{pq.nota ? ` · ${pq.nota}` : ""}</span></div>
              <span className={`pill ${pendiente > 0 ? "p-mid" : "p-ok"}`}>{pendiente > 0 ? "Debe" : "Pagado"}</span>
            </div>
            <div className="cuentas">
              <div><span>Total</span><b className="num">{dinero(Number(pq.total), pq.moneda)}</b></div>
              <div><span>Pagado</span><b className="num">{dinero(pagado, pq.moneda)}</b></div>
              <div className={pendiente > 0 ? "debe" : ""}><span>Pendiente</span><b className="num">{dinero(pendiente, pq.moneda)}</b></div>
            </div>
            <form action={registrarPago.bind(null, id, pq.id)} className="regconsulta">
              <input type="date" name="fecha" defaultValue={hoy} aria-label="Fecha del pago" />
              <input name="monto" inputMode="decimal" placeholder={`Monto en ${pq.moneda}`} aria-label="Monto" required style={{ width: 130 }} />
              <input name="nota" placeholder="Nota (opcional)" aria-label="Nota del pago" />
              <button className="btn primary">Registrar pago</button>
            </form>
            {suyos.length > 0 && (
              <ul className="consultas">
                {suyos.map((p) => (
                  <li key={p.id}>
                    <span>{fechaCorta(p.fecha)} · <b className="num">{dinero(Number(p.monto), pq.moneda)}</b>{p.nota ? ` · ${p.nota}` : ""}</span>
                    <form action={borrarPago.bind(null, id, p.id)}><button className="linklike" aria-label="Quitar pago">Quitar</button></form>
                  </li>
                ))}
              </ul>
            )}
            <details>
              <summary className="note" style={{ cursor: "pointer" }}>Cambiar el paquete</summary>
              <form action={editarPaquete.bind(null, id, pq.id)} className="pagoform" style={{ marginTop: 8 }}>
                <label className="field">Nombre<input name="nombre" defaultValue={pq.nombre} /></label>
                <label className="field">Moneda<select name="moneda" defaultValue={pq.moneda}>{MONEDAS.map((m) => <option key={m}>{m}</option>)}</select></label>
                <label className="field">Total<input name="total" inputMode="decimal" defaultValue={String(pq.total)} /></label>
                <label className="field">Termina<input type="date" name="fin" defaultValue={pq.fin ?? ""} /></label>
                <label className="field">Nota<input name="nota" defaultValue={pq.nota ?? ""} /></label>
                <div><button className="btn">Guardar cambios</button></div>
              </form>
              <form action={borrarPaquete.bind(null, id, pq.id)} style={{ marginTop: 8 }}>
                <button className="linklike" style={{ color: "var(--warn)" }}>Borrar este paquete y sus pagos</button>
              </form>
            </details>
          </div>
        );
      })}
      <div className="card">
        <h3>{paquetes.length ? "Agregar otro paquete" : "Agregar su primer paquete"}</h3>
        <p className="note" style={{ marginTop: -4 }}>Para mensualidades, agrega un paquete por mes o uno con el total y ve registrando cada pago.</p>
        <NuevoPaquete action={crearPaquete.bind(null, id)} />
      </div>
      <p className="note" style={{ margin: 0 }}>Solo tú ves esta parte. Ella no ve nada de pagos.</p>
    </div>
  );
}
