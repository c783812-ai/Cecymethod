"use client";
import { useEffect, useState } from "react";
import type { Diario } from "@/lib/diario";
import { hoyISO } from "@/lib/diario";
import { faseDe } from "@/lib/fases";
import { useAjustes } from "@/lib/paciente";
import { useCuenta, useGuardadoCuenta } from "./guardado";

const dias = (a: string, b: string) => Math.round((new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime()) / 86_400_000);

/** Inicios de regla que marcó en su registro (primer día con "Estoy en mi regla" después de un día sin regla). */
function iniciosDelDiario(d: Diario) {
  const regla = (f: string) => d[f]?.ciclo === "regla";
  const antes = (f: string) => { const x = new Date(`${f}T12:00:00`); x.setDate(x.getDate() - 1); return hoyISO(x); };
  return Object.keys(d).sort().filter((f) => regla(f) && !regla(antes(f)));
}

/** Su ciclo: en qué fase está y tips para esos días. Usa la fecha que ella pone y lo que marca en su registro. */
export default function Ciclo({ diario }: { diario: Diario }) {
  const { genero } = useAjustes();
  const { pid } = useCuenta();
  const [c, cambiar] = useGuardadoCuenta<{ inicio?: string; largo?: number; oculto?: boolean }>(`ciclo-${pid}`);
  const [hoy, setHoy] = useState<string | null>(null);
  useEffect(() => setHoy(hoyISO()), []);
  if (genero === "m" || !hoy || c.oculto) return null;
  const ult = Object.keys(diario).sort().reverse().find((f) => diario[f]?.ciclo);
  if (ult && diario[ult].ciclo === "na") return null;

  const inicios = [...new Set([...iniciosDelDiario(diario), ...(c.inicio ? [c.inicio] : [])])].filter((f) => f <= hoy).sort();
  const gaps = inicios.slice(1).map((f, i) => dias(inicios[i], f)).filter((g) => g >= 21 && g <= 40);
  const largo = c.largo ?? (gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 28);
  const inicio = inicios.at(-1);
  let dia = inicio ? dias(inicio, hoy) + 1 : null;
  if (dia !== null && dia > largo) dia = ((dia - 1) % largo) + 1; // si no ha marcado la nueva, se estima
  const f = dia ? faseDe(dia, largo) : null;

  return (
    <details className="card antojos ciclo" open={!inicio}>
      <summary>
        <span className="eyebrow">Tu ciclo</span>
        <b>{f ? <>{f.ic} Día {dia} · Fase {f.n.toLowerCase()}</> : "🌸 ¿Cuándo empezó tu última regla?"}</b>
      </summary>
      {f ? (
        <>
          <p className="note" style={{ margin: "6px 0" }}>{f.que}</p>
          <ul className="fuera-l">{f.tips.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="note" style={{ margin: "10px 0 0" }}>Es un cálculo aproximado con un ciclo de {largo} días. Cuando te baje, márcalo en Registro (Estoy en mi regla) y se ajusta solo.</p>
        </>
      ) : (
        <p className="note" style={{ margin: "6px 0" }}>Con esa fecha te digo en qué fase estás y qué te ayuda a comer y entrenar mejor esos días.</p>
      )}
      <div className="ciclo-form">
        <label className="field">Primer día de tu última regla
          <input type="date" max={hoy} value={c.inicio ?? ""} onChange={(e) => cambiar((o) => ({ ...o, inicio: e.target.value || undefined }))} />
        </label>
        <label className="field">Tu ciclo dura (días)
          <input type="number" min={21} max={40} inputMode="numeric" placeholder={String(largo)} value={c.largo ?? ""} onChange={(e) => { const n = Number(e.target.value); cambiar((o) => ({ ...o, largo: n >= 21 && n <= 40 ? n : undefined })); }} />
        </label>
      </div>
      <button className="linklike" style={{ fontSize: 13, marginTop: 6 }} onClick={() => cambiar((o) => ({ ...o, oculto: true }))}>No me aplica, quitar</button>
    </details>
  );
}
