"use client";
import { useEffect, useState } from "react";
import { useAjustesApp } from "./guardado";

const PASOS: [string, string, string][] = [
  ["🔄", "Cambia lo que no te guste", "En cada comida toca “Cambiar” para elegir otro alimento con la misma porción, o elige otro platillo de la semana. Todo queda guardado en tu cuenta."],
  ["📝", "Llena tu registro", "En la pestaña Registro anota cada día tu agua, cómo te sentiste, tu sueño y tu actividad. Te toma un minuto."],
  ["💛", "Compártelo con Cecy", "Cuando aceptas compartir tu registro, Cecy ve cómo va tu semana y te ayuda a ajustar tu plan. También puedes activar un recordatorio a las 8 p.m."],
];

/** Tres pantallas la primera vez que abre su app. Se guarda en su cuenta que ya la vio. */
export default function Guia() {
  const [aj, setAj] = useAjustesApp();
  const [listo, setListo] = useState(false);
  const [i, setI] = useState(0);
  // Espera un momento a que llegue lo guardado en su cuenta, para no enseñarla otra vez en otro teléfono.
  useEffect(() => { const t = setTimeout(() => setListo(true), 1500); return () => clearTimeout(t); }, []);
  if (!listo || aj.guia) return null;
  const cerrar = () => setAj("guia", true);
  const [ic, t, x] = PASOS[i];
  return (
    <div className="guia" role="dialog" aria-modal="true" aria-label="Cómo usar tu app">
      <div className="guia-card">
        <div className="guia-ic" aria-hidden="true">{ic}</div>
        <h3>{t}</h3>
        <p>{x}</p>
        <div className="guia-dots" aria-hidden="true">{PASOS.map((_, k) => <span key={k} className={k === i ? "on" : ""} />)}</div>
        <button className="btn primary" style={{ width: "100%" }} onClick={() => (i < PASOS.length - 1 ? setI(i + 1) : cerrar())}>{i < PASOS.length - 1 ? "Siguiente" : "Empezar"}</button>
        {i < PASOS.length - 1 && <button className="linklike" style={{ marginTop: 10 }} onClick={cerrar}>Saltar</button>}
      </div>
    </div>
  );
}
