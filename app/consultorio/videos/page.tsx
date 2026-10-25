import { requireNutri } from "@/lib/auth";
import { GUIA_GLUTEOS, NOMBRE_EN, ejerciciosDe } from "@/lib/gluteos";
import { CICLO, mesDelCiclo } from "@/lib/ciclo";
import { actualizarGluteos } from "../actions";
import type { Rutina } from "@/lib/types";
import VideoRow from "./VideoRow";

export const metadata = { title: "Videos · Cecy" };

export default async function Videos() {
  const { sb } = await requireNutri();
  const [{ data: tpls }, { data: vids }] = await Promise.all([
    sb.from("routine_templates").select("key, titulo, data"),
    sb.from("exercise_videos").select("nombre, storage_path, updated_at"),
  ]);
  const listos = new Map((vids ?? []).map((v) => [v.nombre, v]));
  const ej = new Map<string, { dias: string[]; calentamiento: boolean; rutinas: string[] }>();
  for (const t of tpls ?? [])
    for (const e of ejerciciosDe(t.data as Rutina)) {
      const prev = ej.get(e.nombre);
      ej.set(e.nombre, { dias: [...new Set([...(prev?.dias ?? []), ...e.dias])], calentamiento: e.calentamiento, rutinas: [...(prev?.rutinas ?? []), t.titulo] });
    }
  const lista = [...ej.entries()];
  const mes = mesDelCiclo();
  const delMes = new Set(ejerciciosDe(CICLO[mes].rutina).map((e) => e.nombre));
  const ahora = lista.filter(([n]) => delMes.has(n)), despues = lista.filter(([n]) => !delMes.has(n));
  const ok = ahora.filter(([n]) => listos.has(n)).length;
  const fila = ([n, i]: (typeof lista)[number]) => <VideoRow key={n} nombre={n} dias={i.dias.join(", ")} calentamiento={i.calentamiento} listo={!!listos.get(n)} />;
  return (
    <section className="main" style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <div className="phead">
        <div>
          <div className="eyebrow">Biblioteca</div>
          <h1>Videos de ejercicios</h1>
          <div className="meta">Subes cada video una sola vez y aparece en todas las rutinas y pacientes que usen ese ejercicio.</div>
        </div>
        <span className="pill p-info num">Este mes: {ok} de {ahora.length} listos</span>
      </div>
      {(viejaGluteos(tpls?.find((t) => t.key === "gluteos")?.data as Rutina | undefined) || CICLO.some((c, i) => tpls?.find((t) => t.key === c.key)?.titulo !== `Mes ${i + 1} · ${c.rutina.titulo}`)) && (
        <form action={actualizarGluteos} className="tint t-yellow" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <p style={{ margin: 0, flex: "1 1 260px" }}><b>Hay rutinas nuevas o actualizadas:</b> la rutina del mes (Mes 1, Mes 2…), días 1, 2 y 3, nombres en inglés y el calentamiento como un solo video. Los videos que ya subiste se pasan solos.</p>
          <button className="btn primary">Actualizar</button>
        </form>
      )}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Rutina de este mes · Mes {mes + 1} ({CICLO[mes].rutina.titulo})</h3>
        <p className="note">Solo estos los ven tus pacientes ahora. Gimnasio y Mancuernas y bandas.</p>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Ejercicio</th><th>Días</th><th>Video</th></tr></thead>
            <tbody>{ahora.map(fila)}</tbody>
          </table>
        </div>
        <p className="note">De 15 a 30 segundos, sin sonido. Expórtalo en 720p y 30 FPS (unos 25 MB). Formatos MP4 o MOV, máximo 50 MB por video.</p>
      </div>
      {despues.length > 0 && (
        <details className="card">
          <summary><b>Meses siguientes</b> <span className="note">({despues.filter(([n]) => listos.has(n)).length} de {despues.length} listos · todavía no urgen)</span></summary>
          <div className="tablewrap" style={{ marginTop: 12 }}>
            <table>
              <thead><tr><th>Ejercicio</th><th>Días</th><th>Video</th></tr></thead>
              <tbody>{despues.map(fila)}</tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}

/** La guía guardada todavía tiene los nombres en español o la lista de calentamiento. */
function viejaGluteos(r?: Rutina) {
  return !r || r.dias.some((d) => d.calentamiento.length > 0) || ejerciciosDe(r).some((e) => e.nombre in NOMBRE_EN)
    || r.dias.map((d) => d.dia).join() !== GUIA_GLUTEOS.dias.map((d) => d.dia).join();
}
