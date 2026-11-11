"use client";
import { useEffect, useState } from "react";
import Recordatorio from "./Recordatorio";
import Link from "next/link";
import { useCita, esFutura } from "@/lib/cita";
import { DIAS7, TIEMPOS, diasDe, tieneDomingo, type Dia, type Patient, type Plan, type Rutina } from "@/lib/types";
import { cantidad, icono, type Ingrediente } from "@/lib/alimentos";
import { CALENTAMIENTO } from "@/lib/gluteos";
import { mesDelCiclo, proximoCambio } from "@/lib/ciclo";
import { MealCard, useGustos, type Gustos, comidaDe, opcionesDe, slotDe, useCambios, useOrden, type Cambios, type Orden, TiendaAbierta } from "./Comidas";
import Super from "./Super";
import Antojos from "./Antojos";
import Instalar from "./Instalar";
import Logros from "./Logros";
import Suplementos from "./Suplementos";
import { AjustesApp, Cuenta, useAjustesGuardados, useGuardadoCuenta } from "./guardado";
import SinInternet from "./SinInternet";
import Guia from "./Guia";
import MisPagos, { type MisPagosData } from "./MisPagos";
import { Encuesta, Renovar } from "./Renovar";
import Estadisticas from "./Estadisticas";
import { Descanso, SeriesLog, useCargas } from "./Cargas";
import { MetaBar, RegistroHoy, useDiario, type DiarioHook } from "./Diario";
import { aporte, hoyISO } from "@/lib/diario";
import { tint } from "@/components/shared";
import { AjustesPaciente, evitarDe, useG } from "@/lib/paciente";

const MEAL_TINT = ["t-yellow", "t-pink", "t-blue", "t-lilac", "t-green"];
const CORTO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
type Tab = "hoy" | "registro" | "super" | "suple" | "rutina";

const ICON: Record<Tab, React.ReactNode> = {
  hoy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  registro: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" /></svg>,
  super: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4h2l2.4 11h11.2L21 8H6.2" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></svg>,
  suple: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="7" y="3" width="10" height="4" rx="1" /><path d="M8 7h8v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" /><path d="M8 12h8" /></svg>,
  rutina: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" /></svg>,
};

// Lo que la paciente palomea se guarda en su teléfono y en su cuenta.
function useChecks(key: string) {
  const [v, cambiar] = useGuardadoCuenta<Record<string, boolean>>(key);
  const toggle = (k: string) => cambiar((old) => ({ ...old, [k]: !old[k] }));
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
  clavePush?: string | null;
  pagos?: MisPagosData | null;
}) {
  const { patient: p, plan, rutina, videos, vistaPrevia } = props;
  const [tab, setTab] = useState<Tab>("hoy");
  const first = p.nombre.split(" ")[0];
  const remoto = !vistaPrevia && p.id !== "demo";
  const cambios = useCambios(props.planId, p.id, remoto);
  const orden = useOrden(props.planId, p.id, remoto);
  const diario = useDiario(p.id, remoto, !!p.diario_consentido_at);
  const gustos = useGustos(p.id, remoto);
  const ajustes = useAjustesGuardados(p.id, remoto);
  const heads: Record<Tab, [string, React.ReactNode]> = {
    hoy: [`Hola, ${first}`, <>Tu <mark>día</mark></>],
    registro: ["Cómo te sentiste hoy", <>Mi <mark>registro</mark></>],
    super: ["Para tu día, semana o mes", <>Tu lista del <mark>súper</mark></>],
    suple: ["Para qué sirven y dónde comprarlos", <>Mis <mark>suplementos</mark></>],
    rutina: ["Ejercicio", <>Tu <mark>rutina</mark></>],
  };
  const tabs: [Tab, string][] = [["hoy", "Hoy"], ["registro", "Registro"], ["super", "Súper"], ["suple", "Suplementos"], ["rutina", "Rutina"]];

  return (
    <AjustesPaciente.Provider value={{ genero: plan?.genero === "m" ? "m" : "f", evitar: evitarDe(plan) }}>
    <TiendaAbierta.Provider value={!!p.suplementos_visible}>
    <Cuenta.Provider value={{ pid: p.id, remoto }}>
    <AjustesApp.Provider value={ajustes}>
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
            {!vistaPrevia && <SinInternet />}
            {!vistaPrevia && plan && <Guia />}
            {tab === "hoy" && <Hoy p={p} plan={plan} planExiste={props.planExiste} planId={props.planId} planDesde={props.planDesde} cambios={cambios} orden={orden} diario={diario} gustos={gustos} instalar={!vistaPrevia} pagos={props.pagos ?? null} />}
            {tab === "registro" && <>{remoto && <Recordatorio pid={p.id} clave={props.clavePush ?? null} />}<Logros diario={diario[0]} vasos={plan?.agua || 8} /><Estadisticas diario={diario[0]} vasos={plan?.agua || 8} /><RegistroHoy diario={diario} vasos={plan?.agua || 8} /></>}
            {tab === "super" && (plan ? <Super plan={plan} cambios={cambios[0]} orden={orden[0]} planId={props.planId} /> : <Locked planExiste={props.planExiste} />)}
            {tab === "suple" && (p.suplementos_visible ? <Suplementos recomendados={plan?.suplementos ?? []} /> : <PorAbrir />)}
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
    </AjustesApp.Provider>
    </Cuenta.Provider>
    </TiendaAbierta.Provider>
    </AjustesPaciente.Provider>
  );
}

