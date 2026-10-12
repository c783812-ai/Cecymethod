"use client";
import { useState, useTransition } from "react";
import { COLORES, DIAS, GRUPOS, TIEMPOS, planVacio, type Color, type Plan } from "@/lib/types";
import { tint } from "@/components/shared";
import { guardarPlan } from "../actions";
import BuscarAlimento from "@/components/BuscarAlimento";
import { cantidad, comoIngrediente, fraccion, icono } from "@/lib/alimentos";
import { META } from "@/lib/diario";
import { GUIA, choques, guiaDe, type Guia } from "@/lib/guiaSuplementos";

const EQS = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6];

/** Acepta un plan pegado (el que Claude le prepara a Cecy) y lo completa con lo que falte. */
function normalizar(x: unknown): Plan {
  const base = planVacio();
  const p = { ...base, ...(x as Partial<Plan>) };
  p.menu = { ...base.menu, ...(p.menu ?? {}) };
  for (const d of DIAS)
    p.menu[d] = TIEMPOS.map((_, i) => {
      const m = p.menu[d]?.[i];
      return { titulo: m?.titulo ?? "", detalle: m?.detalle ?? "", ...(m?.ingredientes?.length ? { ingredientes: m.ingredientes } : {}) };
    });
  p.porciones = { ...base.porciones, ...(p.porciones ?? {}) };
  p.horarios = TIEMPOS.map((t, i) => p.horarios?.[i] ?? t[1]);
  p.enfoques ??= [];
  p.suplementos ??= [];
  p.tips ??= [];
  return p;
}

/** Solo para Cecy: cuándo conviene el suplemento y con qué no juntarlo. */
function GuiaSup({ g, tiempo, otros = [] }: { g: Guia; tiempo?: string; otros?: string[] }) {
  const avisos = choques(g, otros);
  const fuera = tiempo && !g.cuando.some((c) => tiempo.startsWith(c) || c === "Cualquier hora" || c === "Con cualquier comida");
  return (
    <details className="guiasup">
      <summary>
        {g.cuando.map((c) => <span key={c} className="tag">🕒 {c}</span>)}
        {(avisos.length > 0 || fuera) && <span className="tag warn">⚠️ Revisar</span>}
      </summary>
      {fuera && <p>⚠️ Mejor en: {g.cuando.join(" o ").toLowerCase()}.</p>}
      {avisos.map((a) => <p key={a}>⚠️ {a}</p>)}
      {g.tip && <p>💡 {g.tip}</p>}
      {(g.separar ?? []).map((x) => <p key={x.de}>⏱️ Separar {x.horas} h de {x.de}</p>)}
      {(g.ojo ?? []).map((o) => <p key={o}>• {o}</p>)}
    </details>
  );
}

