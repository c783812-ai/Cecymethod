"use client";
import Link from "next/link";
import { useState } from "react";
import { ETAPAS } from "@/lib/types";

type Row = { id: string; nombre: string; ciudad: string | null; etapa: number };
const COLORS = ["var(--pink)", "var(--blue)", "var(--yellow)", "var(--green)", "var(--lilac)"];

export default function PatientList({ rows, current }: { rows: Row[]; current?: string }) {
  const [q, setQ] = useState("");
  const list = rows.filter((r) => r.nombre.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <input className="search" placeholder="Buscar paciente" aria-label="Buscar paciente" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="plist">
        {list.map((x, i) => (
          <li key={x.id}>
            <Link className="pbtn" href={`/consultorio/${x.id}`} aria-current={x.id === current}>
              <span className="av" style={{ background: COLORS[i % COLORS.length] }}>{x.nombre.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
              <span><span className="n">{x.nombre}</span><br /><span className="s">{x.ciudad ? `${x.ciudad} · ` : ""}{ETAPAS[x.etapa]?.[0]}</span></span>
            </Link>
          </li>
        ))}
        {!list.length && <li className="note" style={{ padding: 8 }}>{rows.length ? "Nadie con ese nombre." : "Todavía no tienes pacientes. Agrega la primera."}</li>}
      </ul>
    </>
  );
}
