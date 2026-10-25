"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { diasSinAbrir, haceCuanto } from "@/lib/visita";
import { citaCorta, esFutura } from "@/lib/cita";

type Row = { id: string; nombre: string; ciudad: string | null; proxima_cita: string | null; cita_at?: string | null; estado?: string; user_id?: string | null; ultima_visita?: string | null };
const COLORS = ["var(--pink)", "var(--blue)", "var(--yellow)", "var(--green)", "var(--lilac)"];

export default function PatientList({ rows, current }: { rows: Row[]; current?: string }) {
  const [q, setQ] = useState("");
  const [ahora, setAhora] = useState<Date | null>(null); // la fecha se calcula en su teléfono, no en el servidor
  useEffect(() => setAhora(new Date()), []);
  const [todas, setTodas] = useState(false);
  const terminadas = rows.filter((r) => r.estado === "termino").length;
  const list = rows.filter((r) => (todas || r.estado !== "termino") && r.nombre.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <input className="search" placeholder="Buscar paciente" aria-label="Buscar paciente" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="plist">
        {list.map((x, i) => (
          <li key={x.id}>
            <Link className="pbtn" href={`/consultorio/${x.id}`} aria-current={x.id === current}>
              <span className="av" style={{ background: COLORS[i % COLORS.length] }}>{x.nombre.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
              <span><span className="n">{x.nombre}</span>{x.estado === "pausa" && <span className="pill p-mid" style={{ marginLeft: 6 }}>En pausa</span>}{x.estado === "termino" && <span className="pill" style={{ marginLeft: 6 }}>Terminó</span>}<br /><span className="s">{[x.ciudad, x.cita_at ? (ahora && esFutura(x.cita_at, ahora) ? `cita: ${citaCorta(x.cita_at)}` : null) : x.proxima_cita && `cita: ${x.proxima_cita}`].filter(Boolean).join(" · ")}</span>
                {ahora && x.user_id && <><br /><span className={`s visto ${(diasSinAbrir(x.ultima_visita, ahora) ?? 99) >= 4 ? "lejos" : ""}`}>📱 {x.ultima_visita ? `Abrió la app: ${haceCuanto(x.ultima_visita, ahora).toLowerCase()}` : "Todavía no abre la app"}</span></>}</span>
            </Link>
          </li>
        ))}
        {!list.length && <li className="note" style={{ padding: 8 }}>{rows.length ? "Nadie con ese nombre." : "Todavía no tienes pacientes. Agrega la primera."}</li>}
      </ul>
      {terminadas > 0 && <button className="linklike" style={{ padding: 8 }} onClick={() => setTodas((v) => !v)}>{todas ? "Ocultar las que terminaron" : `Ver las que terminaron (${terminadas})`}</button>}
    </>
  );
}
