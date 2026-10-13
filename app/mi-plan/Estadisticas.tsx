"use client";
import { useEffect, useState } from "react";
import { estadisticas, fechasDe, type Periodo } from "@/lib/estadisticas";
import { hoyISO, type Diario } from "@/lib/diario";

const LETRAS = ["L", "M", "M", "J", "V", "S", "D"];
const dias = (n: number) => `${n} ${n === 1 ? "día" : "días"}`;

function animo(pct: number | null) {
  if (pct == null) return "Marca tus comidas en Hoy y aquí verás cómo vas 💛";
  if (pct >= 90) return "¡Increíble! Así se construyen los hábitos 🎉";
  if (pct >= 70) return "¡Vas muy bien! Sigue así ✨";
  if (pct >= 40) return "Vas avanzando, cada comida cuenta 💪";
  return "Cada día es una nueva oportunidad, ¡tú puedes! 💛";
}

/** Estadísticas de la semana o del mes, para motivarla con lo que ella misma registra. */
export default function Estadisticas({ diario, vasos, hoy = hoyISO() }: { diario: Diario; vasos: number; hoy?: string }) {
  const [p, setP] = useState<Periodo>("semana");
  useEffect(() => { try { const g = localStorage.getItem("stats-periodo"); if (g === "mes" || g === "semana") setP(g); } catch {} }, []);
  const elegir = (x: Periodo) => { setP(x); try { localStorage.setItem("stats-periodo", x); } catch {} };

  const fechas = fechasDe(p, hoy);
  const s = estadisticas(diario, fechas, vasos);
  const antes = estadisticas(diario, fechasDe(p, hoy, 1), vasos);
  const nombre = p === "semana" ? "la semana pasada" : "el mes pasado";
  const mejora = s.pctComidas != null && antes.pctComidas != null && s.pctComidas > antes.pctComidas ? `📈 ${s.pctComidas - antes.pctComidas}% más comidas que ${nombre}` : null;

  const tiles: [string, string, string][] = [
    ["🎯", "Meta del día", s.conMeta ? `${dias(s.diasMeta)}` : "—"],
    ["💧", "Toda tu agua", `${dias(s.diasAgua)}`],
    ["🏃‍♀️", "Te moviste", `${dias(s.activos)}`],
    ["😴", "Dormiste 7 h o más", s.conSueno ? `${s.duermeBien} ${s.duermeBien === 1 ? "noche" : "noches"}` : "—"],
  ];
  const extra = [s.aguaProm != null && `${Number(s.aguaProm.toFixed(1))} vasos al día`, s.pasosProm != null && `${s.pasosProm.toLocaleString("en-US")} pasos al día`].filter(Boolean) as string[];

  return (
    <div className="card stats">
      <div className="stats-top">
        <span className="eyebrow">Mis estadísticas</span>
        <div className="seg" role="group" aria-label="Periodo">
          {(["semana", "mes"] as Periodo[]).map((x) => <button key={x} aria-pressed={p === x} onClick={() => elegir(x)}>{x === "semana" ? "Semana" : "Mes"}</button>)}
        </div>
      </div>

      <div className="stats-hero">
        <div>
          <div className="note">🍽️ Comidas hechas</div>
          <b className="num">{s.deComidas ? `${s.comidas} de ${s.deComidas}` : "—"}</b>
        </div>
        {s.pctComidas != null && <b className="num pct">{s.pctComidas}%</b>}
      </div>
      <div className="mb-track" role="progressbar" aria-valuenow={s.pctComidas ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Comidas hechas"><div style={{ width: `${s.pctComidas ?? 0}%` }} /></div>
      <p className="note" style={{ margin: "6px 0 0" }}>{animo(s.pctComidas)}</p>
      {mejora && <p className="mejora">{mejora}</p>}

      {p === "semana" ? (
        <div className="barras" aria-label="Comidas por día">
          {s.porDia.map((d, i) => (
            <div key={d.fecha} className={d.fecha === hoy ? "hoy" : ""}>
              <span className="col"><span style={{ height: `${d.pct ?? 0}%` }} className={d.pct === 100 ? "full" : ""} /></span>
              <small>{LETRAS[i]}</small>
            </div>
          ))}
        </div>
      ) : (
        <div className="mesgrid" aria-label="Comidas por día del mes">
          {LETRAS.map((l, i) => <small key={i}>{l}</small>)}
          {Array.from({ length: (new Date(`${fechas[0]}T12:00:00`).getDay() + 6) % 7 }, (_, i) => <span key={`v${i}`} />)}
          {s.porDia.map((d) => (
            <span key={d.fecha} title={d.fecha} className={`dia ${d.pct == null ? "" : d.pct === 100 ? "full" : d.pct >= 60 ? "medio" : "poco"} ${d.fecha === hoy ? "hoy" : ""} ${d.fecha > hoy ? "futuro" : ""}`}>{Number(d.fecha.slice(8))}</span>
          ))}
        </div>
      )}
      {p === "mes" && <p className="note leyenda"><i className="full" /> todas <i className="medio" /> casi todas <i className="poco" /> algunas</p>}

      <div className="stats-tiles">
        {tiles.map(([ic, t, v]) => <div key={t}><span aria-hidden="true">{ic}</span><b>{v}</b><small>{t}</small></div>)}
      </div>
      {extra.length > 0 && <p className="note" style={{ margin: "8px 0 0", textAlign: "center" }}>En promedio: {extra.join(" · ")}</p>}
    </div>
  );
}
