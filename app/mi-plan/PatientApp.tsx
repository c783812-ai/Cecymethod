"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DIAS, TIEMPOS, type Dia, type Patient, type Plan, type Rutina } from "@/lib/types";
import { MANO } from "@/lib/equivalentes";
import { MealCard, comidaDe, opcionesDe, resumenIngredientes, slotDe, useCambios, useOrden, type Cambios, type Orden } from "./Comidas";
import Super from "./Super";
import Antojos from "./Antojos";
import { PorcionesTable, tint } from "@/components/shared";

const MEAL_TINT = ["t-yellow", "t-pink", "t-blue", "t-lilac", "t-green"];
const CORTO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
type Tab = "hoy" | "semana" | "super" | "porciones" | "rutina";

const ICON: Record<Tab, React.ReactNode> = {
  hoy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  semana: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h10" /></svg>,
  super: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4h2l2.4 11h11.2L21 8H6.2" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></svg>,
  porciones: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><path d="M12 4v8l6 4" /></svg>,
  rutina: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" /></svg>,
};

// Lo que la paciente palomea se guarda solo en su teléfono.
function useLocalChecks(key: string) {
  const [v, setV] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try { setV(JSON.parse(localStorage.getItem(key) || "{}")); } catch {}
  }, [key]);
  const toggle = (k: string) =>
    setV((old) => {
      const n = { ...old, [k]: !old[k] };
      try { localStorage.setItem(key, JSON.stringify(n)); } catch {}
      return n;
    });
  return [v, toggle] as const;
}

export default function PatientApp(props: {
  patient: Patient;
  plan: Plan | null;
  planId: string | null;
  planExiste: boolean;
  rutina: Rutina | null;
  videos: Record<string, string>;
  vistaPrevia: boolean;
}) {
  const { patient: p, plan, rutina, videos, vistaPrevia } = props;
  const [tab, setTab] = useState<Tab>("hoy");
  const cambios = useCambios(props.planId);
  const orden = useOrden(props.planId);
  const first = p.nombre.split(" ")[0];
  const heads: Record<Tab, [string, React.ReactNode]> = {
    hoy: [`Hola, ${first}`, <>Tu <mark>día</mark></>],
    semana: [plan?.titulo ?? "Tu plan", <>Tu <mark>semana</mark></>],
    super: ["Para tu semana o tu mes", <>Tu lista del <mark>súper</mark></>],
    porciones: ["Cuánto comes en cada tiempo", <>Tus <mark>porciones</mark></>],
    rutina: ["Ejercicio", <>Tu <mark>rutina</mark></>],
  };
  const tabs: [Tab, string][] = [["hoy", "Hoy"], ["semana", "Mi semana"], ["super", "Súper"], ["porciones", "Porciones"], ["rutina", "Rutina"]];

  return (
    <div className="patient">
      <div style={{ width: "100%", maxWidth: 430 }}>
        {vistaPrevia && (
          <div className="viewing">
            Así ve su página {p.nombre}. <Link href={`/consultorio/${p.id}`}>Volver a su ficha</Link>
          </div>
        )}
        <div className="phone">
          <div className="ph-head">
            <div className="eyebrow">{heads[tab][0]}</div>
            <h1>{heads[tab][1]}</h1>
          </div>
          <div className="ph-body">
            {tab === "hoy" && <Hoy p={p} plan={plan} planExiste={props.planExiste} cambios={cambios} orden={orden} />}
            {tab === "semana" && <Semana plan={plan} planExiste={props.planExiste} cambios={cambios} orden={orden} />}
            {tab === "super" && (plan ? <Super plan={plan} cambios={cambios[0]} orden={orden[0]} planId={props.planId} /> : <Locked planExiste={props.planExiste} />)}
            {tab === "porciones" && <Porciones plan={plan} planExiste={props.planExiste} />}
            {tab === "rutina" && <RutinaView rutina={rutina} videos={videos} pid={p.id} />}
            {!vistaPrevia && (
              <form action="/salir" method="post" style={{ textAlign: "center" }}>
                <button className="btn" style={{ fontSize: 13, padding: "6px 12px" }}>Salir</button>
              </form>
            )}
          </div>
          <nav className="ph-nav" role="tablist">
            {tabs.map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); window.scrollTo(0, 0); }}>
                {ICON[k]}{l}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

function Whats() {
  return (
    <div className="card" style={{ padding: 14 }}>
      <h4 style={{ fontSize: 15 }}>💌 ¿Dudas entre semana?</h4>
      <p className="note" style={{ margin: "4px 0 0" }}>
        Escríbeme por <a href="https://wa.me/971556889063" target="_blank" rel="noopener">WhatsApp</a>. Si algo del plan no te está funcionando, lo ajustamos; no tienes que esperar a la siguiente consulta.
      </p>
    </div>
  );
}

