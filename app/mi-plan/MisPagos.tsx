import { dinero, fechaCorta, saldo, type Pago, type Paquete } from "@/lib/pagos";

export type MisPagosData = { paquetes: Paquete[]; pagos: Pago[] };

/** Lo que la paciente ha pagado y lo que le falta, tal como Cecy lo anota en su consultorio. Solo lectura y sin las notas de Cecy. */
export default function MisPagos({ d }: { d: MisPagosData | null }) {
  if (!d?.paquetes.length) return null;
  const debe = d.paquetes.some((pq) => saldo(pq, d.pagos).pendiente > 0);
  return (
    <details className="card pagos" style={{ padding: 14 }} open={debe}>
      <summary style={{ cursor: "pointer" }}>
        <span className="eyebrow">Mis pagos</span>
        <br /><b>{debe ? "Tienes un saldo pendiente" : "Todo está pagado 💛"}</b>
      </summary>
      {d.paquetes.map((pq) => {
        const { pagado, pendiente } = saldo(pq, d.pagos);
        const suyos = d.pagos.filter((p) => p.paquete_id === pq.id);
        return (
          <div key={pq.id} style={{ marginTop: 12 }}>
            <div className="pq-head">
              <div><b>{pq.nombre}</b><br /><span className="note">Desde {fechaCorta(pq.inicio)}{pq.fin ? ` · termina ${fechaCorta(pq.fin)}` : ""}</span></div>
              <span className={`pill ${pendiente > 0 ? "p-mid" : "p-ok"}`}>{pendiente > 0 ? "Pendiente" : "Pagado"}</span>
            </div>
            <div className="cuentas">
              <div><span>Total</span><b className="num">{dinero(Number(pq.total), pq.moneda)}</b></div>
              <div><span>Pagado</span><b className="num">{dinero(pagado, pq.moneda)}</b></div>
              <div className={pendiente > 0 ? "debe" : ""}><span>Te falta</span><b className="num">{dinero(pendiente, pq.moneda)}</b></div>
            </div>
            {suyos.length > 0 && (
              <ul className="consultas" style={{ margin: 0, paddingLeft: 18 }}>
                {suyos.map((p) => <li key={p.id}>{fechaCorta(p.fecha)} · <b className="num">{dinero(Number(p.monto), pq.moneda)}</b></li>)}
              </ul>
            )}
          </div>
        );
      })}
      <p className="note" style={{ margin: "10px 0 0" }}>Cecy lo actualiza cuando recibe tu pago. Si algo no cuadra, escríbele por WhatsApp.</p>
    </details>
  );
}
