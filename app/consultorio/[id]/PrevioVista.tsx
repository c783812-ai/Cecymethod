import type { Patient } from "@/lib/types";
import { hoyISO } from "@/lib/diario";
import { mensajeLogros, patronCiclo, progresoCargas, resumenPeriodo, type Carga, type Fila } from "@/lib/previo";
import Copiar from "./Copiar";

const fecha = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long" });
const pct = (x: number) => `${Math.round(x * 100)}%`;
const uno = (x: number | null, d = 1) => (x === null ? "—" : x.toFixed(d).replace(".0", ""));

/** Pestaña "Antes de la consulta": resumen desde la última consulta, patrón con su ciclo y logros del mes. */
export default function PrevioVista({ p, masculino = false, desde, ultima, filas, cargas, gustos, hoy = hoyISO() }: { p: Patient; masculino?: boolean; desde: string; ultima: string | null; filas: Fila[]; cargas: Carga[]; gustos: { comida: string; voto: number }[]; hoy?: string }) {
  const enPeriodo = filas.filter((f) => f.fecha >= desde);
  const r = resumenPeriodo(enPeriodo);
  const fuerza = progresoCargas(cargas.filter((c) => c.fecha >= desde));
  const hace30 = (() => { const d = new Date(`${hoy}T12:00:00`); d.setDate(d.getDate() - 29); return hoyISO(d); })();
  const mes = filas.filter((f) => f.fecha >= hace30);
  const msg = mensajeLogros(p.nombre, mes, progresoCargas(cargas.filter((c) => c.fecha >= hace30)), masculino);
  const ciclo = masculino ? null : patronCiclo(filas);
  const si = gustos.filter((g) => g.voto > 0).map((g) => g.comida), no = gustos.filter((g) => g.voto < 0).map((g) => g.comida);

  return (
    <div className="grid previo">
      <div className="card grid" style={{ gap: 10 }}>
        <h3 style={{ margin: 0 }}>📋 Desde {ultima ? `su última consulta (${fecha(ultima)})` : `el ${fecha(desde)}`}</h3>
        {!r.dias ? (
          <p className="muted" style={{ margin: 0 }}>Todavía no tiene días en su registro en este tiempo. El registro solo existe si aceptó guardar sus datos.</p>
        ) : (
          <>
            <p className="muted" style={{ margin: 0 }}>Registró {r.dias} {r.dias === 1 ? "día" : "días"}.</p>
            <div className="cifras">
              {r.comidasPct !== null && <div><b>{r.comidasPct}%</b><span>comidas del plan</span></div>}
              <div><b>{r.fuera}</b><span>{r.fuera === 1 ? "día" : "días"} comió fuera del plan</span></div>
              <div><b>{r.activos}</b><span>{r.activos === 1 ? "día" : "días"} con actividad</span></div>
              <div><b>{r.alcohol}</b><span>{r.alcohol === 1 ? "día" : "días"} con alcohol{r.alcoholMucho ? ` (${r.alcoholMucho} con 3 o más)` : ""}</span></div>
              {r.pasos !== null && <div><b>{Math.round(r.pasos).toLocaleString("es-MX")}</b><span>pasos al día</span></div>}
              {r.agua !== null && <div><b>{uno(r.agua)}</b><span>vasos de agua al día</span></div>}
              {r.estres !== null && <div><b>{uno(r.estres)} / 5</b><span>estrés promedio</span></div>}
              {r.suenoComun && <div><b>{r.suenoComun}</b><span>de sueño casi siempre{r.suenoPoco ? ` · ${r.suenoPoco} noches con menos de 6 h` : ""}</span></div>}
            </div>
            <ul className="lp">
              {r.animos.length > 0 && <li><b>Ánimo:</b> {r.animos.join(" · ")}</li>}
              {r.actividades.length > 0 && <li><b>Lo que más hizo:</b> {r.actividades.join(" · ")}</li>}
              {r.hambre.some((h) => h.conHambre > 0) && <li><b>Quedó con hambre en:</b> {r.hambre.filter((h) => h.conHambre > 0).map((h) => `${h.tiempo} (${h.conHambre} de ${h.marcadas})`).join(" · ")}</li>}
              {(r.estrenimiento > 0 || r.diarrea > 0) && <li><b>Baño:</b> {[r.estrenimiento && `${r.estrenimiento} días estreñida`, r.diarrea && `${r.diarrea} con diarrea`].filter(Boolean).join(" · ")}</li>}
              {r.fueraQue.length > 0 && <li><b>Lo que comió fuera:</b> {r.fueraQue.join(" · ")}</li>}
              {r.meds.length > 0 && <li><b>Medicamentos o suplementos nuevos:</b> {r.meds.join(" · ")}</li>}
              {si.length > 0 && <li><b>👍 Le gustó:</b> {si.join(" · ")}</li>}
              {no.length > 0 && <li><b>👎 No le gustó:</b> {no.join(" · ")}</li>}
            </ul>
          </>
        )}
        {fuerza.length > 0 && (
          <>
            <h4 style={{ margin: "6px 0 0" }}>🏋️ Subió de peso en</h4>
            <ul className="lp">{fuerza.slice(0, 6).map((c) => <li key={c.ejercicio}>{c.ejercicio}: de {c.de} a {c.a} {c.u}</li>)}</ul>
          </>
        )}
      </div>

      {ciclo && (
        <div className="card grid" style={{ gap: 10 }}>
          <h3 style={{ margin: 0 }}>🌙 Su ciclo</h3>
          {!ciclo.listo ? (
            <p className="muted" style={{ margin: 0 }}>Todavía no hay suficiente registro. Hace falta que marque “Estoy en mi regla” al menos una vez y que haya registrado varios días antes. {ciclo.reglas ? `Lleva ${ciclo.reglas} ${ciclo.reglas === 1 ? "regla" : "reglas"} y ${ciclo.diasPre} días antes de ella.` : ""}</p>
          ) : (
            <>
              <p className="muted" style={{ margin: 0 }}>Los 5 días antes de su regla comparados con sus otros días ({ciclo.reglas} {ciclo.reglas === 1 ? "regla registrada" : "reglas registradas"}, {ciclo.diasPre} días antes, {ciclo.diasResto} días normales).</p>
              {ciclo.destacados.length > 0 ? (
                <p className="aviso" style={{ margin: 0 }}>Antes de su regla sube: <b>{ciclo.destacados.join(", ").toLowerCase()}</b>.</p>
              ) : (
                <p style={{ margin: 0 }}>No se ve una diferencia clara antes de su regla.</p>
              )}
              <div className="tablewrap">
                <table>
                  <thead><tr><th></th><th>Antes de la regla</th><th>Otros días</th></tr></thead>
                  <tbody>{ciclo.filas.map((f) => (
                    <tr key={f.t} className={f.nota ? "sube" : ""}><td>{f.t}</td><td>{f.k === "pct" ? pct(f.pre) : uno(f.pre)}</td><td>{f.k === "pct" ? pct(f.resto) : uno(f.resto)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>Es una pista para platicarlo con ella, no un diagnóstico. Con más meses registrados es más confiable.</p>
            </>
          )}
        </div>
      )}

      <div className="card grid" style={{ gap: 10 }}>
        <h3 style={{ margin: 0 }}>🌟 Sus logros del mes</h3>
        {msg ? (
          <>
            <p className="muted" style={{ margin: 0 }}>Últimos 30 días. Cópialo y mándaselo por WhatsApp.</p>
            <pre className="mensaje">{msg}</pre>
            <div><Copiar texto={msg} /></div>
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>Aún no hay registro de los últimos 30 días para armar el mensaje.</p>
        )}
      </div>
    </div>
  );
}
