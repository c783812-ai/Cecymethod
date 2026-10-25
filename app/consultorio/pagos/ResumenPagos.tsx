import Link from "next/link";
import { dinero, fechaCorta, porMoneda, saldo, textoMonedas, type Pago, type Paquete } from "@/lib/pagos";

/** Resumen de lo que te pagan: este mes, lo pendiente y cada paciente. */
export default function ResumenPagos({ pacientes: ps, paquetes, pagos, falta: error }: { pacientes: { id: string; nombre: string }[]; paquetes: Paquete[]; pagos: Pago[]; falta: boolean }) {
  const monedaDe = new Map(paquetes.map((p) => [p.id, p.moneda]));
  const conMoneda = pagos.map((p) => ({ ...p, moneda: monedaDe.get(p.paquete_id) ?? "EUR" }));
  const mes = new Date().toISOString().slice(0, 7);
  const meses = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); return d.toISOString().slice(0, 7); });
  const nombreMes = (m: string) => new Date(`${m}-15T12:00:00`).toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  const Mes = (m: string) => { const t = nombreMes(m); return t[0].toUpperCase() + t.slice(1); };
  const pendientes = paquetes.map((pq) => ({ pq, ...saldo(pq, pagos) }));
  const filas = (ps ?? []).map((p) => {
    const suyos = pendientes.filter((x) => x.pq.patient_id === p.id);
    const ultimo = pagos.find((g) => g.patient_id === p.id);
    return { p, suyos, ultimo, debe: suyos.some((x) => x.pendiente > 0) };
  }).filter((f) => f.suyos.length).sort((a, b) => Number(b.debe) - Number(a.debe));

  return (
    <section className="main" style={{ maxWidth: 920, margin: "0 auto", width: "100%" }}>
      <div className="phead"><div><div className="eyebrow">Solo tú lo ves</div><h1>Pagos</h1><div className="meta">Cada paciente se agrega en su ficha, pestaña Pagos.</div></div></div>
      {error ? <div className="card"><p className="note" style={{ margin: 0 }}>Falta pegar en Supabase el código de pagos para usar esta parte.</p></div> : (
        <div className="grid">
          <div className="grid g2">
            <div className="card resumen-pago"><span className="eyebrow">Cobrado en {nombreMes(mes)}</span><b className="num">{textoMonedas(porMoneda(conMoneda.filter((p) => p.fecha.startsWith(mes)), (p) => p.moneda, (p) => p.monto))}</b></div>
            <div className="card resumen-pago"><span className="eyebrow">Te deben en total</span><b className="num">{textoMonedas(porMoneda(pendientes, (x) => x.pq.moneda, (x) => x.pendiente))}</b></div>
          </div>
          <div className="card">
            <h3>Por paciente</h3>
            {filas.length ? (
              <div style={{ overflowX: "auto" }}>
                <table className="tpagos">
                  <thead><tr><th>Paciente</th><th>Paquete</th><th>Total</th><th>Pagado</th><th>Pendiente</th><th>Último pago</th></tr></thead>
                  <tbody>
                    {filas.flatMap((f) => f.suyos.map((x, i) => (
                      <tr key={x.pq.id} className={x.pendiente > 0 ? "debe" : ""}>
                        <td>{i === 0 && <Link href={`/consultorio/${f.p.id}?tab=pagos`}>{f.p.nombre}</Link>}</td>
                        <td>{x.pq.nombre}</td>
                        <td className="num">{dinero(Number(x.pq.total), x.pq.moneda)}</td>
                        <td className="num">{dinero(x.pagado, x.pq.moneda)}</td>
                        <td className="num"><b>{dinero(x.pendiente, x.pq.moneda)}</b></td>
                        <td>{i === 0 && f.ultimo ? fechaCorta(f.ultimo.fecha) : ""}</td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            ) : <p className="note">Todavía no hay paquetes. Abre la ficha de una paciente y ve a la pestaña Pagos.</p>}
          </div>
          <div className="card">
            <h3>Últimos 6 meses</h3>
            <ul className="consultas">
              {meses.map((m) => <li key={m}><span>{Mes(m)}</span><b className="num">{textoMonedas(porMoneda(conMoneda.filter((p) => p.fecha.startsWith(m)), (p) => p.moneda, (p) => p.monto))}</b></li>)}
            </ul>
            <p className="note" style={{ margin: 0 }}>Cada moneda se suma aparte, sin convertir.</p>
          </div>
        </div>
      )}
    </section>
  );
}