function Locked({ planExiste }: { planExiste: boolean }) {
  return (
    <div className="locked">
      {planExiste ? "Cecy todavía no comparte tu plan aquí." : "Tu plan llega 2 o 3 días después de tu primera consulta."}
      <br />Si tienes dudas, escríbele por WhatsApp.
    </div>
  );
}

function Metas({ p }: { p: Patient }) {
  const [hechas, toggle] = useLocalChecks(`metas-${p.id}`);
  if (!p.metas.length) return null;
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Tus metas{p.proxima_cita ? ` hasta el ${p.proxima_cita}` : ""}</div>
      {p.metas.map((t, i) => (
        <label key={i} className="check"><input type="checkbox" checked={!!hechas[t]} onChange={() => toggle(t)} /> {t}</label>
      ))}
    </div>
  );
}

function Hoy({ p, plan, planExiste, cambios, orden }: { p: Patient; plan: Plan | null; planExiste: boolean; cambios: Cambios; orden: Orden }) {
  const [di, setDi] = useState<number | null>(null);
  useEffect(() => { const d = new Date().getDay(); setDi(d === 0 ? 6 : d - 1); }, []);
  if (!plan) return <><Locked planExiste={planExiste} /><Metas p={p} /><Whats /></>;
  const d = di ?? 0;
  return (
    <>
      <div className="daychips" aria-label="Día">
        {CORTO.map((l, i) => (
          <button key={l} aria-pressed={i === d} onClick={() => setDi(i)} aria-label={i === 6 ? "Domingo" : DIAS[i]}>
            <b>{l[0]}</b>{l}
          </button>
        ))}
      </div>
      <div className="eyebrow">{d === 6 ? "Domingo" : DIAS[d]}</div>
      {d === 6 ? (
        <div className="tint t-yellow"><h4>🌤️ Domingo libre</h4><p>{plan.domingo}</p></div>
      ) : (
        TIEMPOS.map((_, i) => {
          const { m, src } = comidaDe(plan, orden[0], DIAS[d], i);
          return m.titulo ? (
            <MealCard key={`${d}-${i}-${src}`} m={m} hora={plan.horarios?.[i] ?? TIEMPOS[i][1]} tiempo={TIEMPOS[i][0]} tintClass={MEAL_TINT[i]}
              slot={(j) => slotDe(src, i, j)} cambios={cambios} sistema={plan.sistema ?? "smae"}
              opciones={opcionesDe(plan, i).map((o) => [o, plan.menu[o][i].titulo])} actual={src} onElegir={(o) => orden[1](DIAS[d], i, o)} />
          ) : null;
        })
      )}
      <Antojos />
      {plan.suplementos.length > 0 && (
        <div className="card" style={{ padding: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Tus suplementos</div>
          {plan.suplementos.map((s, i) => (
            <div key={i} className="ex"><span><b>{s.que}</b><br /><span className="note">{s.cuanto}</span></span><span className="note">{s.cuando}</span></div>
          ))}
        </div>
      )}
      {plan.tips[0] && <div className={`tint ${tint(plan.tips[0].color)}`}><h4>{plan.tips[0].icono} {plan.tips[0].titulo}</h4><p>{plan.tips[0].texto}</p></div>}
      <Metas p={p} />
      <Whats />
    </>
  );
}

function Semana({ plan, planExiste, cambios, orden }: { plan: Plan | null; planExiste: boolean; cambios: Cambios; orden: Orden }) {
  if (!plan) return <Locked planExiste={planExiste} />;
  return (
    <>
      {plan.objetivo && <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>{plan.objetivo}</p>}
      <div className="grid" style={{ gap: 10 }}>
        {plan.enfoques.map((e, i) => <div key={i} className={`tint ${tint(e.color)}`}><h4>{e.icono} {e.titulo}</h4><p>{e.texto}</p></div>)}
      </div>
      <div className="eyebrow" style={{ marginTop: 6 }}>Puedes repetir un platillo en otros días: elígelo en cada comida</div>
      {DIAS.map((d) => (
        <details key={d} className="card" style={{ padding: "12px 14px" }}>
          <summary style={{ cursor: "pointer", fontFamily: "var(--display)", fontWeight: 600 }}>{d}</summary>
          {TIEMPOS.map((_, i) => {
            const { m, src } = comidaDe(plan, orden[0], d, i);
            const ops = opcionesDe(plan, i);
            return m.titulo ? (
              <div key={i} className="meal">
                <div className="t">{TIEMPOS[i][0]} · {plan.horarios?.[i] ?? TIEMPOS[i][1]}</div>
                {ops.length > 1 ? (
                  <select className="elegir" value={src} onChange={(e) => orden[1](d, i, e.target.value as Dia)} aria-label={`${d}, ${TIEMPOS[i][0]}: qué platillo`}>
                    {ops.map((o) => <option key={o} value={o}>{plan.menu[o][i].titulo}{o !== d ? ` (del ${o.toLowerCase()})` : ""}</option>)}
                  </select>
                ) : m.titulo}
                {m.ingredientes?.length ? <div className="d">{resumenIngredientes(m, (j) => slotDe(src, i, j), cambios[0])}</div> : null}
                {m.detalle && <div className="d">{m.detalle}</div>}
              </div>
            ) : null;
          })}
        </details>
      ))}
      <div className="grid" style={{ gap: 10 }}>
        {plan.tips.map((t, i) => <div key={i} className={`tint ${tint(t.color)}`}><h4>{t.icono} {t.titulo}</h4><p>{t.texto}</p></div>)}
      </div>
    </>
  );
}

function Porciones({ plan, planExiste }: { plan: Plan | null; planExiste: boolean }) {
  if (!plan) return <Locked planExiste={planExiste} />;
  return (
    <>
      <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
        {plan.kcal && <>Tu día: ≈ {plan.kcal} kcal · ≈ {plan.proteina} g de proteína. </>}Para cambiar un alimento, toca <b>Cambiar</b> junto a él en tu menú de Hoy.
      </p>
      <div className="card" style={{ padding: 10 }}><PorcionesTable plan={plan} /></div>
      <div className="tint t-blue">
        <h4>Tu mano como medida</h4>
        {MANO.map(([i, t, d]) => <div key={t} className="ex"><span>{i} {t}<br /><span className="note">{d}</span></span></div>)}
      </div>
    </>
  );
}

function VideoBtn({ n, videos }: { n: string; videos: Record<string, string> }) {
  const url = videos[n];
  const [open, setOpen] = useState(false);
  if (!url) return <span className="vid novid">▶ Video pronto</span>;
  return (
    <>
      <button className="vid" onClick={() => setOpen((o) => !o)}>{open ? "Cerrar video" : "▶ Ver video"}</button>
      {open && <video src={url} controls playsInline autoPlay muted style={{ width: "100%", borderRadius: 12, marginTop: 6 }} />}
    </>
  );
}

function RutinaView({ rutina, videos, pid }: { rutina: Rutina | null; videos: Record<string, string>; pid: string }) {
  const [o, setO] = useState<"a" | "b" | "c">("a");
  const [g, setG] = useState(0);
  const [done, toggle] = useLocalChecks(`hechos-${pid}`);
  if (!rutina) return <div className="locked">Cecy todavía no comparte una rutina contigo.<br />Si quieres una, pídesela en tu próxima consulta.</div>;
  const d = rutina.dias[g];
  return (
    <>
      <div className="eyebrow">{rutina.titulo} · {rutina.subtitulo}</div>
      <div className="seg" role="group" aria-label="Dónde entrenas" style={{ display: "flex" }}>
        {(["a", "b", "c"] as const).map((k, i) => (
          <button key={k} aria-pressed={o === k} onClick={() => setO(k)} style={{ flex: 1, padding: "7px 6px", fontSize: 12.5 }}>{rutina.opciones[i]}</button>
        ))}
      </div>
      <div className="daychips">
        {rutina.dias.map((x, i) => (
          <button key={x.dia} aria-pressed={g === i} onClick={() => setG(i)} style={{ width: "auto", padding: "0 16px", height: 44 }}><b>{x.dia}</b></button>
        ))}
      </div>
      <div className="tint t-yellow">
        <h4>Calentamiento</h4>
        {d.calentamiento.map(([n, s]) => (
          <div key={n} className="ex"><span>{n}<br /><VideoBtn n={n} videos={videos} /></span><span className="note num">{s}</span></div>
        ))}
      </div>
      {d.ejercicios.map((f, i) => {
        const e = f[o];
        const id = `${g}-${o}-${i}`;
        return (
          <div key={id} className="gx">
            <div className="gn">{i + 1}</div>
            <div style={{ minWidth: 0 }}>
              <h4>{e.nombre}</h4>
              <div className="chips" style={{ margin: "6px 0" }}>
                <span className="chip num"><b>{e.series}</b></span>
                <span className="chip">Descanso {e.descanso}</span>
              </div>
              {e.aproximacion && (
                <details className="warm">
                  <summary>Series de aproximación</summary>
                  {e.aproximacion.map((t) => <div key={t} className="note">{t}</div>)}
                </details>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 100%" }}><VideoBtn n={e.nombre} videos={videos} /></div>
                <label className="check" style={{ padding: 0 }}>
                  <input type="checkbox" checked={!!done[id]} onChange={() => toggle(id)} /> Hecho
                </label>
              </div>
            </div>
          </div>
        );
      })}
      {d.cierre && <div className="tint t-green"><h4>{d.cierre}</h4><p>Para terminar tu sesión.</p></div>}
    </>
  );
}
