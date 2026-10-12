"use client";
import { useEffect, useMemo, useState } from "react";
import { BANDERA, PAIS, buscar, cantidad, cargarAlimentos, comoIngrediente, icono, iconoGrupo, nombreSubgrupo, type Alimento, type Ingrediente, type Sistema } from "@/lib/alimentos";
import { DIAS, type Comida, type Dia, type Plan } from "@/lib/types";

// Los cambios que hace la paciente se guardan solo en su teléfono, por plan.
export function useCambios(planId: string | null) {
  const key = `cambios-${planId ?? "plan"}`;
  const [v, setV] = useState<Record<string, Ingrediente>>({});
  useEffect(() => {
    try { setV(JSON.parse(localStorage.getItem(key) || "{}")); } catch {}
  }, [key]);
  const set = (slot: string, ing: Ingrediente | null) =>
    setV((old) => {
      const n = { ...old };
      if (ing) n[slot] = ing; else delete n[slot];
      try { localStorage.setItem(key, JSON.stringify(n)); } catch {}
      return n;
    });
  return [v, set] as const;
}
export type Cambios = ReturnType<typeof useCambios>;

export const slotDe = (dia: string, comida: number, ing: number) => `${dia}|${comida}|${ing}`;

// Qué platillo come cada día: "Miércoles|2" -> "Lunes" quiere decir la comida del lunes, el miércoles.
export function useOrden(planId: string | null) {
  const key = `orden-${planId ?? "plan"}`;
  const [v, setV] = useState<Record<string, Dia>>({});
  useEffect(() => {
    try { setV(JSON.parse(localStorage.getItem(key) || "{}")); } catch {}
  }, [key]);
  const set = (dia: Dia, i: number, src: Dia) =>
    setV((old) => {
      const n = { ...old };
      if (src === dia) delete n[`${dia}|${i}`]; else n[`${dia}|${i}`] = src;
      try { localStorage.setItem(key, JSON.stringify(n)); } catch {}
      return n;
    });
  return [v, set] as const;
}
export type Orden = ReturnType<typeof useOrden>;

/** La comida que toca en ese día y tiempo, y de qué día del plan viene. Los cambios de ingredientes viajan con el platillo. */
export function comidaDe(plan: Plan, orden: Record<string, Dia>, dia: Dia, i: number) {
  const src = orden[`${dia}|${i}`] ?? dia;
  return { m: plan.menu[src]?.[i] ?? plan.menu[dia][i], src };
}

/** Las opciones de ese tiempo de comida en la semana (sin repetir platillos iguales). */
export function opcionesDe(plan: Plan, i: number) {
  const vistos = new Set<string>();
  return DIAS.filter((d) => {
    const t = plan.menu[d][i]?.titulo?.trim();
    if (!t || vistos.has(t)) return false;
    vistos.add(t);
    return true;
  });
}

export function MealCard({ m, hora, tiempo, tintClass, slot, cambios, sistema, opciones = [], actual, onElegir }: {
  m: Comida; hora: string; tiempo: string; tintClass: string; slot: (j: number) => string; cambios: Cambios; sistema: Sistema;
  opciones?: [Dia, string][]; actual?: Dia; onElegir?: (d: Dia) => void;
}) {
  const [hechos, setCambio] = cambios;
  const [abierto, setAbierto] = useState<number | null>(null);
  const ings = m.ingredientes ?? [];
  return (
    <div className={`pmeal ${tintClass} ${ings.length ? "wide" : ""}`}>
      <div className="hr">{hora}<small>{tiempo}</small></div>
      <div style={{ minWidth: 0 }}>
        <h4>{m.titulo}</h4>
        {opciones.length > 1 && onElegir && (
          <select className="elegir" value={actual} onChange={(e) => onElegir(e.target.value as Dia)} aria-label={`Elegir otro platillo para ${tiempo}`}>
            {opciones.map(([d, t]) => <option key={d} value={d}>{d === actual ? "↻ Elegir otro platillo de la semana" : `${t} (del ${d.toLowerCase()})`}</option>)}
          </select>
        )}
        {ings.length > 0 && (
          <ul className="ings">
            {ings.map((orig, j) => {
              const cur = hechos[slot(j)] ?? orig;
              return (
                <li key={j}>
                  <span className="ic" aria-hidden="true">{icono(cur.n, cur.g)}</span>
                  <span className="nm">
                    {cur.n}
                    <b className="qt num">{cantidad(cur, orig.x)}</b>
                    {cur.id !== orig.id && <small>en lugar de {orig.n}</small>}
                  </span>
                  <button className="swap" onClick={() => setAbierto(j)}>Cambiar</button>
                </li>
              );
            })}
          </ul>
        )}
        {m.detalle && (ings.length > 0 ? (
          <details className="prep">
            <summary>Cómo prepararlo</summary>
            <p>{m.detalle}</p>
          </details>
        ) : <p>{m.detalle}</p>)}
      </div>
      {abierto !== null && (
        <SwapSheet
          orig={ings[abierto]}
          actual={hechos[slot(abierto)] ?? ings[abierto]}
          sistema={ings[abierto].s === "sup" ? "suplementos" : sistema}
          onPick={(a) => { setCambio(slot(abierto), a && a.id !== ings[abierto].id ? comoIngrediente(a, ings[abierto].x) : null); setAbierto(null); }}
          onClose={() => setAbierto(null)}
        />
      )}
    </div>
  );
}

