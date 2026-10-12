"use client";
import { useEffect, useMemo, useState } from "react";
import { BANDERA, NOTA_EU, PAIS } from "@/lib/alimentos";

type Antojo = { id: string; n: string; tipo: "dulce" | "salado"; porcion: string; k: number | null; p: number | null; nota?: string; paises: string[] };

const ICONO: [RegExp, string][] = [
  [/paleta|polo|calippo|capri|rakete|lolly|solero|outshine/i, "🍧"], [/helado|halo top|skinny cow|yasso/i, "🍨"], [/gelatina|pud|mousse/i, "🍮"],
  [/gomitas|sweets/i, "🍬"], [/palomitas|skinnypop/i, "🍿"], [/pretzel|saltletts/i, "🥨"], [/alga/i, "🌿"],
  [/edamame|garbanzo|lenteja|bean/i, "🫘"], [/arroz|tortitas|rice/i, "🍘"], [/maíz|tostadit|salmas/i, "🌽"], [/chips/i, "🥔"],
  [/chocolate|amaranto/i, "🍫"],
];
const iconoAntojo = (a: Antojo) => ICONO.find(([r]) => r.test(a.n))?.[1] ?? (a.tipo === "dulce" ? "🍫" : "🥨");

let cache: Promise<Antojo[]> | null = null;
const cargar = () => (cache ??= fetch("/alimentos/antojos.json").then((r) => (r.ok ? r.json() : Promise.reject(r.status))).catch((e) => { cache = null; throw e; }));

// Antojos fuera del plan: máximo 2 veces por semana. Se abre al tocarlo para no ocupar espacio en el día.
export default function Antojos() {
  const [lista, setLista] = useState<Antojo[] | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<"dulce" | "salado">("dulce");
  const [pais, setPais] = useState("");
  useEffect(() => { try { setPais(localStorage.getItem("pais") || ""); } catch {} }, []);
  useEffect(() => { if (abierto && !lista) cargar().then(setLista, () => setLista([])); }, [abierto, lista]);
  const elegirPais = (c: string) => { setPais(c); try { localStorage.setItem("pais", c); } catch {} };
  const ver = useMemo(
    () => (lista ?? []).filter((a) => a.tipo === tipo && (!pais || a.paises.includes(pais))).sort((a, b) => (a.k ?? 999) - (b.k ?? 999)),
    [lista, tipo, pais],
  );
  return (
    <details className="card antojos" onToggle={(e) => setAbierto((e.target as HTMLDetailsElement).open)}>
      <summary>
        <span className="eyebrow">¿Se te antojó algo?</span>
        <b>Antojos para máximo 2 veces por semana</b>
      </summary>
      <div className="seg" role="group" aria-label="Tipo de antojo">
        <button aria-pressed={tipo === "dulce"} onClick={() => setTipo("dulce")}>🍫 Dulce</button>
        <button aria-pressed={tipo === "salado"} onClick={() => setTipo("salado")}>🥨 Salado</button>
      </div>
      <div className="paises" role="group" aria-label="Dónde vives">
        <button aria-pressed={!pais} onClick={() => elegirPais("")}>Todos</button>
        {Object.keys(BANDERA).map((c) => <button key={c} aria-pressed={pais === c} onClick={() => elegirPais(c)}>{BANDERA[c]} {PAIS[c]}</button>)}
      </div>
        {pais === "EU" && <p className="note" style={{ margin: "2px 0 6px" }}>{NOTA_EU}</p>}
      {!lista ? <p className="note">Cargando…</p> : ver.length === 0 ? <p className="note">No hay opciones para este país todavía.</p> : (
        <ul className="ings">
          {ver.map((a) => (
            <li key={a.id}>
              <span className="ic" aria-hidden="true">{iconoAntojo(a)}</span>
              <span className="nm">
                {a.n}
                <b className="qt num">{a.porcion}{a.k != null ? ` · ${a.k} kcal` : ""}</b>
                <small className="supinfo">{[a.p ? `${a.p} g proteína` : "", a.nota ?? ""].filter(Boolean).join(" · ")} {!pais && a.paises.map((c) => BANDERA[c]).join(" ")}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="note" style={{ marginTop: 8 }}>Una porción por antojo, sin que sustituya tus comidas.</p>
    </details>
  );
}
