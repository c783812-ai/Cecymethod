import Link from "next/link";
import type { Registro } from "@/lib/diario";
import { resumenSemana } from "@/lib/resumen";
import type { Patient, Plan } from "@/lib/types";
import Copiar from "./Copiar";
import { alertasDe, hambrePorTiempo } from "@/lib/alertas";

const CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** La semana de la paciente para Cecy: resumen, día por día y un borrador de mensaje. */
const dias7 = (n: number) => `${n} de 7 días`;

export default function SemanaVista({ p, plan, regs, fechas, antes, despues }: {
  p: Pick<Patient, "nombre" | "diario_consentido_at">; plan: Plan | null; regs: Record<string, Registro>; fechas: string[]; antes: string; despues: string;
}) {
  const vasos = plan?.agua || 8;
  const s = resumenSemana(regs, fechas, { nombre: p.nombre, meta: plan?.meta, vasos });
  const semana = fechas.map((f) => regs[f]).filter((r): r is Registro => !!r);
  const alertas = alertasDe(semana).filter((a) => !a.startsWith("💊"));
  const hambre = hambrePorTiempo(semana);
  const fmt = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  return (
    <div className="grid">
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Link className="btn" href={antes} scroll={false}>‹ Anterior</Link>
        <b>{fmt(fechas[0])} al {fmt(fechas[6])}</b>
        <Link className="btn" href={despues} scroll={false}>Siguiente ›</Link>
      </div>
      {!p.diario_consentido_at && !s.registrados ? (
        <div className="card"><p style={{ margin: 0 }}>{p.nombre.split(" ")[0]} todavía no comparte su registro diario. Se lo pide su página, en &quot;Hoy&quot;, al final de su registro.</p></div>
      ) : !s.registrados ? (
        <div className="card"><p style={{ margin: 0 }}>No registró nada esta semana.</p></div>
      ) : (
        <>
          {alertas.length > 0 && (
            <div className="tint t-warn"><h4>⚠️ Para revisar esta semana</h4><div className="alertas">{alertas.map((a) => <span key={a}>{a}</span>)}</div></div>
          )}
          {s.meds.length > 0 && (
            <div className="tint t-pink"><h4>💊 Empezó algo nuevo</h4>{s.meds.map((m) => <p key={m.fecha} style={{ margin: "4px 0 0" }}><b>{m.fecha.slice(8)}/{m.fecha.slice(5, 7)}:</b> {m.que}</p>)}</div>
          )}
          <div className="grid g3">
            <Dato t="Comidas hechas" v={s.deComidas ? `${s.comidas} de ${s.deComidas}` : "—"} />
            <Dato t={plan?.meta && plan.meta !== "comidas" ? "Meta del día (promedio)" : "Meta"} v={s.metaProm != null ? `${Math.round(s.metaProm)}%` : "—"} n={s.diasMeta ? `${s.diasMeta} días al 90% o más` : ""} />
            <Dato t="Agua" v={s.agua != null ? `${s.agua.toFixed(1)} vasos` : "—"} n={`meta: ${vasos} al día`} />
            <Dato t="Baño" v={s.bano != null ? `${s.bano.toFixed(1)} veces al día` : "—"} n={[s.estrenida ? `estreñida ${s.estrenida} d` : "", s.diarrea ? `diarrea ${s.diarrea} d` : ""].filter(Boolean).join(" · ")} />
            <Dato t="Estrés" v={s.estres != null ? s.textoEstres(Math.round(s.estres)) ?? "—" : "—"} n={s.suenoCorto ? `durmió menos de 6 h ${s.suenoCorto} noches` : ""} />
            <Dato t="Actividad" v={`${s.activos} de 7 días`} n="días que hizo ejercicio" />
            <Dato t="Pasos" v={s.pasos.length ? s.pasosProm.toLocaleString("en-US") : "—"} n={s.pasos.length ? `promedio · ${s.pasos7} de ${s.pasos.length} días con 7,000+` : ""} />
            <Dato t="Fuera del plan" v={dias7(s.fueraDias)} n="días que comió algo fuera de su plan" />
            <Dato t="Alcohol" v={dias7(s.alcoholDias)} n={s.bebidas ? `${s.bebidas}${s.bebidasMas ? " o más" : ""} vasos o copas en la semana` : ""} />
            <Dato t="Ánimo" v={s.animos.join(" ")} n={s.ciclo.join(" · ")} />
          </div>
          <div className="card">
            <h3>Día por día</h3>
            <div className="tablewrap">
              <table>
                <thead><tr><th>Día</th><th>Comidas</th><th>Meta</th><th>Agua</th><th>Baño</th><th>Ánimo</th><th>Sueño</th><th>Pasos</th><th>Actividad</th><th>Fuera del plan</th><th>Alcohol</th><th>Estrés</th><th>Ciclo</th></tr></thead>
                <tbody>
                  {s.dias.map(({ fecha, r }, i) => (
                    <tr key={fecha}>
                      <td><b>{CORTOS[i]}</b> <span className="note">{fecha.slice(8)}</span></td>
                      <td>{r?.comidas ? `${r.comidas.length}/${r.de ?? 5}` : "—"}</td>
                      <td>{r?.pct != null ? `${r.pct}%` : "—"}</td>
                      <td>{r?.agua ?? "—"}</td>
                      <td>{r?.bano != null ? `${r.bano}${r.heces ? ` · ${s.textoHeces(r.heces)}` : ""}` : "—"}</td>
                      <td>{r?.animo ? `${r.animo} ${s.textoAnimo(r.animo)}` : "—"}</td>
                      <td>{s.textoSueno(r?.sueno) ?? "—"}</td>
                      <td>{s.textoPasos(r?.pasos) ?? "—"}</td>
                      <td>{s.textoActividad(r) ?? "—"}</td>
                      <td>{s.textoFuera(r) ?? "—"}</td>
                      <td>{s.textoAlcohol(r) ?? "—"}</td>
                      <td>{s.textoEstres(r?.estres) ?? "—"}</td>
                      <td className="note">{r?.ciclo && r.ciclo !== "na" && r.ciclo !== "normal" ? (r.ciclo === "regla" ? "En su regla" : "Irregular") : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {hambre.some((h) => h.marcadas) && (
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Hambre y saciedad</h3>
              <p className="note" style={{ marginTop: 0 }}>Cómo se sintió después de cada tiempo de comida, en la semana.</p>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead><tr><th>Tiempo</th><th>Días que marcó</th><th>Saciada</th><th>Con hambre</th></tr></thead>
                  <tbody>
                    {hambre.map((h, i) => (
                      <tr key={h.tiempo}>
                        <td><b>{h.tiempo}</b> <span className="note">{plan?.horarios?.[i] ?? ""}</span></td>
                        <td>{h.marcadas || "—"}</td>
                        <td>{h.saciada || "—"}</td>
                        <td className={h.conHambre >= 2 ? "rojo" : ""}>{h.conHambre || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="card grid" style={{ gap: 10 }}>
            <h3 style={{ margin: 0 }}>Mensaje para mandarle</h3>
            <p className="note" style={{ margin: 0 }}>Un borrador con lo que marcó. Cópialo, ajústalo a tu estilo y mándaselo por WhatsApp.</p>
            <pre className="borrador">{s.mensaje}</pre>
            <div><Copiar texto={s.mensaje} /></div>
          </div>
        </>
      )}
    </div>
  );
}

function Dato({ t, v, n }: { t: string; v: string; n?: string }) {
  return <div className="card" style={{ padding: 14 }}><div className="eyebrow">{t}</div><div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{v}</div>{n && <div className="note">{n}</div>}</div>;
}
