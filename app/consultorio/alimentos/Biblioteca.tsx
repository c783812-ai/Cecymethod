"use client";
import { useEffect, useMemo, useState } from "react";
import { buscar, cantidad, cargarAlimentos, icono, nombreSubgrupo, type Alimento, type Sistema } from "@/lib/alimentos";

const ORIGEN = { smae: "SMAE", europa: "Europa", renal: "Renal" } as const;

export default function Biblioteca() {
  const [sistema, setSistema] = useState<Sistema>("smae");
  const [lista, setLista] = useState<Alimento[] | null>(null);
  const [q, setQ] = useState("");
  const [g, setG] = useState("");
  const [soloEu, setSoloEu] = useState(false);
  useEffect(() => { setLista(null); setG(""); cargarAlimentos(sistema).then(setLista, () => setLista([])); }, [sistema]);
  const grupos = useMemo(() => [...new Set((lista ?? []).map((a) => a.g))], [lista]);
  const res = useMemo(() => (lista ? buscar(lista, q, g || undefined).filter((a) => !soloEu || a.o === "europa") : []), [lista, q, g, soloEu]);
  const renal = sistema === "renal";
  return (
    <div className="card">
      <div className="form-grid" style={{ alignItems: "end", marginBottom: 10 }}>
        <label className="field">Lista
          <select value={sistema} onChange={(e) => setSistema(e.target.value as Sistema)}>
            <option value="smae">SMAE + europeos</option>
            <option value="renal">Renal</option>
          </select>
        </label>
        <label className="field">Subgrupo
          <select value={g} onChange={(e) => setG(e.target.value)}>
            <option value="">Todos</option>
            {grupos.map((x) => <option key={x} value={x}>{icono(x)} {nombreSubgrupo(x)}</option>)}
          </select>
        </label>
        <label className="field">Buscar<input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="skyr, pan, lenteja…" /></label>
        {!renal && <label className="check"><input type="checkbox" checked={soloEu} onChange={(e) => setSoloEu(e.target.checked)} /> Solo europeos</label>}
      </div>
      <p className="note num">{lista ? `${res.length} alimentos${res.length > 300 ? " (se muestran los primeros 300)" : ""}` : "Cargando…"}</p>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Alimento</th><th>Subgrupo</th><th>1 equivalente</th><th className="c">kcal</th><th className="c">Prot.</th><th className="c">Grasa</th><th className="c">HC</th>
              {renal ? <><th className="c">K mg</th><th className="c">P mg</th><th className="c">Na mg</th></> : <th>Origen</th>}
            </tr>
          </thead>
          <tbody>
            {res.slice(0, 300).map((a) => (
              <tr key={a.id}>
                <td>{a.n}</td>
                <td className="note">{icono(a.g)} {nombreSubgrupo(a.g)}</td>
                <td className="num">{cantidad(a, 1)}</td>
                <td className="c num">{a.k ?? "·"}</td><td className="c num">{a.p ?? "·"}</td><td className="c num">{a.l ?? "·"}</td><td className="c num">{a.h ?? "·"}</td>
                {renal ? <><td className="c num">{a.k_mg ?? "·"}</td><td className="c num">{a.fo ?? "·"}</td><td className="c num">{a.na ?? "·"}</td></> : <td className="note">{ORIGEN[a.o]}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
