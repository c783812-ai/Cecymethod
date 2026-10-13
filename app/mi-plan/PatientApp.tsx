"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DIAS, TIEMPOS, type Dia, type Patient, type Plan, type Rutina } from "@/lib/types";
import { CALENTAMIENTO } from "@/lib/gluteos";
import { mesDelCiclo, proximoCambio } from "@/lib/ciclo";
import { MealCard, useGustos, type Gustos, comidaDe, opcionesDe, resumenIngredientes, slotDe, useCambios, useOrden, type Cambios, type Orden } from "./Comidas";
import Super from "./Super";
import Antojos from "./Antojos";
import Instalar from "./Instalar";
import Logros from "./Logros";
import Suplementos from "./Suplementos";
import { Encuesta, Renovar } from "./Renovar";
import Estadisticas from "./Estadisticas";
import { Descanso, SeriesLog, useCargas } from "./Cargas";
import { MetaBar, RegistroHoy, useDiario, type DiarioHook } from "./Diario";
import { aporte, hoyISO } from "@/lib/diario";
import { tint } from "@/components/shared";

const MEAL_TINT = ["t-yellow", "t-pink", "t-blue", "t-lilac", "t-green"];
const CORTO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
type Tab = "hoy" | "registro" | "semana" | "super" | "suple" | "rutina";

