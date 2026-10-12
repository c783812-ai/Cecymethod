"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { hoyISO } from "@/lib/diario";

type Serie = { p?: number; r?: number; h?: 1 }; // h: serie hecha
type Carga = { u: "kg" | "lb"; s: Serie[] };
type Cargas = Record<string, Record<string, Carga>>; // ejercicio -> fecha -> carga

/** "3 × 12" -> 3 series de "12"; "2 × 10 por lado" -> 2 series de "10 por lado". */
/** "3 × 12" -> 3 series de 12; "1 × 20, 1 × 15, 1 × 10" -> 3 series de 20, 15 y 10. Devuelve las reps de cada serie. */
export function series(txt: string): string[] {
  const partes = txt.split(",").map((p) => p.match(/^\s*(\d+)\s*[×x]\s*(.+?)\s*$/i));
  if (!partes.every(Boolean)) return [txt];
  const reps = partes.flatMap((m) => Array(Number(m![1])).fill(m![2].replace(/máximo de repeticiones/i, "al máximo")));
  return reps.slice(0, 8);
}

/** Pesos por ejercicio: en su teléfono y, si ya entró con su cuenta, en la página para no perderlos. */
export function useCargas(pid: string, remoto: boolean) {
  const key = `cargas-${pid}`;
  const [v, setV] = useState<Cargas>({});
  const [u, setU] = useState<"kg" | "lb">("kg");
  useEffect(() => {
    let l: Cargas = {};
    try { l = JSON.parse(localStorage.getItem(key) || "{}"); setU((localStorage.getItem("unidad") as "kg" | "lb") || "kg"); } catch {}
    setV(l);
    if (!remoto) return;
    supabaseBrowser().from("cargas").select("ejercicio, fecha, data").eq("patient_id", pid).then(({ data, error }) => {
      if (error || !data) return;
      const r: Cargas = JSON.parse(JSON.stringify(l));
      for (const x of data) (r[x.ejercicio as string] ??= {})[x.fecha as string] = x.data as Carga;
      setV(r);
      try { localStorage.setItem(key, JSON.stringify(r)); } catch {}
    });
  }, [key, pid, remoto]);
  const guardar = (ejercicio: string, fecha: string, c: Carga) =>
    setV((old) => {
      const n = { ...old, [ejercicio]: { ...old[ejercicio], [fecha]: c } };
      try { localStorage.setItem(key, JSON.stringify(n)); } catch {}
      if (remoto) supabaseBrowser().from("cargas").upsert({ patient_id: pid, ejercicio, fecha, data: c, updated_at: new Date().toISOString() }).then(() => {});
      return n;
    });
  const unidad = (x: "kg" | "lb") => { setU(x); try { localStorage.setItem("unidad", x); } catch {} };
  return { v, guardar, u, unidad };
}
export type CargasHook = ReturnType<typeof useCargas>;

