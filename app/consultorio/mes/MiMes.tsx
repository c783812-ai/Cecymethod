import Link from "next/link";
import { dinero, type Pago, type Paquete } from "@/lib/pagos";
import { cobrado, consultasDelMes, mesAntes, mesDespues, origenesTodas, tituloMes, type Consulta } from "@/lib/mes";

type P = { id: string; nombre: string; estado?: string | null; origen?: string | null };

/** Tu mes en números: lo que cobraste, consultas, nuevas, renovaciones y de dónde llegan. */
export default function MiMes({ m, actual, pacientes, paquetes, pagos, consultas }: { m: string; actual: string; pacientes: P[]; paquetes: Paquete[]; pagos: Pago[]; consultas: Consulta[] }) {
  const dinero_ = cobrado(pagos, paquetes, m);
  const c = consultasDelMes(consultas, pacientes, m);
  const vendidos = paquetes.filter((p) => p.inicio.startsWith(m));
  const porPaquete = [...vendidos.reduce((r, p) => r.set(p.nombre, (r.get(p.nombre) ?? 0) + 1), new Map<string, number>())];
  const activas = pacientes.filter((p) => (p.estado ?? "activa") === "activa").length;
  const pausa = pacientes.filter((p) => p.estado === "pausa").length;
  const origen = origenesTodas(pacientes);

  return (
    <section className="main mimes" style={{ maxWidth: 920, margin: "0 auto", width: "100%" }}>
      <div className="phead">
        <div><div className="eyebrow">Solo tú lo ves</div><h1>{tituloMes(m)}</h1><div className="meta">Sale de lo que anotas en Pagos y en el historial de consultas de cada paciente.</div></div>
        <div className="mesnav">
          <Link className="btn" href={`/consultorio/mes?m=${mesAntes(m)}`} scroll={false}>‹ Anterior</Link>
          {m < actual && <Link className="btn" href={`/consultorio/mes?m=${mesDespues(m)}`} scroll={false}>Siguiente ›</Link>}
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>💶 Cobrado</h3>
          {dinero_.length ? (
            <div className="cifras">
              {dinero_.map((d) => (
                <div key={d.moneda}>
                  <b>{dinero(d.mes, d.moneda)}</b>
                  <span>{d.cambio === null ? (d.mes ? "el mes pasado no hubo" : "") : `${d.cambio >= 0 ? "▲" : "▼"} ${Math.abs(d.cambio)}% · el mes pasado ${dinero(d.antes, d.moneda)}`}</span>
                </div>
              ))}
            </div>
          ) : <p className="note" style={{ margin: 0 }}>No hay pagos anotados este mes ni el anterior.</p>}
          <p className="note" style={{ margin: "8px 0 0" }}>Cada moneda va aparte, sin convertir.</p>
        </div>

        <div className="card">
          <h3>🗓️ Consultas</h3>
          <div className="cifras">
            <div><b>{c.total}</b><span>consultas en total</span></div>
            <div><b>{c.primera}</b><span>primera vez</span></div>
            <div><b>{c.seguimiento}</b><span>{c.seguimiento === 1 ? "seguimiento" : "seguimientos"}</span></div>
            <div><b>{c.renovacion}</b><span>{c.renovacion === 1 ? "renovación" : "renovaciones"}</span></div>
          </div>
          <ul className="lp">
            {c.nuevas.length > 0 && <li><b>Nuevas:</b> {c.nuevas.join(" · ")}</li>}
            {c.renovaron.length > 0 && <li><b>Renovaron:</b> {c.renovaron.join(" · ")}</li>}
            {c.origenes.length > 0 && <li><b>Las nuevas llegaron por:</b> {c.origenes.map(([o, n]) => `${o} (${n})`).join(" · ")}</li>}
            {porPaquete.length > 0 && <li><b>Paquetes que empezaron:</b> {porPaquete.map(([n, k]) => `${n} (${k})`).join(" · ")}</li>}
          </ul>
        </div>

        <div className="grid g2">
          <div className="card">
            <h3>👩 Tus pacientes hoy</h3>
            <div className="cifras">
              <div><b>{activas}</b><span>activas</span></div>
              <div><b>{pausa}</b><span>en pausa</span></div>
            </div>
          </div>
          <div className="card">
            <h3>📍 De dónde llegan (todas)</h3>
            <ul className="consultas">{origen.map(([o, n]) => <li key={o}><span>{o}</span><b className="num">{n}</b></li>)}</ul>
            <p className="note" style={{ margin: "8px 0 0" }}>Se anota en la ficha de cada paciente, en “Cómo llegó”.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