const ICON: Record<Tab, React.ReactNode> = {
  hoy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  registro: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" /></svg>,
  semana: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h10" /></svg>,
  super: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4h2l2.4 11h11.2L21 8H6.2" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></svg>,
  suple: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="7" y="3" width="10" height="4" rx="1" /><path d="M8 7h8v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" /><path d="M8 12h8" /></svg>,
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
  planDesde?: string | null; // cuándo se hizo su plan, para la encuesta y el botón de seguimiento
  rutina: Rutina | null;
  ciclo?: Rutina[] | null;
  videos: Record<string, string>;
  vistaPrevia: boolean;
}) {
  const { patient: p, plan, rutina, videos, vistaPrevia } = props;
  const [tab, setTab] = useState<Tab>("hoy");
  const cambios = useCambios(props.planId);
  const orden = useOrden(props.planId);
  const first = p.nombre.split(" ")[0];
  const remoto = !vistaPrevia && p.id !== "demo";
  const diario = useDiario(p.id, remoto, !!p.diario_consentido_at);
  const gustos = useGustos(p.id, remoto);
  const heads: Record<Tab, [string, React.ReactNode]> = {
    hoy: [`Hola, ${first}`, <>Tu <mark>día</mark></>],
    registro: ["Cómo te sentiste hoy", <>Mi <mark>registro</mark></>],
    semana: [plan?.titulo ?? "Tu plan", <>Tu <mark>semana</mark></>],
    super: ["Para tu día, semana o mes", <>Tu lista del <mark>súper</mark></>],
    suple: ["Para qué sirven y dónde comprarlos", <>Mis <mark>suplementos</mark></>],
    rutina: ["Ejercicio", <>Tu <mark>rutina</mark></>],
  };
  const tabs: [Tab, string][] = [["hoy", "Hoy"], ["registro", "Registro"], ["semana", "Semana"], ["super", "Súper"], ["suple", "Suplementos"], ["rutina", "Rutina"]];

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
            {tab === "hoy" && <Hoy p={p} plan={plan} planExiste={props.planExiste} planId={props.planId} planDesde={props.planDesde} cambios={cambios} orden={orden} diario={diario} gustos={gustos} instalar={!vistaPrevia} />}
            {tab === "registro" && <><Logros diario={diario[0]} vasos={plan?.agua || 8} /><Estadisticas diario={diario[0]} vasos={plan?.agua || 8} /><RegistroHoy diario={diario} vasos={plan?.agua || 8} /></>}
            {tab === "semana" && <Semana plan={plan} planExiste={props.planExiste} cambios={cambios} orden={orden} />}
            {tab === "super" && (plan ? <Super plan={plan} cambios={cambios[0]} orden={orden[0]} planId={props.planId} /> : <Locked planExiste={props.planExiste} />)}
            {tab === "suple" && <Suplementos recomendados={plan?.suplementos ?? []} />}
            {tab === "rutina" && <RutinaView rutina={rutina} ciclo={props.ciclo ?? null} videos={videos} pid={p.id} remoto={remoto} />}
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

function Hoy({ p, plan, planExiste, planId, planDesde, cambios, orden, diario, gustos, instalar }: { p: Patient; plan: Plan | null; planExiste: boolean; planId: string | null; planDesde?: string | null; cambios: Cambios; orden: Orden; diario: DiarioHook; gustos: Gustos; instalar: boolean }) {
  const [di, setDi] = useState<number | null>(null);
  const [hoyIdx, setHoyIdx] = useState<number | null>(null);
  useEffect(() => { const d = new Date().getDay(); setDi(d === 0 ? 6 : d - 1); setHoyIdx(d === 0 ? 6 : d - 1); }, []);
  if (!plan) return <><Locked planExiste={planExiste} /><Metas p={p} /><Whats /></>;
  const d = di ?? 0;
  const esHoy = d === hoyIdx;
  const fecha = hoyISO();
  const listas = diario[0][fecha]?.comidas ?? [];
  const delDia = d < 6 ? TIEMPOS.map((_, i) => {
    const { m, src } = comidaDe(plan, orden[0], DIAS[d], i);
    return { ...m, ingredientes: m.ingredientes?.map((o, j) => cambios[0][slotDe(src, i, j)] ?? o) };
  }) : [];
  const aportes = aporte(delDia, plan.meta ?? "comidas");
  const marcar = (i: number) => {
    const nuevas = listas.includes(i) ? listas.filter((x) => x !== i) : [...listas, i];
    const total = aportes.reduce((a, b) => a + b, 0);
    const pct = total ? Math.min(100, Math.round((nuevas.reduce((s, k) => s + (aportes[k] ?? 0), 0) / total) * 100)) : 0;
    diario[1](fecha, { comidas: nuevas, de: delDia.filter((m) => m.titulo).length, pct });
  };
  return (
    <>
      {instalar && <Instalar />}
      <Renovar nombre={p.nombre} desde={planDesde} proxima={p.proxima_cita} />
      {p.proxima_cita && <div className="card proxima"><span aria-hidden="true">📅</span><span><span className="eyebrow">Tu próxima consulta</span><br /><b>{p.proxima_cita}</b></span></div>}
      <div className="daychips" aria-label="Día">
        {CORTO.map((l, i) => (
          <button key={l} aria-pressed={i === d} onClick={() => setDi(i)} aria-label={i === 6 ? "Domingo" : DIAS[i]}>
            <b>{l[0]}</b>{l}
          </button>
        ))}
      </div>
      <div className="eyebrow">{d === 6 ? "Domingo" : DIAS[d]}</div>
      {esHoy && d < 6 && plan.meta && <MetaBar meta={plan.meta} aportes={aportes} listas={listas} />}
      {d === 6 ? (
        <div className="tint t-yellow"><h4>🌤️ Domingo libre</h4><p>{plan.domingo}</p></div>
      ) : (
        TIEMPOS.map((_, i) => {
          const { m, src } = comidaDe(plan, orden[0], DIAS[d], i);
          return m.titulo ? (
            <MealCard key={`${d}-${i}-${src}`} m={m} hora={plan.horarios?.[i] ?? TIEMPOS[i][1]} tiempo={TIEMPOS[i][0]} tintClass={MEAL_TINT[i]}
              slot={(j) => slotDe(src, i, j)} cambios={cambios} sistema={plan.sistema ?? "smae"}
              opciones={opcionesDe(plan, i).map((o) => [o, plan.menu[o][i].titulo])} actual={src} onElegir={(o) => orden[1](DIAS[d], i, o)}
              {...(esHoy ? { lista: listas.includes(i), onLista: () => marcar(i) } : {})}
              gusto={gustos[0][m.titulo]} onGusto={(v) => gustos[1](m.titulo, v)} />
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
      <Encuesta nombre={p.nombre} desde={planDesde} planId={planId} />
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

function RutinaView({ rutina: fija, ciclo, videos, pid, remoto }: { rutina: Rutina | null; ciclo: Rutina[] | null; videos: Record<string, string>; pid: string; remoto: boolean }) {
  // La rutina del mes se elige con la fecha de su teléfono, para que cambie a las 12:00 AM de su hora.
  const [mes, setMes] = useState(0);
  useEffect(() => { if (ciclo?.length) setMes(mesDelCiclo(new Date(), ciclo.length)); }, [ciclo]);
  const rutina = ciclo?.length ? ciclo[mes] : fija;
  const [o, setO] = useState<"a" | "b" | "c">("a");
  const [g, setG] = useState(0);
  const [done, toggle] = useLocalChecks(`hechos-${pid}`);
  const cargas = useCargas(pid, remoto);
  if (!rutina) return <div className="locked">Cecy todavía no comparte una rutina contigo.<br />Si quieres una, pídesela en tu próxima consulta.</div>;
  const d = rutina.dias[g];
  return (
    <>
      <div className="eyebrow">{ciclo?.length ? `Rutina del mes · Mes ${mes + 1} · ` : ""}{rutina.titulo} · {rutina.subtitulo}</div>
      {ciclo?.length ? <p className="note" style={{ margin: "-4px 0 0" }}>Todas hacemos esta rutina este mes. Cambia el {proximoCambio()}.</p> : null}
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
      <Descanso />
      <div className="seg unidad" role="group" aria-label="Unidad de peso">
        <span className="note">Anota tus pesos en</span>
        {(["kg", "lb"] as const).map((x) => <button key={x} aria-pressed={cargas.u === x} onClick={() => cargas.unidad(x)}>{x}</button>)}
      </div>
      <div className="tint t-yellow">
        <h4>Calentamiento</h4>
        <div style={{ marginTop: 6 }}><VideoBtn n={CALENTAMIENTO} videos={videos} /></div>
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
              <SeriesLog ejercicio={e.nombre} txt={e.series} descanso={e.descanso} cargas={cargas} />
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
