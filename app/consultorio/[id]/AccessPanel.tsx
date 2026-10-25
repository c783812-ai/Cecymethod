"use client";
import { useState, useTransition } from "react";
import type { Patient } from "@/lib/types";
import { cambiarAcceso, invitar } from "../actions";
import { haceCuanto } from "@/lib/visita";

export default function AccessPanel({ p }: { p: Patient }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const estado = p.user_id ? (p.invitada_at ? "Activa" : "Con cuenta") : p.invitada_at ? "Invitada" : "Sin invitar";
  const sw = (campo: "plan_visible" | "routine_visible" | "suplementos_visible", label: string, val: boolean) => (
    <div className="switch">
      <label htmlFor={campo}>{label}</label>
      <input id={campo} type="checkbox" defaultChecked={val} onChange={(e) => start(() => cambiarAcceso(p.id, campo, e.target.checked))} />
    </div>
  );
  return (
    <div className="card">
      <h3>Acceso de la paciente</h3>
      <dl className="kv" style={{ marginBottom: 10 }}>
        <dt>Correo</dt><dd style={{ wordBreak: "break-all" }}>{p.email}</dd>
        <dt>Cuenta</dt><dd><span className={`pill ${estado === "Sin invitar" ? "p-mid" : "p-ok"}`}>{estado}</span></dd>
        {p.user_id && <><dt>Abrió la app</dt><dd suppressHydrationWarning>{p.ultima_visita ? `${haceCuanto(p.ultima_visita)} · ${new Date(p.ultima_visita).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : "Todavía no"}</dd></>}
      </dl>
      <button className="btn" disabled={pending} onClick={() => start(async () => setMsg(await invitar(p.id)))}>
        {p.invitada_at ? "Mandar enlace de acceso otra vez" : "Mandar invitación"}
      </button>
      {msg && <div className={`msg ${msg.ok ? "ok" : "err"}`} style={{ marginTop: 8 }}>{msg.msg}</div>}
      {sw("plan_visible", "Puede ver su plan de alimentación", p.plan_visible)}
      {sw("routine_visible", "Puede ver su rutina de ejercicio", p.routine_visible)}
      {sw("suplementos_visible", "Puede ver Suplementos y comprar en línea", !!p.suplementos_visible)}
      <p className="note" style={{ margin: "8px 0 0" }}>Ella solo ve lo que actives aquí, más sus metas.</p>
    </div>
  );
}