export default function PlanEditor({ id, planId, inicial, anteriores }: { id: string; planId: string | null; inicial: Plan | null; anteriores: number }) {
  const [plan, setPlan] = useState<Plan>(() => normalizar(inicial ?? planVacio()));
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pending, start] = useTransition();
  const [pegar, setPegar] = useState("");
  const [buscando, setBuscando] = useState<string | null>(null);

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
          <label className="field">Agua al día (vasos de 250 ml)<input type="number" min={1} max={20} value={plan.agua ?? ""} onChange={(e) => up((p) => { p.agua = Number(e.target.value) || undefined; })} placeholder="8" /></label>
          <label className="field">Meta de la barrita del día
            <select value={plan.meta ?? ""} onChange={(e) => up((p) => { p.meta = (e.target.value || undefined) as Plan["meta"]; })}>
              <option value="">Sin barrita</option>
              {Object.entries(META).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
            </select>
          </label>
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
        <p className="note" style={{ marginTop: -4 }}>Arroz, pasta y leguminosas se miden ya cocidos. Deja vacío un tiempo de comida para que no aparezca. Con ingredientes, ella ve la cantidad de cada uno y puede tocar Cambiar; el texto queda como nota de preparación.</p>
        <label className="field" style={{ maxWidth: 320, marginBottom: 10 }}>Lista de alimentos para los cambios
          <select value={plan.sistema ?? "smae"} onChange={(e) => up((p) => { p.sistema = e.target.value as "smae" | "renal"; })}>
            <option value="smae">SMAE + europeos</option>
            <option value="renal">Renal</option>
          </select>
        </label>
        <div className="menu-grid">
          {DIAS.map((d) => (
            <div key={d} className="day">
              <h4>{d}</h4>
              {TIEMPOS.map((t, i) => (
                <div key={i} className="editmeal">
                  <span className="eyebrow">{t[0]}</span>
                  <input value={plan.menu[d][i].titulo} placeholder="Platillo" onChange={(e) => up((p) => { p.menu[d][i].titulo = e.target.value; })} aria-label={`${d}, ${t[0]}, platillo`} />
                  <textarea value={plan.menu[d][i].detalle} placeholder={plan.menu[d][i].ingredientes?.length ? "Cómo prepararlo, en 1 o 2 líneas: Licúa todo con hielo…" : "Cantidades: 2 huevos · 1 taza de espinaca…"} onChange={(e) => up((p) => { p.menu[d][i].detalle = e.target.value; })} maxLength={plan.menu[d][i].ingredientes?.length ? 240 : undefined} aria-label={`${d}, ${t[0]}, cantidades`} />
                  {(plan.menu[d][i].ingredientes ?? []).map((g, j) => (
                    <div key={j}>
                    <div className="eing">
                      <span>{icono(g.n, g.g) && <>{icono(g.n, g.g)} </>}{g.n}<small>{cantidad(g, g.x)}</small></span>
                      <select className="mini num" value={g.x} aria-label={`Equivalentes de ${g.n}`} title="Equivalentes"
                        onChange={(e) => up((p) => { p.menu[d][i].ingredientes![j].x = Number(e.target.value); })}>
                        {[...new Set([...EQS, g.x])].sort((a, b) => a - b).map((v) => <option key={v} value={v}>{fraccion(v)}</option>)}
                      </select>
                      <button className="btn" style={{ padding: "2px 7px", fontSize: 12 }} aria-label={`Quitar ${g.n}`} onClick={() => up((p) => { p.menu[d][i].ingredientes!.splice(j, 1); })}>✕</button>
                    </div>
                    {g.s === "sup" && (() => { const gu = guiaDe(g.n, g.g); return gu && <GuiaSup g={gu} tiempo={t[0]} otros={[plan.menu[d][i].titulo, ...(plan.menu[d][i].ingredientes ?? []).map((o) => o.n)]} />; })()}
                    </div>
                  ))}
                  {buscando === `${d}-${i}` || buscando === `sup-${d}-${i}` ? (
                    <BuscarAlimento key={buscando} sistema={buscando.startsWith("sup") ? "suplementos" : plan.sistema ?? "smae"} onPick={(a) => up((p) => { (p.menu[d][i].ingredientes ??= []).push(comoIngrediente(a, 1)); })} />
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn" style={{ padding: "3px 8px", fontSize: 12 }} onClick={() => setBuscando(`${d}-${i}`)}>+ Ingrediente</button>
                      <button className="btn" style={{ padding: "3px 8px", fontSize: 12 }} onClick={() => setBuscando(`sup-${d}-${i}`)}>+ Producto o meal prep</button>
                    </div>
                  )}
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
            <label className="field">Qué<input list="sup-guia" value={s.que} onChange={(e) => up((p) => { p.suplementos[i].que = e.target.value; })} /></label>
            <label className="field">Cuánto<input value={s.cuanto} onChange={(e) => up((p) => { p.suplementos[i].cuanto = e.target.value; })} /></label>
            <label className="field">Cuándo<input value={s.cuando} onChange={(e) => up((p) => { p.suplementos[i].cuando = e.target.value; })} /></label>
            <button className="btn" onClick={() => up((p) => { p.suplementos.splice(i, 1); })}>Quitar</button>
            {(() => { const gu = guiaDe(s.que); return gu && (
              <div style={{ gridColumn: "1 / -1" }}>
                <GuiaSup g={gu} />
                {!s.cuando && <button className="btn" style={{ padding: "2px 8px", fontSize: 12 }} onClick={() => up((p) => { p.suplementos[i].cuando = gu.cuando.join(" o ").toLowerCase().replace(/^./, (c) => c.toUpperCase()); })}>Usar: {gu.cuando.join(" o ").toLowerCase()}</button>}
              </div>
            ); })()}
          </div>
        ))}
        <datalist id="sup-guia">{GUIA.map((g) => <option key={g.nombre} value={g.nombre} />)}</datalist>
        <p className="note" style={{ margin: "0 0 8px" }}>🕒 y ⚠️ son solo para ti; la paciente no los ve.</p>
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
