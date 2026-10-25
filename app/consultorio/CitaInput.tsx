"use client";
import { useState } from "react";
import { linkGoogle } from "@/lib/cita";

const local = (iso: string) => { const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

/** Fecha y hora de la cita en TU hora; se guarda como momento exacto y ella la ve en la suya. */
export default function CitaInput({ iso, nombre, label = "Próxima consulta · ella la ve en su hora" }: { iso?: string | null; nombre?: string; label?: string }) {
  const [v, setV] = useState(iso ? local(iso) : "");
  const exacta = v ? new Date(v).toISOString() : "";
  return (
    <div className="field citainput">
      <label htmlFor="cita">{label}</label>
      <div className="row">
        <input id="cita" type="datetime-local" value={v} onChange={(e) => setV(e.target.value)} />
        {v && <button type="button" className="linklike" onClick={() => setV("")}>Quitar</button>}
      </div>
      <input type="hidden" name="cita_at" value={exacta} />
      {exacta && nombre && (
        <a className="btn" href={linkGoogle(`Consulta · ${nombre}`, exacta, 60, "Consulta de nutrición · Cecy Method")} target="_blank" rel="noreferrer">📅 Agregar a Google Calendar</a>
      )}
    </div>
  );
}
