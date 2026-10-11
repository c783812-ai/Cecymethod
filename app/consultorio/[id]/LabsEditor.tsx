"use client";
import { useState, useTransition } from "react";
import { MARCADORES } from "@/lib/historia";
import type { Lab } from "@/lib/types";
import { guardarLabs } from "../actions";

const LECTURAS = ["", "En rango", "Límite", "Baja", "Alta"] as const;

export default function LabsEditor({ id, labs, fecha }: { id: string; labs: Lab[]; fecha: string }) {
  const [rows, setRows] = useState<Lab[]>(labs.length ? labs : MARCADORES.map(([m, u]) => ({ marcador: m, resultado: "", unidad: u, referencia: "", lectura: "" })));
  const [f, setF] = useState(fecha);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const set = (i: number, k: keyof Lab, v: string) => { setSaved(false); setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x))); };
  return (
    <div className="card">
      <h3>{labs.length ? "Editar análisis" : "Capturar análisis"}</h3>
      <label className="field" style={{ marginBottom: 10 }}>Laboratorio, fecha de la toma, día del ciclo, ¿en ayuno?
        <input value={f} onChange={(e) => { setSaved(false); setF(e.target.value); }} placeholder="2 oct 2026 · Synlab Stuttgart · en ayuno · día 9 del ciclo" />
      </label>
      <div className="tablewrap">
        <table>
          <thead><tr><th>Marcador</th><th>Resultado</th><th>Unidad</th><th>Rango del laboratorio</th><th>Lectura</th><th /></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td><input className="mini" style={{ width: 170, textAlign: "left" }} value={r.marcador} onChange={(e) => set(i, "marcador", e.target.value)} /></td>
                <td><input className="mini" style={{ width: 80 }} value={r.resultado} onChange={(e) => set(i, "resultado", e.target.value)} /></td>
                <td><input className="mini" style={{ width: 80 }} value={r.unidad} onChange={(e) => set(i, "unidad", e.target.value)} /></td>
                <td><input className="mini" style={{ width: 110 }} value={r.referencia} onChange={(e) => set(i, "referencia", e.target.value)} /></td>
                <td>
                  <select className="mini" style={{ width: 100 }} value={r.lectura} onChange={(e) => set(i, "lectura", e.target.value)}>
                    {LECTURAS.map((l) => <option key={l} value={l}>{l || "—"}</option>)}
                  </select>
                </td>
                <td><button className="btn" style={{ padding: "3px 8px", fontSize: 12 }} onClick={() => setRows((x) => x.filter((_, j) => j !== i))}>Quitar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn" onClick={() => setRows((x) => [...x, { marcador: "", resultado: "", unidad: "", referencia: "", lectura: "" }])}>+ Otro marcador</button>
        <button className="btn primary" disabled={pending} onClick={() => start(async () => { await guardarLabs(id, rows, f); setSaved(true); })}>Guardar análisis</button>
        {saved && <span className="pill p-ok">Guardado</span>}
        <span className="note">Solo se guardan los marcadores con resultado.</span>
      </div>
    </div>
  );
}
