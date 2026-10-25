import Link from "next/link";
import { notFound } from "next/navigation";
import { requireNutri } from "@/lib/auth";
import { ejerciciosDe } from "@/lib/gluteos";
import type { Patient, Plan, Rutina } from "@/lib/types";
import Sidebar from "../Sidebar";
import { asignarRutina, borrarPaciente, guardarResumen } from "../actions";
import AccessPanel from "./AccessPanel";
import PlanEditor from "./PlanEditor";
import SemanaVista from "./SemanaVista";
import IdeasSuplementos from "./IdeasSuplementos";
import Historial from "./Historial";
import Pagos from "./Pagos";
import Previo from "./Previo";
import { ORIGENES } from "@/lib/mes";
import CitaInput from "../CitaInput";
import { FechaLocal } from "@/lib/cita";
import { hoyISO, type Registro } from "@/lib/diario";
import { CICLO, CICLO_KEY, mesDelCiclo, proximoCambio } from "@/lib/ciclo";

const TABS = [
  ["resumen", "Ficha y acceso"],
  ["previo", "Antes de la consulta"],
  ["semana", "Su semana"],
  ["plan", "Plan de alimentación"],
  ["rutina", "Rutina"],
  ["pagos", "Pagos"],
] as const;
type Tab = (typeof TABS)[number][0];

export default async function Ficha({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; semana?: string }> }) {
  const { id } = await params;
  const { tab: t, semana } = await searchParams;
  const tab: Tab = (TABS.find(([k]) => k === t)?.[0] ?? "resumen") as Tab;
  const { sb } = await requireNutri();

  const { data: p } = await sb.from("patients").select("*").eq("id", id).maybeSingle<Patient>();
  if (!p) notFound();

  return (
    <div className="office">
      <Sidebar current={id} />
      <section className="main">
        <div className="phead">
          <div>
            <div className="eyebrow">{p.cita_at ? <>Próxima cita: <FechaLocal iso={p.cita_at} /></> : p.proxima_cita ? `Próxima cita: ${p.proxima_cita}` : "Sin cita"}</div>
            <h1>{p.nombre}</h1>
            {p.ciudad && <div className="meta">Vive en {p.ciudad}</div>}
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
            <div className="grid g2">
              <form action={guardarResumen.bind(null, id)} className="card grid" style={{ gap: 12 }}>
                <h3 style={{ margin: 0 }}>Ficha</h3>
                <div className="form-grid">
                  <label className="field">Nombre<input name="nombre" defaultValue={p.nombre} /></label>
                  <label className="field">Vive en<input name="ciudad" defaultValue={p.ciudad ?? ""} /></label>
                  <label className="field">Estado<select name="estado" defaultValue={p.estado ?? "activa"}><option value="activa">Activa</option><option value="pausa">En pausa</option><option value="termino">Terminó</option></select></label>
                  <label className="field">Cómo llegó<select name="origen" defaultValue={p.origen ?? ""}><option value="">Sin anotar</option>{ORIGENES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                  <CitaInput iso={p.cita_at} nombre={p.nombre} />
                  {!p.cita_at && p.proxima_cita && <p className="note" style={{ margin: 0 }}>Antes tenías escrito: “{p.proxima_cita}”. Ponla con fecha y hora para guardarla.</p>}
                </div>
                <label className="field">Sus metas hasta la próxima consulta (una por renglón, máximo 3) · ella las ve<textarea name="metas" defaultValue={p.metas.join("\n")} /></label>
                <p className="note" style={{ margin: 0 }}>Su historia clínica, análisis y mediciones se quedan en tus archivos. Aquí no se guardan.</p>
                <div><button className="btn primary">Guardar</button></div>
              </form>
              <AccessPanel p={p} />
            </div>
            <IdeasSuplementos metas={p.metas} />
            <Historial id={id} />
            <details className="card">
              <summary style={{ cursor: "pointer", color: "var(--warn)", fontWeight: 600 }}>Borrar a esta paciente y todos sus datos</summary>
              <form action={borrarPaciente.bind(null, id)} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10, alignItems: "end" }}>
                <label className="field">Escribe BORRAR para confirmar<input name="confirmar" autoComplete="off" /></label>
                <button className="btn">Borrar para siempre</button>
              </form>
            </details>
          </div>
        )}

        {tab === "semana" && <SemanaTab p={p} lunes={semana} />}
        {tab === "plan" && <PlanTab id={id} />}
        {tab === "pagos" && <Pagos id={id} />}
        {tab === "previo" && <Previo p={p} />}
        {tab === "rutina" && <RutinaTab p={p} />}
      </section>
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
  const m = mesDelCiclo();
  const actual = tpls?.find((t) => t.key === (p.routine_key === CICLO_KEY ? CICLO[m].key : p.routine_key));
  return (
    <div className="grid">
      <form action={asignarRutina.bind(null, p.id)} className="card" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <label className="field" style={{ minWidth: 240 }}>Rutina asignada
          <select name="routine_key" key={p.routine_key ?? ""} defaultValue={p.routine_key ?? ""}>
            <option value="">Sin rutina</option>
            <option value={CICLO_KEY}>Rutina del mes (la misma para todas)</option>
            {tpls?.map((t) => <option key={t.key} value={t.key}>{t.titulo}</option>)}
          </select>
        </label>
        <button className="btn primary">Guardar</button>
        <span className={`pill ${p.routine_visible ? "p-ok" : "p-mid"}`}>{p.routine_visible ? "Visible para ella" : "Oculta para ella"}</span>
        <span className="note">Muéstrala u ocúltala desde Resumen.</span>
        {p.routine_key === CICLO_KEY && <p className="note" style={{ flexBasis: "100%", margin: 0 }}>Este mes toca el <b>Mes {m + 1} de {CICLO.length}</b>. Cambia sola el {proximoCambio()}.</p>}
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

const masDias = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
function lunesDe(iso?: string) {
  const d = iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

async function SemanaTab({ p, lunes: l }: { p: Patient; lunes?: string }) {
  const { sb } = await requireNutri();
  const lunes = lunesDe(l);
  const fechas = Array.from({ length: 7 }, (_, i) => hoyISO(masDias(lunes, i)));
  const [{ data: filas }, { data: planRow }] = await Promise.all([
    sb.from("diario").select("fecha, data").eq("patient_id", p.id).gte("fecha", fechas[0]).lte("fecha", fechas[6]),
    sb.from("plans").select("data").eq("patient_id", p.id).eq("activo", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const regs = Object.fromEntries((filas ?? []).map((f) => [f.fecha as string, f.data as Registro]));
  const nav = (n: number) => `/consultorio/${p.id}?tab=semana&semana=${hoyISO(masDias(lunes, n))}`;
  return <SemanaVista p={p} plan={(planRow?.data as Plan | undefined) ?? null} regs={regs} fechas={fechas} antes={nav(-7)} despues={nav(7)} />;
}