/** Suplementos todavía cerrado para esta paciente. */
function PorAbrir() {
  return (
    <div className="card" style={{ padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 36 }} aria-hidden="true">🔒</div>
      <h4 style={{ fontSize: 16, margin: "6px 0 4px" }}>Muy pronto</h4>
      <p className="note" style={{ margin: 0 }}>Esta sección todavía no está habilitada para ti. Cecy te avisará cuando esté lista.</p>
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

/** Sus metas se marcan cada día; la racha cuenta los días seguidos que la cumplió (hasta hoy, o hasta ayer si hoy aún no la marca). */
function Metas({ p }: { p: Patient }) {
  const cita = useCita(p);
  const key = `metas-dia-${p.id}`;
  const [dias, cambiar] = useGuardadoCuenta<Record<string, string[]>>(key);
  if (!p.metas.length) return null;
  const hoy = hoyISO();
  const toggle = (t: string) =>
    cambiar((old) => {
      const s = new Set(old[t] ?? []);
      if (s.has(hoy)) s.delete(hoy); else s.add(hoy);
      return { ...old, [t]: [...s].sort().slice(-120) };
    });
  const racha = (t: string) => {
    const s = new Set(dias[t] ?? []);
    const d = new Date();
    if (!s.has(hoyISO(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (s.has(hoyISO(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  };
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="eyebrow" style={{ marginBottom: 2 }}>Tus metas de hoy</div>
      {cita && <p className="note" style={{ margin: "0 0 6px" }}>Hasta tu consulta del {cita}. Márcalas cada día que las cumplas.</p>}
      {p.metas.map((t, i) => {
        const r = racha(t);
        return (
          <label key={i} className="check" style={{ alignItems: "center" }}>
            <input type="checkbox" checked={(dias[t] ?? []).includes(hoy)} onChange={() => toggle(t)} />
            <span style={{ flex: 1 }}>{t}</span>
            {r > 0 && <span className="note" style={{ whiteSpace: "nowrap" }}>🔥 {r} {r === 1 ? "día" : "días"}</span>}
          </label>
        );
      })}
    </div>
  );
}

function Hoy({ p, plan, planExiste, planId, planDesde, cambios, orden, diario, gustos, instalar, pagos }: { pagos: MisPagosData | null; p: Patient; plan: Plan | null; planExiste: boolean; planId: string | null; planDesde?: string | null; cambios: Cambios; orden: Orden; diario: DiarioHook; gustos: Gustos; instalar: boolean }) {
  const cita = useCita(p);
  const [di, setDi] = useState<number | null>(null);
  const [hoyIdx, setHoyIdx] = useState<number | null>(null);
  useEffect(() => { const d = new Date().getDay(); setDi(d === 0 ? 6 : d - 1); setHoyIdx(d === 0 ? 6 : d - 1); }, []);
  if (!plan) return <><Locked planExiste={planExiste} /><Metas p={p} /><MisPagos d={pagos} /><Whats /></>;
  const d = di ?? 0;
  const esHoy = d === hoyIdx;
  const conMenu = d < 6 || tieneDomingo(plan); // el domingo es libre si no trae menú
  const fecha = hoyISO();
  const listas = diario[0][fecha]?.comidas ?? [];
  const delDia = conMenu ? TIEMPOS.map((_, i) => {
    const { m, src } = comidaDe(plan, orden[0], DIAS7[d], i);
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
      <Renovar nombre={p.nombre} desde={planDesde} proxima={p.cita_at ? (esFutura(p.cita_at) ? p.cita_at : null) : p.proxima_cita} />
      {cita && <div className="card proxima"><span aria-hidden="true">📅</span><span><span className="eyebrow">Tu próxima consulta</span><br /><b>{cita}</b><br /><span className="note">En la hora de tu teléfono</span></span></div>}
      <div className="daychips" aria-label="Día">
        {CORTO.map((l, i) => (
          <button key={l} aria-pressed={i === d} onClick={() => setDi(i)} aria-label={DIAS7[i]}>
            <b>{l[0]}</b>{l}
          </button>
        ))}
      </div>
      {esHoy && conMenu && <Ahora plan={plan} orden={orden[0]} cambios={cambios[0]} dia={DIAS7[d]} listas={listas} onLista={marcar} />}
      <div className="eyebrow">{DIAS7[d]}</div>
      {esHoy && conMenu && plan.meta && <MetaBar meta={plan.meta} aportes={aportes} listas={listas} />}
      {!conMenu ? (
        <div className="tint t-yellow"><h4>🌤️ Domingo libre</h4><p>{plan.domingo}</p></div>
      ) : (
        TIEMPOS.map((_, i) => {
          const { m, src } = comidaDe(plan, orden[0], DIAS7[d], i);
          return m.titulo ? (
            <MealCard key={`${d}-${i}-${src}`} m={m} hora={plan.horarios?.[i] ?? TIEMPOS[i][1]} tiempo={TIEMPOS[i][0]} tintClass={MEAL_TINT[i]}
              slot={(j) => slotDe(src, i, j)} cambios={cambios} sistema={plan.sistema ?? "smae"}
              opciones={opcionesDe(plan, i).map((o) => [o, plan.menu[o][i].titulo])} actual={src} onElegir={(o) => orden[1](DIAS7[d], i, o)} onRepetir={() => orden[2](i, src, diasDe(plan))}
              {...(esHoy ? { lista: listas.includes(i), onLista: () => marcar(i) } : {})}
              gusto={gustos[0][m.titulo]} onGusto={(v) => gustos[1](m.titulo, v)} />
          ) : null;
        })
      )}
      {conMenu && <VolverAlPlan cambios={cambios} orden={orden} />}
      <Antojos />
      {plan.suplementos.length > 0 && (
        <div className="card" style={{ padding: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Tus suplementos</div>
          {plan.suplementos.map((s, i) => (
            <div key={i} className="ex"><span><b>{s.que}</b><br /><span className="note">{s.cuanto}</span></span><span className="note">{s.cuando}</span></div>
          ))}
        </div>
      )}
      {plan.tips.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginTop: 6 }}>Recomendaciones para ti</div>
          {plan.tips.map((t, i) => <div key={i} className={`tint ${tint(t.color)}`}><h4>{t.icono} {t.titulo}</h4><p>{t.texto}</p></div>)}
        </>
      )}
      <Encuesta nombre={p.nombre} desde={planDesde} planId={planId} />
      <Metas p={p} />
      <MisPagos d={pagos} />
      <Whats />
    </>
  );
}

/** "8:30", "1:00 pm", "13 h" -> minutos del día. */
function minutos(h: string) {
  const m = /(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?\s?m|p\.?\s?m)?/i.exec(h ?? "");
  if (!m) return null;
  let hh = Number(m[1]);
  const pm = m[3] && /p/i.test(m[3]);
  if (pm && hh < 12) hh += 12;
  if (m[3] && !pm && hh === 12) hh = 0;
  return hh * 60 + Number(m[2] ?? 0);
}

/** Lo que le toca comer ahora, con cantidades: la primera comida de hoy que no ha marcado y cuya hora no pasó hace más de hora y media. */
function Ahora({ plan, orden, cambios, dia, listas, onLista }: { plan: Plan; orden: Record<string, Dia>; cambios: Record<string, Ingrediente>; dia: Dia; listas: number[]; onLista: (i: number) => void }) {
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    const tic = () => { const d = new Date(); setAhora(d.getHours() * 60 + d.getMinutes()); };
    tic();
    const t = setInterval(tic, 60_000);
    return () => clearInterval(t);
  }, []);
  if (ahora === null) return null;
  const idx = TIEMPOS.map((_, i) => i).find((i) => {
    const { m } = comidaDe(plan, orden, dia, i);
    const h = minutos(plan.horarios?.[i] ?? TIEMPOS[i][1]);
    return m.titulo && !listas.includes(i) && h !== null && h + 90 > ahora;
  });
  if (idx === undefined) return null;
  const { m, src } = comidaDe(plan, orden, dia, idx);
  const hora = plan.horarios?.[idx] ?? TIEMPOS[idx][1];
  const h = minutos(hora) ?? 0;
  const cuando = h <= ahora ? "Te toca ahora" : h - ahora <= 60 ? `En ${h - ahora} min` : `A las ${hora}`;
  return (
    <div className="card ahora">
      <div className="eyebrow">{cuando} · {TIEMPOS[idx][0]}</div>
      <b>{m.titulo}</b>
      {m.ingredientes?.length ? (
        <ul className="ings">
          {m.ingredientes.map((o, j) => {
            const a = cambios[slotDe(src, idx, j)] ?? o;
            return <li key={j}><span className="ic" aria-hidden="true">{icono(a.n, a.g)}</span><span className="nm">{a.n}<b className="qt num">{cantidad(a, o.x)}</b></span></li>;
          })}
        </ul>
      ) : m.detalle ? <p className="note" style={{ margin: "4px 0 0" }}>{m.detalle}</p> : null}
      <button className="lista" style={{ marginTop: 8 }} onClick={() => onLista(idx)}>Marcar como lista</button>
    </div>
  );
}

/** Quita todos sus cambios de platillos e ingredientes y deja el menú como lo armó Cecy. */
function VolverAlPlan({ cambios, orden }: { cambios: Cambios; orden: Orden }) {
  const [paso, setPaso] = useState<0 | 1 | 2>(0);
  const hay = Object.keys(cambios[0]).length + Object.keys(orden[0]).length > 0;
  if (paso === 2) return <p className="note" style={{ textAlign: "center", margin: 0 }}>✓ Tu menú volvió a como lo armó Cecy.</p>;
  if (!hay) return null;
  return (
    <div className="card volver" style={{ padding: "10px 14px", textAlign: "center" }}>
      {paso === 0 ? (
        <button className="linklike" onClick={() => setPaso(1)}>↺ Volver al plan original de Cecy</button>
      ) : (
        <p className="note" style={{ margin: 0 }}>Se quitan todos tus cambios de platillos y alimentos de la semana. <button className="linklike" onClick={() => { cambios[2](); orden[3](); setPaso(2); }}>Sí, volver</button> · <button className="linklike" onClick={() => setPaso(0)}>No</button></p>
      )}
    </div>
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
  const [done, toggle] = useChecks(`hechos-${pid}`);
  const cargas = useCargas(pid, remoto);
  const t = useG();
  if (!rutina) return <div className="locked">Cecy todavía no comparte una rutina contigo.<br />Si quieres una, pídesela en tu próxima consulta.</div>;
  const d = rutina.dias[g];
  return (
    <>
      <div className="eyebrow">{ciclo?.length ? `Rutina del mes · Mes ${mes + 1} · ` : ""}{rutina.titulo} · {rutina.subtitulo}</div>
      {ciclo?.length ? <p className="note" style={{ margin: "-4px 0 0" }}>{t("Todas hacemos")} esta rutina este mes. Cambia el {proximoCambio()}.</p> : null}
      <div className="seg" role="group" aria-label="Dónde entrenas" style={{ display: "flex" }}>
        {/* Cecy quitó la opción "En casa" (b): solo gimnasio y mancuernas y bandas */}
        {([["a", 0], ["c", 2]] as const).map(([k, i]) => (
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
              <SeriesLog ejercicio={e.nombre} txt={e.series} descanso={e.descanso} cargas={cargas} aproximacion={e.aproximacion} />
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