const corta = (iso: string) => `${Number(iso.slice(8))}/${Number(iso.slice(5, 7))}`;
const num = (s: string) => { const n = parseFloat(s.replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : undefined; };

/** Las series del ejercicio con su peso y repeticiones de hoy, y lo que hizo la vez pasada. */
export function SeriesLog({ ejercicio, txt, descanso, cargas }: { ejercicio: string; txt: string; descanso: string; cargas: CargasHook }) {
  const hoy = hoyISO();
  const reps = series(txt);
  const n = reps.length;
  const mias = cargas.v[ejercicio] ?? {};
  const hoyC: Carga = mias[hoy] ?? { u: cargas.u, s: [] };
  const antes = Object.keys(mias).filter((f) => f < hoy && mias[f].s.some((x) => x.p != null)).sort().pop();
  const prev = antes ? mias[antes] : undefined;
  const set = (i: number, c: Serie) => {
    const s = Array.from({ length: n }, (_, k) => hoyC.s[k] ?? {});
    s[i] = { ...s[i], ...c };
    cargas.guardar(ejercicio, hoy, { u: cargas.u, s });
  };
  return (
    <div className="serieslog">
      {prev && <p className="prev">La vez pasada ({corta(antes!)}): <b>{prev.s.map((x) => (x.p != null ? `${x.p}` : "–")).join(" · ")} {prev.u}</b></p>}
      <div className="filas">
        <span className="h">Serie</span><span className="h">Reps</span><span className="h">Peso ({cargas.u})</span><span className="h">Lista</span>
        {Array.from({ length: n }, (_, i) => (
          <SerieFila key={`${hoy}-${i}`} i={i} reps={reps[i]} prevP={prev?.s[i]?.p} s={hoyC.s[i] ?? {}} onSet={(c) => set(i, c)}
            onLista={() => { const ya = hoyC.s[i]?.h; set(i, { h: ya ? undefined : 1 }); if (!ya && i < n - 1) iniciarDescanso(minimoSeg(descanso), `Serie ${i + 2} de ${ejercicio}`); }} />
        ))}
      </div>
    </div>
  );
}

function SerieFila({ i, reps, prevP, s, onSet, onLista }: { i: number; reps: string; prevP?: number; s: Serie; onSet: (c: Serie) => void; onLista: () => void }) {
  const [p, setP] = useState(s.p != null ? String(s.p) : "");
  const [r, setR] = useState(s.r != null ? String(s.r) : "");
  useEffect(() => { setP(s.p != null ? String(s.p) : ""); setR(s.r != null ? String(s.r) : ""); }, [s.p, s.r]);
  return (
    <>
      <span className="n">{i + 1}</span>
      <input inputMode="numeric" aria-label={`Repeticiones de la serie ${i + 1}`} placeholder={reps} value={r} onChange={(e) => setR(e.target.value)} onBlur={() => onSet({ r: num(r) })} />
      <input inputMode="decimal" aria-label={`Peso de la serie ${i + 1}`} placeholder={prevP != null ? String(prevP) : "0"} value={p} onChange={(e) => setP(e.target.value)} onBlur={() => onSet({ p: num(p) })} />
      <button type="button" className="lista" aria-pressed={!!s.h} aria-label={`Serie ${i + 1} lista`} onClick={onLista}>✓</button>
    </>
  );
}

/* ---------- Cronómetro de descanso: uno solo para toda la rutina ---------- */

/** "3–5 min" -> 180 (el descanso mínimo, en segundos). */
export function minimoSeg(descanso: string) {
  const m = descanso.match(/(\d+(?:[.,]\d+)?)\s*(?:[–-]\s*\d+(?:[.,]\d+)?\s*)?(min|s)/i);
  if (!m) return 120;
  const v = parseFloat(m[1].replace(",", "."));
  return Math.round(m[2].toLowerCase() === "s" ? v : v * 60);
}

type Reloj = { fin: number; total: number; label: string; listo?: boolean } | null;
let reloj: Reloj = null;
const subs = new Set<() => void>();
const avisar = () => subs.forEach((f) => f());
let audio: AudioContext | null = null;

export function iniciarDescanso(seg: number, label: string) {
  try { audio ??= new AudioContext(); audio.resume(); } catch {} // se prepara con el toque para poder sonar al final
  reloj = { fin: Date.now() + seg * 1000, total: seg, label };
  avisar();
}

function sonar() {
  try { navigator.vibrate?.([300, 150, 300, 150, 300]); } catch {}
  if (!audio) return;
  [0, 0.35, 0.7].forEach((t) => {
    const o = audio!.createOscillator(), g = audio!.createGain();
    o.frequency.value = 880; o.connect(g); g.connect(audio!.destination);
    const a = audio!.currentTime + t;
    g.gain.setValueAtTime(0.0001, a); g.gain.exponentialRampToValueAtTime(0.4, a + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, a + 0.25);
    o.start(a); o.stop(a + 0.3);
  });
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** La barra de abajo con la cuenta regresiva. Va una vez en la pestaña Rutina. */
export function Descanso() {
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick((x) => x + 1); subs.add(f); return () => { subs.delete(f); }; }, []);
  useEffect(() => {
    if (!reloj) return;
    const id = setInterval(() => {
      if (reloj && !reloj.listo && Date.now() >= reloj.fin) {
        reloj = { ...reloj, listo: true }; sonar();
        const r = reloj; setTimeout(() => { if (reloj === r) { reloj = null; avisar(); } }, 6000);
      }
      tick((x) => x + 1);
    }, 250);
    return () => clearInterval(id);
  });
  if (!reloj) return null;
  const falta = Math.max(0, Math.ceil((reloj.fin - Date.now()) / 1000));
  return (
    <div className={`descanso${reloj.listo ? " listo" : ""}`} role="timer" aria-live="polite">
      <div className="barra"><i style={{ width: `${100 - (falta / reloj.total) * 100}%` }} /></div>
      <div className="fila">
        <div style={{ minWidth: 0 }}>
          <div className="t">{reloj.listo ? "¡Listo! Ya puedes empezar" : "Descansa"}</div>
          <div className="l">{reloj.label}</div>
        </div>
        {!reloj.listo && <b className="cuenta">{mmss(falta)}</b>}
        {!reloj.listo && <button type="button" onClick={() => { reloj = reloj && { ...reloj, fin: reloj.fin + 30000, total: reloj.total + 30 }; avisar(); }}>+30 s</button>}
        <button type="button" onClick={() => { reloj = null; avisar(); }}>{reloj.listo ? "Cerrar" : "Saltar"}</button>
      </div>
    </div>
  );
}
