"use client";
import { useEffect, useState } from "react";
import { ANIMOS, BANO_SUGERIDO, CICLO, ESTRES, HECES, META, SUENO, hoyISO, type Diario, type Meta, type Registro } from "@/lib/diario";

// Por ahora el diario vive en el teléfono de la paciente.
export function useDiario(pid: string) {
  const key = `diario-${pid}`;
  const [v, setV] = useState<Diario>({});
  useEffect(() => { try { setV(JSON.parse(localStorage.getItem(key) || "{}")); } catch {} }, [key]);
  const set = (fecha: string, cambio: Partial<Registro>) =>
    setV((old) => {
      const n = { ...old, [fecha]: { ...old[fecha], ...cambio } };
      try { localStorage.setItem(key, JSON.stringify(n)); } catch {}
      return n;
    });
  return [v, set] as const;
}
export type DiarioHook = ReturnType<typeof useDiario>;

/** Barrita de la meta del día: se llena conforme marca sus comidas como listas. */
export function MetaBar({ meta, aportes, listas }: { meta: Meta; aportes: number[]; listas: number[] }) {
  const total = aportes.reduce((a, b) => a + b, 0);
  if (!total) return null;
  const hecho = listas.reduce((s, i) => s + (aportes[i] ?? 0), 0);
  const pct = Math.min(100, Math.round((hecho / total) * 100));
  return (
    <div className="card metabar">
      <div className="mb-top">
        <span className="eyebrow">Tu meta de hoy</span>
        <b className="num">{pct}%</b>
      </div>
      <div className="mb-label">{meta === "comidas" ? META.comidas : `${META[meta]} del día`}{meta !== "comidas" && <span className="note"> · {Math.round(hecho)} de {Math.round(total)} g</span>}</div>
      <div className="mb-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de tu meta">
        <div style={{ width: `${pct}%` }} />
      </div>
      <p className="note" style={{ margin: "6px 0 0" }}>{pct === 100 ? "¡Lo lograste hoy! 🎉" : "Marca cada comida como lista y la barrita avanza."}</p>
    </div>
  );
}

function Chips<T extends string | number>({ ops, value, onPick, label }: { ops: [T, string][]; value?: T; onPick: (v: T | undefined) => void; label: string }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {ops.map(([v, t]) => <button key={String(v)} aria-pressed={value === v} onClick={() => onPick(value === v ? undefined : v)}>{t}</button>)}
    </div>
  );
}

/** Registro de hoy: agua, baño, ánimo, sueño, estrés, ciclo y medicamentos. */
export function RegistroHoy({ diario, vasos }: { diario: DiarioHook; vasos: number }) {
  const fecha = hoyISO();
  const r = diario[0][fecha] ?? {};
  const set = (c: Partial<Registro>) => diario[1](fecha, c);
  const agua = r.agua ?? 0;
  const bano = r.bano ?? 0;
  const [otro, setOtro] = useState(r.meds && r.meds !== "" ? true : false);
  useEffect(() => { setOtro(!!r.meds); }, [r.meds]);
  return (
    <div className="card registro">
      <div className="eyebrow">Mi registro de hoy</div>

      <h5>💧 Agua <span className="note">{agua} de {vasos} vasos de 250 ml</span></h5>
      <div className="vasos">
        {Array.from({ length: Math.max(vasos, agua) }, (_, i) => (
          <button key={i} aria-pressed={i < agua} aria-label={`Vaso ${i + 1}`} onClick={() => set({ agua: i < agua ? i : i + 1 })}>{i < agua ? "🥛" : "○"}</button>
        ))}
        <button className="mas" aria-label="Un vaso más" onClick={() => set({ agua: agua + 1 })}>+</button>
      </div>

      <h5>🚽 Baño <span className="note">lo sugerido son hasta {BANO_SUGERIDO} veces al día</span></h5>
      <div className="stepper">
        <button aria-label="Una vez menos" onClick={() => set({ bano: Math.max(0, bano - 1) })} disabled={!bano}>−</button>
        <b className="num">{bano}</b><span className="note">{bano === 1 ? "vez" : "veces"}</span>
        <button aria-label="Una vez más" onClick={() => set({ bano: bano + 1 })}>+</button>
      </div>
      <Chips label="Cómo estuvo" ops={HECES} value={r.heces} onPick={(v) => set({ heces: v })} />

      <h5>💭 Hoy me sentí</h5>
      <div className="caritas" role="group" aria-label="Hoy me sentí">
        {ANIMOS.map(([e, t]) => (
          <button key={e} aria-pressed={r.animo === e} onClick={() => set({ animo: r.animo === e ? undefined : e })}><span>{e}</span><small>{t}</small></button>
        ))}
      </div>

      <h5>😴 Anoche dormí</h5>
      <Chips label="Horas de sueño" ops={SUENO} value={r.sueno} onPick={(v) => set({ sueno: v })} />

      <h5>🌡️ Estrés</h5>
      <Chips label="Nivel de estrés" ops={ESTRES.map((t, i) => [i + 1, t] as [number, string])} value={r.estres} onPick={(v) => set({ estres: v })} />

      <h5>🌸 Mi ciclo</h5>
      <Chips label="Ciclo menstrual" ops={CICLO} value={r.ciclo} onPick={(v) => set({ ciclo: v })} />

      <h5>💊 Suplementos o medicamentos nuevos</h5>
      <div className="chips" role="group" aria-label="Suplementos o medicamentos nuevos">
        <button aria-pressed={r.meds === ""} onClick={() => { setOtro(false); set({ meds: r.meds === "" ? undefined : "" }); }}>Ninguno</button>
        <button aria-pressed={otro} onClick={() => { setOtro(true); if (!r.meds) set({ meds: undefined }); }}>Empecé algo nuevo</button>
      </div>
      {otro && (
        <input className="medtxt" placeholder="¿Qué empezaste a tomar y por qué?" defaultValue={r.meds ?? ""} maxLength={200}
          onBlur={(e) => set({ meds: e.target.value.trim() || undefined })} />
      )}
      <p className="note" style={{ margin: "10px 0 0" }}>Se guarda solo en tu teléfono.</p>
    </div>
  );
}
