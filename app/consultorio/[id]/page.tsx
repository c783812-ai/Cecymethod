import Link from "next/link";
import { notFound } from "next/navigation";
import { requireNutri } from "@/lib/auth";
import { HISTORIA } from "@/lib/historia";
import { ejerciciosDe } from "@/lib/gluteos";
import { ETAPAS, type Measurement, type Patient, type Plan, type Rutina } from "@/lib/types";
import { LabsTable, MedTable, TrendChart, fechaCorta } from "@/components/shared";
import Sidebar from "../Sidebar";
import { agregarMedicion, agregarSeguimiento, asignarRutina, borrarMedicion, borrarPaciente, guardarHistoria, guardarResumen } from "../actions";
import AccessPanel from "./AccessPanel";
import LabsEditor from "./LabsEditor";
import PlanEditor from "./PlanEditor";

const TABS = [
  ["resumen", "Resumen"],
  ["historia", "Historia clínica"],
  ["analisis", "Análisis"],
  ["mediciones", "Mediciones"],
  ["plan", "Plan de alimentación"],
  ["rutina", "Rutina"],
  ["seguimiento", "Seguimientos"],
] as const;
type Tab = (typeof TABS)[number][0];

export default async function Ficha({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab: t } = await searchParams;
  const tab: Tab = (TABS.find(([k]) => k === t)?.[0] ?? "resumen") as Tab;
  const { sb } = await requireNutri();

  const { data: p } = await sb.from("patients").select("*").eq("id", id).maybeSingle<Patient>();
  if (!p) notFound();
  const { data: priv } = await sb.from("patient_private").select("*").eq("patient_id", id).maybeSingle();
  const historia = (priv?.historia ?? {}) as Record<string, string>;
  const alertas = (priv?.alertas ?? []) as string[];

  const edad = p.fecha_nacimiento ? Math.floor((Date.now() - new Date(p.fecha_nacimiento).getTime()) / 3.15576e10) : null;

  return (
    <div className="office">
      <Sidebar current={id} />
      <section className="main">
        <div className="phead">
          <div>
            <div className="eyebrow">{p.consulta_numero ? `Consulta ${p.consulta_numero} · ` : ""}{p.proxima_cita ? `Próxima: ${p.proxima_cita}` : "Sin cita"}</div>
            <h1>{p.nombre}</h1>
            <div className="meta">
              {[edad != null ? `${edad} años` : null, p.pais_origen ? `De ${p.pais_origen}` : null, p.ciudad ? `vive en ${p.ciudad}` : null].filter(Boolean).join(" · ")}
            </div>
          </div>
          <Link className="btn primary" href={`/mi-plan?como=${p.id}`}>Ver lo que ve ella</Link>
        </div>
        <div className="tabs" role="tablist">
          {TABS.map(([k, l]) => (
            <Link key={k} role="tab" href={`/consultorio/${id}?tab=${k}`} aria-selected={tab === k} scroll={false}>{l}</Link>
          ))}
        </div>

        {tab === "resumen" && (
          <div className="grid">
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 10 }}>En qué paso va</div>
              <ol className="journey">
                {ETAPAS.map(([n, d], i) => (
                  <li key={n} className={i < p.etapa ? "done" : i === p.etapa ? "now" : ""}><span className="k">{i + 1}</span><b>{n}</b>{d}</li>
                ))}
              </ol>
            </div>
            <div className="grid g2">
              <form action={guardarResumen.bind(null, id)} className="card grid" style={{ gap: 12 }}>
                <h3 style={{ margin: 0 }}>Ficha</h3>
                <div className="form-grid">
                  <label className="field">Nombre<input name="nombre" defaultValue={p.nombre} /></label>
                  <label className="field">Fecha de nacimiento<input name="fecha_nacimiento" type="date" defaultValue={p.fecha_nacimiento ?? ""} /></label>
                  <label className="field">Vive en<input name="ciudad" defaultValue={p.ciudad ?? ""} /></label>
                  <label className="field">País de origen<input name="pais_origen" defaultValue={p.pais_origen ?? ""} /></label>
                  <label className="field">Paso
                    <select name="etapa" defaultValue={p.etapa}>{ETAPAS.map(([n], i) => <option key={n} value={i}>{i + 1}. {n}</option>)}</select>
                  </label>
                  <label className="field">Consulta número<input name="consulta_numero" type="number" min={0} defaultValue={p.consulta_numero} /></label>
                  <label className="field">Próxima cita<input name="proxima_cita" defaultValue={p.proxima_cita ?? ""} /></label>
                </div>
                <label className="field">Objetivo<textarea name="objetivo" defaultValue={p.objetivo ?? ""} /></label>
                <label className="field">Sus metas hasta la próxima consulta (una por renglón, máximo 3) · ella las ve<textarea name="metas" defaultValue={p.metas.join("\n")} /></label>
                <label className="field">Logros para su página de avance (uno por renglón) · ella los ve<textarea name="logros" defaultValue={p.logros.join("\n")} /></label>
                <label className="field">Para referir o vigilar (uno por renglón) · solo tú<textarea name="alertas" defaultValue={alertas.join("\n")} /></label>
                <label className="field">Notas · solo tú<textarea name="notas" defaultValue={priv?.notas ?? ""} /></label>
                <div><button className="btn primary">Guardar</button></div>
              </form>
              <div className="grid" style={{ alignContent: "start" }}>
                {alertas.length > 0 && (
                  <div className="card">
                    <h3>Para referir o vigilar</h3>
                    {alertas.map((a) => <p key={a} style={{ margin: "0 0 6px" }}><span className="pill p-warn">Atención</span> {a}</p>)}
                  </div>
                )}
                <AccessPanel p={p} />
              </div>
            </div>
          </div>
        )}

        {tab === "historia" && (
          <form action={guardarHistoria.bind(null, id)} className="grid">
            <label className="card switch" style={{ borderBottom: "1px solid var(--line)" }}>
              <span>Me autoriza a guardar y usar sus datos de salud para su plan de alimentación</span>
              <input type="checkbox" name="consentimiento" defaultChecked={!!priv?.consentimiento} />
            </label>
            {HISTORIA.map((h, i) => (
              <details key={h.hoja} className="card" open={i === 0}>
                <summary style={{ cursor: "pointer" }}><h3 style={{ display: "inline", margin: 0 }}>Hoja {i + 1} · {h.hoja}</h3></summary>
                <div className="form-grid" style={{ marginTop: 12 }}>
                  {h.campos.map(([k, label, tipo]) => (
                    <label key={k} className="field" style={tipo === "largo" ? { gridColumn: "1 / -1" } : undefined}>
                      {label}
                      {tipo === "largo" ? <textarea name={k} defaultValue={historia[k] ?? ""} /> : <input name={k} type={tipo === "fecha" ? "date" : tipo === "numero" ? "number" : "text"} defaultValue={historia[k] ?? ""} />}
                    </label>
                  ))}
                </div>
              </details>
            ))}
            <p className="note" style={{ margin: 0 }}>Los análisis de laboratorio van en la pestaña Análisis y las mediciones en Mediciones. Ella nunca ve esta historia.</p>
            <div><button className="btn primary">Guardar historia clínica</button></div>
          </form>
        )}

        {tab === "analisis" && (
          <div className="grid">
            {p.labs.length > 0 && (
              <div className="card">
                <h3>Laboratorio</h3>
                {p.labs_fecha && <p className="note" style={{ marginTop: -4 }}>{p.labs_fecha}</p>}
                <LabsTable labs={p.labs} />
              </div>
            )}
            <LabsEditor id={id} labs={p.labs} fecha={p.labs_fecha ?? ""} />
          </div>
        )}

        {tab === "mediciones" && <Mediciones id={id} />}
        {tab === "plan" && <PlanTab id={id} />}
        {tab === "rutina" && <RutinaTab p={p} />}

        {tab === "seguimiento" && <Seguimientos id={id} />}

        {tab === "resumen" && (
          <details className="card" style={{ marginTop: 24 }}>
            <summary style={{ cursor: "pointer", color: "var(--warn)", fontWeight: 600 }}>Borrar a esta paciente y todos sus datos</summary>
            <form action={borrarPaciente.bind(null, id)} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10, alignItems: "end" }}>
              <label className="field">Escribe BORRAR para confirmar<input name="confirmar" autoComplete="off" /></label>
              <button className="btn">Borrar para siempre</button>
            </form>
          </details>
        )}
      </section>
    </div>
  );
}

