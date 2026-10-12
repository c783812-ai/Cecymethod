"use client";
import { logrosDe } from "@/lib/logros";
import type { Diario } from "@/lib/diario";

const dias = (n: number) => `${n} ${n === 1 ? "día" : "días"}`;

/** Rachas y logros: se calculan con lo que marca en su registro de cada día. */
export default function Logros({ diario, vasos }: { diario: Diario; vasos: number }) {
  const r = logrosDe(diario, vasos);
  const rachas = [
    r.registro > 1 && `🔥 ${dias(r.registro)} seguidos registrando`,
    r.agua > 1 && `💧 ${dias(r.agua)} con toda tu agua`,
    r.comidas > 1 && `🍽️ ${dias(r.comidas)} con todas tus comidas`,
  ].filter(Boolean) as string[];
  const nuevo = r.logros.find((l) => l.nuevo);
  const hechos = r.logros.filter((l) => l.ok).length;
  return (
    <div className="card logros">
      {nuevo && <div className="nuevo">🎉 ¡Nuevo logro! <b>{nuevo.icono} {nuevo.texto}</b></div>}
      {rachas.length > 0 ? (
        <div className="rachas">{rachas.map((t) => <span key={t}>{t}</span>)}</div>
      ) : (
        <p className="note" style={{ margin: 0 }}>Llena tu registro hoy y mañana para empezar tu racha 🔥</p>
      )}
      <details>
        <summary>Tus logros <span className="note">{hechos} de {r.logros.length}</span></summary>
        <ul>
          {r.logros.map((l) => <li key={l.texto} className={l.ok ? "ok" : ""}><span aria-hidden="true">{l.ok ? l.icono : "🔒"}</span>{l.texto}</li>)}
        </ul>
      </details>
    </div>
  );
}
