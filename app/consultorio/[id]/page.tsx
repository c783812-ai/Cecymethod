import Link from "next/link";
import { notFound } from "next/navigation";
import { requireNutri } from "@/lib/auth";
import { ejerciciosDe } from "@/lib/gluteos";
import type { Patient, Plan, Rutina } from "@/lib/types";
import Sidebar from "../Sidebar";
import { asignarRutina, borrarPaciente, guardarResumen } from "../actions";
import AccessPanel from "./AccessPanel";
import PlanEditor from "./PlanEditor";

const TABS = [
  ["resumen", "Ficha y acceso"],
  ["plan", "Plan de alimentación"],
  ["rutina", "Rutina"],
] as const;
type Tab = (typeof TABS)[number][0];

export default async function Ficha({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab: t } = await searchParams;
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
            <div className="eyebrow">{p.proxima_cita ? `Próxima cita: ${p.proxima_cita}` : "Sin cita"}</div>
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
                  <label className="field">Próxima cita<input name="proxima_cita" defaultValue={p.proxima_cita ?? ""} /></label>
                </div>
                <label className="field">Sus metas hasta la próxima consulta (una por renglón, máximo 3) · ella las ve<textarea name="metas" defaultValue={p.metas.join("\n")} /></label>
                <p className="note" style={{ margin: 0 }}>Su historia clínica, análisis y mediciones se quedan en tus archivos. Aquí no se guardan.</p>
                <div><button className="btn primary">Guardar</button></div>
              </form>
              <AccessPanel p={p} />
            </div>
            <details className="card">
              <summary style={{ cursor: "pointer", color: "var(--warn)", fontWeight: 600 }}>Borrar a esta paciente y todos sus datos</summary>
              <form action={borrarPaciente.bind(null, id)} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10, alignItems: "end" }}>
                <label className="field">Escribe BORRAR para confirmar<input name="confirmar" autoComplete="off" /></label>
                <button className="btn">Borrar para siempre</button>
              </form>
            </details>
          </div>
        )}

        {tab === "plan" && <PlanTab id={id} />}
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
  const actual = tpls?.find((t) => t.key === p.routine_key);
  return (
    <div className="grid">
      <form action={asignarRutina.bind(null, p.id)} className="card" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <label className="field" style={{ minWidth: 240 }}>Rutina asignada
          <select name="routine_key" key={p.routine_key ?? ""} defaultValue={p.routine_key ?? ""}>
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
