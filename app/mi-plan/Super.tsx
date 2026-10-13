"use client";
import { useEffect, useMemo, useState } from "react";
import { cantidad, icono, type Ingrediente } from "@/lib/alimentos";
import { DIAS, TIEMPOS, type Dia, type Plan } from "@/lib/types";
import { comidaDe, slotDe } from "./Comidas";

const SECCIONES: [RegExp, string][] = [
  [/verdura/i, "🥦 Verduras"], [/fruta/i, "🍎 Frutas"], [/cereal/i, "🌾 Cereales, pan y tubérculos"], [/legumin/i, "🫘 Leguminosas"],
  [/a\.o\.a|origen animal/i, "🍗 Proteínas: carne, pescado, huevo y queso"], [/leche/i, "🥛 Lácteos"], [/grasa|aceite/i, "🥑 Grasas, nueces y semillas"],
];
const seccion = (i: Ingrediente) => (i.s === "sup" ? "💊 Suplementos y bebidas" : SECCIONES.find(([r]) => r.test(i.g))?.[1] ?? "🧂 Otros");

type Modo = "dia" | "semana" | "mes";
const MODOS: [Modo, string][] = [["dia", "Un día"], ["semana", "Esta semana"], ["mes", "Todo el mes"]];

/** Lista del súper que sale del menú que eligió la paciente, con sus cambios. Lunes a sábado; el domingo es libre. */
export default function Super({ plan, cambios, orden, planId }: { plan: Plan; cambios: Record<string, Ingrediente>; orden: Record<string, Dia>; planId: string | null }) {
  const [modo, setModoE] = useState<Modo>("semana");
  const [dia, setDia] = useState<Dia>(() => DIAS[Math.min((new Date().getDay() + 6) % 7, 5)]); // hoy; el domingo, el lunes
  useEffect(() => { try { const m = localStorage.getItem("super-modo") as Modo | null; if (m && MODOS.some(([k]) => k === m)) setModoE(m); } catch {} }, []);
  const setModo = (m: Modo) => { setModoE(m); try { localStorage.setItem("super-modo", m); } catch {} };
  const key = `super-${planId ?? "plan"}-${modo === "dia" ? `dia-${dia}` : modo}`;
  const [hecho, setHecho] = useState<Record<string, boolean>>({});
  useEffect(() => { try { setHecho(JSON.parse(localStorage.getItem(key) || "{}")); } catch { setHecho({}); } }, [key]);
  const toggle = (id: string) => setHecho((o) => { const n = { ...o, [id]: !o[id] }; try { localStorage.setItem(key, JSON.stringify(n)); } catch {} return n; });

  const { grupos, sinIngredientes } = useMemo(() => {
    const total = new Map<string, { a: Ingrediente; x: number }>();
    const sin: string[] = [];
    for (const d of modo === "dia" ? [dia] : DIAS)
      TIEMPOS.forEach((_, i) => {
        const { m, src } = comidaDe(plan, orden, d, i);
        if (!m.titulo) return;
        if (!m.ingredientes?.length) { if (!sin.includes(m.titulo)) sin.push(m.titulo); return; }
        m.ingredientes.forEach((o, j) => {
          const a = cambios[slotDe(src, i, j)] ?? o;
          const t = total.get(a.id) ?? { a, x: 0 };
          t.x += o.x;
          total.set(a.id, t);
        });
      });
    const g = new Map<string, { a: Ingrediente; x: number }[]>();
    for (const t of total.values()) g.set(seccion(t.a), [...(g.get(seccion(t.a)) ?? []), t]);
    const orden_ = [...SECCIONES.map(([, n]) => n), "💊 Suplementos y bebidas", "🧂 Otros"];
    return { grupos: [...g.entries()].sort((a, b) => orden_.indexOf(a[0]) - orden_.indexOf(b[0])).map(([n, xs]) => [n, xs.sort((p, q) => p.a.n.localeCompare(q.a.n, "es"))] as const), sinIngredientes: sin };
  }, [plan, cambios, orden, modo, dia]);

  const mult = modo === "mes" ? 4 : 1;
  return (
    <>
      <div className="seg" role="group" aria-label="Periodo" style={{ display: "flex" }}>
        {MODOS.map(([k, l]) => (
          <button key={k} aria-pressed={modo === k} onClick={() => setModo(k)} style={{ flex: 1, padding: "8px 6px" }}>{l}</button>
        ))}
      </div>
      {modo === "dia" && (
        <div className="daychips" role="group" aria-label="Día" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {DIAS.map((d) => (
            <button key={d} aria-pressed={dia === d} onClick={() => setDia(d)} style={{ width: "100%", minWidth: 0, padding: 0, height: 40, fontSize: 14 }}><b>{d.slice(0, 3)}</b></button>
          ))}
        </div>
      )}
      <p className="note" style={{ margin: 0 }}>
        {modo === "dia" ? `Lo que necesitas para tus comidas del ${dia.toLowerCase()}.` : modo === "semana" ? "De lunes a sábado, con los platillos y cambios que elegiste." : "4 semanas con tu menú de ahora. Las verduras y la fruta fresca, mejor cómpralas cada semana."}
        {" "}Si cambias un platillo o un alimento, la lista se actualiza sola.
      </p>
      {grupos.length === 0 && <div className="locked">Tu menú todavía no tiene ingredientes con cantidades. Cecy los agrega en tu plan.</div>}
      {grupos.map(([n, xs]) => (
        <div key={n} className="card" style={{ padding: "12px 14px" }}>
          <h4 style={{ fontSize: 15, marginBottom: 4 }}>{n}</h4>
          {xs.map(({ a, x }) => (
            <label key={a.id} className={`check superitem ${hecho[a.id] ? "done" : ""}`}>
              <input type="checkbox" checked={!!hecho[a.id]} onChange={() => toggle(a.id)} />
              <span className="nm">{icono(a.n, a.g) && <>{icono(a.n, a.g)} </>}{a.n}</span>
              <b className="num">{cantidad(a, x * mult)}</b>
            </label>
          ))}
        </div>
      ))}
      {sinIngredientes.length > 0 && (
        <p className="note" style={{ margin: 0 }}>No se suman porque no tienen ingredientes con cantidad: {sinIngredientes.join(", ")}.</p>
      )}
    </>
  );
}
