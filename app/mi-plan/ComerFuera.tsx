"use client";
import { useState } from "react";
import { LUGARES, REGLAS_FUERA } from "@/lib/comerFuera";

/** "¿Vas a comer fuera?": eliges el tipo de lugar y te dice qué pedir y qué evitar. */
export default function ComerFuera() {
  const [id, setId] = useState<string | null>(null);
  const l = LUGARES.find((x) => x.id === id);
  return (
    <details className="card antojos fuera">
      <summary>
        <span className="eyebrow">¿Vas a comer fuera?</span>
        <b>Qué pedir en un restaurante, fiesta o viaje</b>
      </summary>
      <div className="paises" role="group" aria-label="Tipo de lugar">
        {LUGARES.map((x) => <button key={x.id} aria-pressed={id === x.id} onClick={() => setId(id === x.id ? null : x.id)}>{x.ic} {x.n}</button>)}
      </div>
      {l ? (
        <>
          <h4 className="fuera-h">✅ Mejor pide</h4>
          <ul className="fuera-l">{l.pide.map((t) => <li key={t}>{t}</li>)}</ul>
          <h4 className="fuera-h">🚫 Mejor evita</h4>
          <ul className="fuera-l">{l.evita.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="reco"><b>💡 Tip</b>{l.tip}</p>
        </>
      ) : (
        <>
          <p className="note" style={{ margin: "4px 0 6px" }}>Elige dónde vas a comer. Mientras, estas reglas sirven en cualquier lugar:</p>
          <ul className="fuera-l">{REGLAS_FUERA.map((t) => <li key={t}>{t}</li>)}</ul>
        </>
      )}
    </details>
  );
}