function SwapSheet({ orig, actual, sistema, onPick, onClose }: {
  orig: Ingrediente; actual: Ingrediente; sistema: Sistema; onPick: (a: Alimento | null) => void; onClose: () => void;
}) {
  const [lista, setLista] = useState<Alimento[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [pais, setPais] = useState("");
  useEffect(() => { cargarAlimentos(sistema).then(setLista, () => setError(true)); }, [sistema]);
  useEffect(() => { try { setPais(localStorage.getItem("pais") || ""); } catch {} }, []);
  const elegirPais = (c: string) => { setPais(c); try { localStorage.setItem("pais", c); } catch {} };
  const esSup = sistema === "suplementos";
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  const opciones = useMemo(
    () => (lista ? buscar(lista, q, orig.g).filter((a) => a.id !== orig.id && (!pais || !a.paises || a.paises.includes(pais))).sort((a, b) => a.n.localeCompare(b.n, "es")) : []),
    [lista, q, orig, pais],
  );
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`Cambiar ${orig.n}`} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <div className="eyebrow">{iconoGrupo(orig.g)} {nombreSubgrupo(orig.g)}</div>
            <h3>Cambiar {esSup ? orig.n : orig.n.toLowerCase()}</h3>
            <p className="note">{esSup ? "Elige otra opción que encuentres donde vives." : <>Todas estas opciones valen lo mismo que {cantidad(orig, orig.x)} de {orig.n.toLowerCase()}.</>}</p>
          </div>
          <button className="btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        {esSup && (
          <div className="paises" role="group" aria-label="Dónde vives">
            <button aria-pressed={!pais} onClick={() => elegirPais("")}>Todos</button>
            {Object.keys(BANDERA).map((c) => <button key={c} aria-pressed={pais === c} onClick={() => elegirPais(c)}>{BANDERA[c]} {PAIS[c]}</button>)}
          </div>
        )}
        <input className="sheet-q" type="search" placeholder="Buscar, por ejemplo: pan, queso, fresa" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="sheet-list">
          {actual.id !== orig.id && (
            <button className="opt orig" onClick={() => onPick(null)}>
              <span>↩︎ Volver a {orig.n}</span><b className="num">{cantidad(orig, orig.x)}</b>
            </button>
          )}
          {error && <p className="note">No se pudo cargar la lista. Revisa tu internet e inténtalo otra vez.</p>}
          {!lista && !error && <p className="note">Cargando opciones…</p>}
          {lista && opciones.length === 0 && <p className="note">No encontré nada con “{q}” en este grupo.</p>}
          {opciones.slice(0, 200).map((a) => (
            <button key={a.id} className={`opt ${a.id === actual.id ? "on" : ""}`} onClick={() => onPick(a)}>
              <span>
                {icono(a.n, a.g) && <>{icono(a.n, a.g)} </>}{a.n}
                {esSup && <small className="supinfo">{[a.p ? `${a.p} g proteína` : "", a.k != null ? `${a.k} kcal` : "", a.nota ?? ""].filter(Boolean).join(" · ")} {!pais && (a.paises ?? []).map((c) => BANDERA[c]).join(" ")}</small>}
              </span><b className="num">{cantidad(a, orig.x)}</b>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Versión corta para "Mi semana": nombre y cantidad de cada ingrediente, con los cambios de la paciente. */
export function resumenIngredientes(m: Comida, slot: (j: number) => string, hechos: Record<string, Ingrediente>) {
  return (m.ingredientes ?? []).map((o, j) => { const c = hechos[slot(j)] ?? o; return `${c.n} (${cantidad(c, o.x)})`; }).join(" · ");
}