async function Mediciones({ id }: { id: string }) {
  const { sb } = await requireNutri();
  const { data } = await sb.from("measurements").select("*").eq("patient_id", id).order("fecha");
  const med = (data ?? []) as Measurement[];
  return (
    <div className="grid">
      {med.length > 0 ? (
        <div className="grid g2">
          <div className="card"><h3>Última comparación</h3><MedTable med={med} /></div>
          <div className="card">
            <h3>Tendencia</h3>
            {med.length > 1 ? <TrendChart med={med} /> : <p className="note">Con la siguiente medición verás aquí su tendencia. Compara tendencia, no un número suelto.</p>}
          </div>
        </div>
      ) : (
        <div className="empty">Todavía no hay mediciones.</div>
      )}
      <div className="card">
        <h3>Agregar medición</h3>
        <form action={agregarMedicion.bind(null, id)} className="inline">
          <label>Fecha<input name="fecha" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label>
          <label>Peso (kg)<input name="peso" type="number" step="0.1" /></label>
          <label>Cintura (cm)<input name="cintura" type="number" step="0.1" /></label>
          <label>Cadera (cm)<input name="cadera" type="number" step="0.1" /></label>
          <label>Músculo (kg)<input name="musculo" type="number" step="0.1" /></label>
          <label>Grasa (%)<input name="grasa" type="number" step="0.1" /></label>
          <label>Visceral<input name="visceral" type="number" step="1" /></label>
          <button className="btn primary">Guardar</button>
        </form>
        <p className="note">InBody en el mismo equipo y a la misma hora, fuera de los días de su regla.</p>
      </div>
      {med.length > 0 && (
        <div className="card">
          <h3>Todas las mediciones</h3>
          <div className="tablewrap">
            <table>
              <thead><tr><th>Fecha</th><th className="c">Peso</th><th className="c">Cintura</th><th className="c">Cadera</th><th className="c">Músculo</th><th className="c">Grasa</th><th className="c">Visceral</th><th /></tr></thead>
              <tbody>
                {[...med].reverse().map((m) => (
                  <tr key={m.id}>
                    <td>{fechaCorta(m.fecha)}</td>
                    {(["peso", "cintura", "cadera", "musculo", "grasa", "visceral"] as const).map((k) => <td key={k} className="c num">{m[k] ?? "—"}</td>)}
                    <td><form action={borrarMedicion.bind(null, id, m.id)}><button className="btn" style={{ padding: "3px 8px", fontSize: 12 }}>Borrar</button></form></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

async function PlanTab({ id }: { id: string }) {
  const { sb } = await requireNutri();
  const { data } = await sb.from("plans").select("id, data, updated_at").eq("patient_id", id).eq("activo", true).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  const { count } = await sb.from("plans").select("id", { count: "exact", head: true }).eq("patient_id", id).eq("activo", false);
  return <PlanEditor id={id} planId={data?.id ?? null} inicial={(data?.data as Plan) ?? null} anteriores={count ?? 0} />;
}

async function RutinaTab({ p }: { p: Patient }) {
  const { sb } = await requireNutri();
  const { data: tpls } = await sb.from("routine_templates").select("key, titulo, data");
  const actual = tpls?.find((t) => t.key === p.routine_key);
  return (
    <div className="grid">
      <form action={asignarRutina.bind(null, p.id)} className="card" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <label className="field" style={{ minWidth: 240 }}>Rutina asignada
          <select name="routine_key" defaultValue={p.routine_key ?? ""}>
            <option value="">Sin rutina</option>
            {tpls?.map((t) => <option key={t.key} value={t.key}>{t.titulo}</option>)}
          </select>
        </label>
        <button className="btn primary">Guardar</button>
        <span className={`pill ${p.routine_visible ? "p-ok" : "p-mid"}`}>{p.routine_visible ? "Visible para ella" : "Oculta para ella"}</span>
        <span className="note">Muéstrala u ocúltala desde Resumen.</span>
      </form>
      {actual && (
        <div className="card">
          <h3>{(actual.data as Rutina).titulo} · {(actual.data as Rutina).subtitulo}</h3>
          <div className="tablewrap">
            <table>
              <thead><tr><th>Ejercicio</th><th>Días</th></tr></thead>
              <tbody>{ejerciciosDe(actual.data as Rutina).map((e) => <tr key={e.nombre}><td>{e.nombre}{e.calentamiento && <span className="note"> · calentamiento</span>}</td><td className="note">{e.dias.join(", ")}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="note">Los videos se suben una sola vez en <Link href="/consultorio/videos">Videos</Link>.</p>
        </div>
      )}
    </div>
  );
}

const SEG_CAMPOS: [string, string, "corto" | "largo"][] = [
  ["adherencia", "Del 1 al 10, ¿cuánto siguió el plan?", "corto"],
  ["comidas_fuera", "Comidas fuera del plan por semana", "corto"],
  ["hambre", "¿Llegó con hambre a las comidas?", "corto"],
  ["energia", "Energía (1–10)", "corto"],
  ["sueno", "Sueño (1–10)", "corto"],
  ["digestion", "Digestión (1–10)", "corto"],
  ["animo", "Ánimo (1–10)", "corto"],
  ["antojos", "Antojos (1–10)", "corto"],
  ["estres", "Estrés (1–10)", "corto"],
  ["funciono", "Lo que le funcionó y quiere mantener", "largo"],
  ["costo", "Lo que le costó trabajo y por qué", "largo"],
  ["platillos", "Platillos que le gustaron y los que no", "largo"],
  ["sintomas", "Síntomas: mejoraron, siguen igual, aparecieron nuevos", "largo"],
  ["ciclo", "Ciclo, evacuaciones, ejercicio, pasos, agua, suplementos", "largo"],
  ["contexto", "Lo que pasó estas semanas: viajes, enfermedad, visitas, trabajo", "largo"],
  ["ajustes", "Ajustes al plan: qué cambia y qué se queda igual", "largo"],
  ["metas", "Metas hasta la siguiente consulta (una por renglón, máximo 3) · actualiza las de su página", "largo"],
  ["proxima_cita", "Próxima cita", "corto"],
];

async function Seguimientos({ id }: { id: string }) {
  const { sb } = await requireNutri();
  const { data } = await sb.from("followups").select("*").eq("patient_id", id).order("fecha", { ascending: false });
  return (
    <div className="grid">
      <details className="card" open={!data?.length}>
        <summary style={{ cursor: "pointer" }}><h3 style={{ display: "inline", margin: 0 }}>Nueva hoja de seguimiento</h3></summary>
        <form action={agregarSeguimiento.bind(null, id)} className="grid" style={{ marginTop: 12 }}>
          <div className="form-grid">
            <label className="field">Fecha<input type="date" name="fecha" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
            {SEG_CAMPOS.filter((c) => c[2] === "corto").map(([k, l]) => <label key={k} className="field">{l}<input name={k} /></label>)}
          </div>
          {SEG_CAMPOS.filter((c) => c[2] === "largo").map(([k, l]) => <label key={k} className="field">{l}<textarea name={k} /></label>)}
          <p className="note" style={{ margin: 0 }}>Las mediciones de hoy agrégalas en la pestaña Mediciones.</p>
          <div><button className="btn primary">Guardar seguimiento</button></div>
        </form>
      </details>
      {data?.map((s) => {
        const d = s.data as Record<string, string>;
        return (
          <div key={s.id} className="card">
            <div className="eyebrow">{fechaCorta(s.fecha)} · Consulta {s.numero}</div>
            <div className="chips" style={{ margin: "8px 0" }}>
              {d.adherencia && <span className="chip">Siguió el plan: <b>{d.adherencia}/10</b></span>}
              {d.energia && <span className="chip">Energía: <b>{d.energia}/10</b></span>}
              {d.animo && <span className="chip">Ánimo: <b>{d.animo}/10</b></span>}
            </div>
            <dl className="kv">
              {SEG_CAMPOS.filter(([k]) => d[k] && !["adherencia", "energia", "animo"].includes(k)).map(([k, l]) => (
                <div key={k} style={{ display: "contents" }}><dt>{l}</dt><dd style={{ whiteSpace: "pre-wrap" }}>{d[k]}</dd></div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
