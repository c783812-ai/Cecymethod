import Link from "next/link";
import type { Patient } from "@/lib/types";
import { dinero, fechaCorta, saldo, type Pago, type Paquete } from "@/lib/pagos";
import { FechaLocal } from "@/lib/cita";

const DIA = 86400000;
// El registro de cuándo abren la app empezó el 25 de octubre de 2026: antes de una semana después, "nunca" todavía no significa nada.
const REGISTRO_VISITAS = Date.parse("2026-11-01T00:00:00Z");

type Item = { id: string; nombre: string; texto: React.ReactNode; detalle?: React.ReactNode; tab?: string };

/** Lo que necesita tu atención: citas, pagos, programas por terminar, planes viejos y quién no abre la app. */
export default function Tablero({ pacientes, paquetes, pagos, planes, hoy }: { pacientes: Patient[]; paquetes: Paquete[]; pagos: Pago[]; planes: { patient_id: string; created_at: string }[]; hoy: string }) {
  const ahora = Date.parse(hoy);
  const nombre = new Map(pacientes.map((p) => [p.id, p.nombre]));
  const hoyISO = hoy.slice(0, 10);

  const citas: Item[] = pacientes
    .filter((p) => p.cita_at && Date.parse(p.cita_at) > ahora - 2 * 3600e3 && Date.parse(p.cita_at) < ahora + 7 * DIA)
    .sort((a, b) => Date.parse(a.cita_at!) - Date.parse(b.cita_at!))
    .map((p) => ({ id: p.id, nombre: p.nombre, texto: <FechaLocal iso={p.cita_at!} /> }));

  const deben: Item[] = paquetes
    .map((pq) => ({ pq, ...saldo(pq, pagos) }))
    .filter((x) => x.pendiente > 0)
    .map((x) => ({ id: x.pq.patient_id, nombre: nombre.get(x.pq.patient_id) ?? "", texto: <b className="num">{dinero(x.pendiente, x.pq.moneda)}</b>, detalle: x.pq.nombre, tab: "pagos" }));

  const terminan: Item[] = paquetes
    .filter((pq) => pq.fin && pq.fin >= new Date(ahora - 7 * DIA).toISOString().slice(0, 10) && pq.fin <= new Date(ahora + 14 * DIA).toISOString().slice(0, 10))
    .sort((a, b) => a.fin!.localeCompare(b.fin!))
    .map((pq) => ({ id: pq.patient_id, nombre: nombre.get(pq.patient_id) ?? "", texto: pq.fin! < hoyISO ? `Terminó el ${fechaCorta(pq.fin!)}` : `Termina el ${fechaCorta(pq.fin!)}`, detalle: `${pq.nombre} · ofrécele renovar`, tab: "pagos" }));

  const planViejo: Item[] = planes
    .map((pl) => ({ pl, dias: Math.floor((ahora - Date.parse(pl.created_at)) / DIA) }))
    .filter((x) => x.dias >= 28 && nombre.has(x.pl.patient_id))
    .sort((a, b) => b.dias - a.dias)
    .map((x) => ({ id: x.pl.patient_id, nombre: nombre.get(x.pl.patient_id)!, texto: `${Math.floor(x.dias / 7)} semanas con el mismo plan`, tab: "plan" }));

  const sinAbrir: Item[] = pacientes
    .filter((p) => p.user_id && (p.ultima_visita ? ahora - Date.parse(p.ultima_visita) >= 7 * DIA : ahora > REGISTRO_VISITAS))
    .map((p) => ({ id: p.id, nombre: p.nombre, texto: p.ultima_visita ? `${Math.floor((ahora - Date.parse(p.ultima_visita)) / DIA)} días sin abrirla` : "No ha abierto la app" }));

  const secciones: [string, string, Item[], string][] = [
    ["📅", "Citas de los próximos 7 días", citas, "No tienes citas esta semana."],
    ["💶", "Te deben", deben, "Nadie te debe."],
    ["🔁", "Programas por terminar", terminan, "Ningún programa termina en las próximas 2 semanas."],
    ["🍽️", "Toca plan nuevo", planViejo, "Todas tienen plan de menos de 4 semanas."],
    ["📱", "Una semana o más sin abrir la app", sinAbrir, "Todas la han abierto esta semana."],
  ];
  const total = secciones.reduce((s, x) => s + (x[0] === "📅" ? 0 : x[2].length), 0);

  return (
    <section className="main" style={{ maxWidth: 820, margin: "0 auto", width: "100%" }}>
      <div className="phead"><div><div className="eyebrow">Tu día</div><h1>Pendientes</h1><div className="meta">{total ? `${total} ${total === 1 ? "cosa" : "cosas"} por atender, más tus citas.` : "Todo al día ✓"}</div></div></div>
      <div className="grid tablero">
        {secciones.map(([ic, titulo, items, vacio]) => (
          <div key={titulo} className="card">
            <h3>{ic} {titulo} {items.length > 0 && <span className="pill p-mid">{items.length}</span>}</h3>
            {items.length ? (
              <ul className="consultas">
                {items.map((x, i) => (
                  <li key={`${x.id}-${i}`}>
                    <span><Link href={`/consultorio/${x.id}${x.tab ? `?tab=${x.tab}` : ""}`}>{x.nombre}</Link>{x.detalle && <small className="note"> · {x.detalle}</small>}</span>
                    <span style={{ textAlign: "right" }}>{x.texto}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="note" style={{ margin: 0 }}>{vacio}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
