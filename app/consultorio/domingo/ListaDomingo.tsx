"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export type Fila = { id: string; nombre: string; activa: boolean; comparte: boolean; dias: number; ultima: string | null };

const corta = (iso: string) => `${Number(iso.slice(8))}/${Number(iso.slice(5, 7))}`;

export default function ListaDomingo({ filas, semana }: { filas: Fila[]; semana: string }) {
  const key = `domingo-${semana}`;
  const [hechas, setHechas] = useState<Record<string, boolean>>({});
  useEffect(() => { try { setHechas(JSON.parse(localStorage.getItem(key) || "{}")); } catch {} }, [key]);
  const marcar = (id: string) => setHechas((o) => { const n = { ...o, [id]: !o[id] }; try { localStorage.setItem(key, JSON.stringify(n)); } catch {} return n; });

  const registraron = filas.filter((f) => f.comparte && f.dias > 0).sort((a, b) => b.dias - a.dias);
  const sinRegistro = filas.filter((f) => f.comparte && f.dias === 0);
  const noComparten = filas.filter((f) => !f.comparte && f.activa);
  const listas = registraron.filter((f) => hechas[f.id]).length;

  const fila = (f: Fila, pill: React.ReactNode, check = true) => (
    <li key={f.id} className={hechas[f.id] ? "hecha" : ""}>
      {check && <input type="checkbox" checked={!!hechas[f.id]} onChange={() => marcar(f.id)} aria-label={`Ya le escribí a ${f.nombre}`} />}
      <Link href={`/consultorio/${f.id}?tab=semana`}>{f.nombre}</Link>
      {pill}
    </li>
  );
  return (
    <div className="grid domingo">
      <div className="card">
        <h3>Registraron su semana <span className="note">{listas} de {registraron.length} ya con mensaje</span></h3>
        {registraron.length ? <ul>{registraron.map((f) => fila(f, <span className={`pill ${f.dias >= 5 ? "p-ok" : "p-mid"}`}>{f.dias} de 7 días{f.ultima ? ` · último ${corta(f.ultima)}` : ""}</span>))}</ul>
          : <p className="note">Nadie ha registrado esta semana todavía.</p>}
      </div>
      {sinRegistro.length > 0 && (
        <div className="card">
          <h3>Comparten, pero no registraron</h3>
          <p className="note" style={{ marginTop: 0 }}>Un mensajito para animarlas a retomarlo.</p>
          <ul>{sinRegistro.map((f) => fila(f, <span className="pill p-warn">0 días</span>))}</ul>
        </div>
      )}
      {noComparten.length > 0 && (
        <div className="card">
          <h3>No comparten su registro</h3>
          <p className="note" style={{ marginTop: 0 }}>Lo llevan solo en su teléfono; puedes preguntarles cómo les fue.</p>
          <ul>{noComparten.map((f) => fila(f, null))}</ul>
        </div>
      )}
    </div>
  );
}
