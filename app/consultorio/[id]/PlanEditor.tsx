"use client";
import { useState, useTransition } from "react";
import { COLORES, DIAS, GRUPOS, TIEMPOS, planVacio, type Color, type Plan } from "@/lib/types";
import { tint } from "@/components/shared";
import { guardarPlan } from "../actions";

/** Acepta un plan pegado (el que Claude le prepara a Cecy) y lo completa con lo que falte. */
function normalizar(x: unknown): Plan {
  const base = planVacio();
  const p = { ...base, ...(x as Partial<Plan>) };
  p.menu = { ...base.menu, ...(p.menu ?? {}) };
  for (const d of DIAS) p.menu[d] = TIEMPOS.map((_, i) => ({ titulo: p.menu[d]?.[i]?.titulo ?? "", detalle: p.menu[d]?.[i]?.detalle ?? "" }));
  p.porciones = { ...base.porciones, ...(p.porciones ?? {}) };
  p.horarios = TIEMPOS.map((t, i) => p.horarios?.[i] ?? t[1]);
  p.enfoques ??= [];
  p.suplementos ??= [];
  p.tips ??= [];
  return p;
}

export default function PlanEditor({ id, planId, inicial, anteriores }: { id: string; planId: string | null; inicial: Plan | null; anteriores: number }) {
  const [plan, setPlan] = useState<Plan>(() => normalizar(inicial ?? planVacio()));
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pending, start] = useTransition();
  const [pegar, setPegar] = useState("");

  const up = (fn: (p: Plan) => void) => {
    setPlan((old) => { const n = structuredClone(old); fn(n); return n; });
    setDirty(true);
    setMsg(null);
  };
  const save = (nuevo: boolean) => start(async () => { const r = await guardarPlan(id, planId, plan, nuevo); setMsg(r); if (r.ok) setDirty(false); });

  return (
    <div className="grid">
      <div className="card" style={{ position: "sticky", top: 0, zIndex: 2, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <b style={{ fontFamily: "var(--display)" }}>{planId ? "Plan actual" : "Plan nuevo"}</b>
        {anteriores > 0 && <span className="note">{anteriores} plan{anteriores > 1 ? "es" : ""} anterior{anteriores > 1 ? "es" : ""} guardado{anteriores > 1 ? "s" : ""}</span>}
        <span style={{ flex: 1 }} />
        {dirty && <span className="pill p-mid">Cambios sin guardar</span>}
        {msg && <span className={`pill ${msg.ok ? "p-ok" : "p-warn"}`}>{msg.msg}</span>}
        {planId && <button className="btn" disabled={pending} onClick={() => save(true)}>Guardar como plan nuevo</button>}
        <button className="btn primary" disabled={pending} onClick={() => save(false)}>{pending ? "Guardando…" : "Guardar"}</button>
      </div>

      <details className="card">
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>Pegar un plan que te preparó Claude</summary>
        <p className="note">Pide el plan en el proyecto y pega aquí el texto que empieza con {"{"}. Reemplaza lo que tienes abajo; revísalo antes de guardar.</p>
        <label className="field">Plan<textarea value={pegar} onChange={(e) => setPegar(e.target.value)} style={{ minHeight: 120, fontFamily: "ui-monospace, monospace", fontSize: 12 }} /></label>
        <button className="btn" style={{ marginTop: 8 }} onClick={() => {
          try { setPlan(normalizar(JSON.parse(pegar))); setDirty(true); setPegar(""); setMsg({ ok: true, msg: "Plan cargado. Revísalo y guarda." }); }
          catch { setMsg({ ok: false, msg: "Ese texto no es un plan válido." }); }
        }}>Cargar</button>
      </details>

      <div className="card grid" style={{ gap: 12 }}>
        <h3 style={{ margin: 0 }}>Portada</h3>
        <div className="form-grid">
          <label className="field">Título<input value={plan.titulo} onChange={(e) => up((p) => { p.titulo = e.target.value; })} /></label>
          <label className="field">Inicio<input value={plan.inicio} onChange={(e) => up((p) => { p.inicio = e.target.value; })} placeholder="12 de octubre de 2026" /></label>
          <label className="field">Próxima revisión<input value={plan.proxima_revision} onChange={(e) => up((p) => { p.proxima_revision = e.target.value; })} /></label>
          <label className="field">kcal al día<input value={plan.kcal} onChange={(e) => up((p) => { p.kcal = e.target.value; })} placeholder="1,700" /></label>
          <label className="field">Proteína (g)<input value={plan.proteina} onChange={(e) => up((p) => { p.proteina = e.target.value; })} placeholder="95" /></label>
        </div>
        <label className="field">Objetivo, como lo lee ella<textarea value={plan.objetivo} onChange={(e) => up((p) => { p.objetivo = e.target.value; })} placeholder="Recuperar tu energía y tus reservas de hierro, sin dejar de comer lo que te gusta." /></label>
      </div>

      <div className="card">
        <h3>En qué nos vamos a enfocar <span className="note">(máximo 3)</span></h3>
        <div className="grid g3">
          {plan.enfoques.map((e, i) => (
            <div key={i} className={`tint ${tint(e.color)}`} style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input className="mini" value={e.icono} onChange={(x) => up((p) => { p.enfoques[i].icono = x.target.value; })} aria-label="Icono" />
                <input className="mini" style={{ flex: 1, textAlign: "left" }} value={e.titulo} onChange={(x) => up((p) => { p.enfoques[i].titulo = x.target.value; })} aria-label="Título" />
              </div>
              <textarea className="mini" style={{ width: "100%", textAlign: "left", minHeight: 70 }} value={e.texto} onChange={(x) => up((p) => { p.enfoques[i].texto = x.target.value; })} aria-label="Texto" />
              <div style={{ display: "flex", gap: 6 }}>
                <select className="mini" style={{ flex: 1 }} value={e.color} onChange={(x) => up((p) => { p.enfoques[i].color = x.target.value as Color; })}>{COLORES.map((c) => <option key={c}>{c}</option>)}</select>
                <button className="btn" style={{ padding: "3px 8px", fontSize: 12 }} onClick={() => up((p) => { p.enfoques.splice(i, 1); })}>Quitar</button>
              </div>
            </div>
          ))}
        </div>
        {plan.enfoques.length < 3 && <button className="btn" style={{ marginTop: 10 }} onClick={() => up((p) => { p.enfoques.push({ icono: "🩸", titulo: "", texto: "", color: COLORES[p.enfoques.length] }); })}>+ Enfoque</button>}
      </div>

      <div className="card">
        <h3>Su día en porciones</h3>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Grupo</th>
                {TIEMPOS.map((t, i) => (
                  <th key={t[0]} className="c">{t[0]}<br />
                    <input className="mini" value={plan.horarios[i]} onChange={(e) => up((p) => { p.horarios[i] = e.target.value; })} aria-label={`Hora de ${t[0]}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GRUPOS.map((g) => (
                <tr key={g}>
                  <td>{g}</td>
                  {TIEMPOS.map((_, i) => (
                    <td key={i} className="c">
                      <input className="mini num" inputMode="decimal" value={plan.porciones[g]?.[i] ?? ""} aria-label={`${g}, ${TIEMPOS[i][0]}`}
                        onChange={(e) => up((p) => { const v = e.target.value.replace(",", "."); (p.porciones[g] ??= [null, null, null, null, null])[i] = v === "" ? null : Number(v); })} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Menú de lunes a sábado</h3>
        <p className="note" style={{ marginTop: -4 }}>Arroz, pasta y leguminosas se miden ya cocidos. Deja vacío un tiempo de comida para que no aparezca.</p>
        <div className="menu-grid">
          {DIAS.map((d) => (
            <div key={d} className="day">
              <h4>{d}</h4>
              {TIEMPOS.map((t, i) => (
                <div key={i} className="editmeal">
                  <span className="eyebrow">{t[0]}</span>
                  <input value={plan.menu[d][i].titulo} placeholder="Platillo" onChange={(e) => up((p) => { p.menu[d][i].titulo = e.target.value; })} aria-label={`${d}, ${t[0]}, platillo`} />
                  <textarea value={plan.menu[d][i].detalle} placeholder="Cantidades: 2 huevos · 1 taza de espinaca…" onChange={(e) => up((p) => { p.menu[d][i].detalle = e.target.value; })} aria-label={`${d}, ${t[0]}, cantidades`} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <label className="field" style={{ marginTop: 12 }}>Domingo libre<textarea value={plan.domingo} onChange={(e) => up((p) => { p.domingo = e.target.value; })} /></label>
      </div>

      <div className="card">
        <h3>Suplementos</h3>
        {plan.suplementos.map((s, i) => (
          <div key={i} className="form-grid" style={{ marginBottom: 8, alignItems: "end" }}>
            <label className="field">Qué<input value={s.que} onChange={(e) => up((p) => { p.suplementos[i].que = e.target.value; })} /></label>
            <label className="field">Cuánto<input value={s.cuanto} onChange={(e) => up((p) => { p.suplementos[i].cuanto = e.target.value; })} /></label>
            <label className="field">Cuándo<input value={s.cuando} onChange={(e) => up((p) => { p.suplementos[i].cuando = e.target.value; })} /></label>
            <button className="btn" onClick={() => up((p) => { p.suplementos.splice(i, 1); })}>Quitar</button>
          </div>
        ))}
        <button className="btn" onClick={() => up((p) => { p.suplementos.push({ que: "", cuanto: "", cuando: "" }); })}>+ Suplemento</button>
      </div>

      <div className="card">
        <h3>Consejos <span className="note">(el primero aparece en su día)</span></h3>
        <div className="grid g3">
          {plan.tips.map((t, i) => (
            <div key={i} className={`tint ${tint(t.color)}`} style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input className="mini" value={t.icono} onChange={(x) => up((p) => { p.tips[i].icono = x.target.value; })} aria-label="Icono" />
                <input className="mini" style={{ flex: 1, textAlign: "left" }} value={t.titulo} onChange={(x) => up((p) => { p.tips[i].titulo = x.target.value; })} aria-label="Título" />
              </div>
              <textarea className="mini" style={{ width: "100%", textAlign: "left", minHeight: 60 }} value={t.texto} onChange={(x) => up((p) => { p.tips[i].texto = x.target.value; })} aria-label="Texto" />
              <div style={{ display: "flex", gap: 6 }}>
                <select className="mini" style={{ flex: 1 }} value={t.color} onChange={(x) => up((p) => { p.tips[i].color = x.target.value as Color; })}>{COLORES.map((c) => <option key={c}>{c}</option>)}</select>
                <button className="btn" style={{ padding: "3px 8px", fontSize: 12 }} onClick={() => up((p) => { p.tips.splice(i, 1); })}>Quitar</button>
              </div>
            </div>
          ))}
        </div>
        <button className="btn" style={{ marginTop: 10 }} onClick={() => up((p) => { p.tips.push({ icono: "🍋", titulo: "", texto: "", color: "amarillo" }); })}>+ Consejo</button>
      </div>
    </div>
  );
}
