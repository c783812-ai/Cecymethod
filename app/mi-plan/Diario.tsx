"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ANIMOS, BANO_SUGERIDO, CICLO, ESTRES, HECES, META, SUENO, ACTIVIDADES, MINUTOS, ALCOHOL, BEBIDAS, FUERA, hoyISO, type Diario, type Meta, type Registro } from "@/lib/diario";

/**
 * El diario de la paciente. Sin consentimiento se guarda solo en su teléfono;
 * con consentimiento se guarda en la página para que Cecy vea su semana.
 */
export function useDiario(pid: string, remoto: boolean, consentidoInicial: boolean) {
  const key = `diario-${pid}`;
  const [v, setV] = useState<Diario>({});
  const [consentido, setConsentido] = useState(remoto && consentidoInicial);
  const local = () => { try { return JSON.parse(localStorage.getItem(key) || "{}") as Diario; } catch { return {}; } };
  const guardarLocal = (d: Diario) => { try { localStorage.setItem(key, JSON.stringify(d)); } catch {} };

  useEffect(() => {
    const l = local();
    setV(l);
    if (!consentido) return;
    const desde = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
    supabaseBrowser().from("diario").select("fecha, data").eq("patient_id", pid).gte("fecha", desde).then(({ data, error }) => {
      if (error || !data) return;
      const remotoD = Object.fromEntries(data.map((r) => [r.fecha as string, r.data as Registro]));
      setV({ ...l, ...remotoD });
      guardarLocal({ ...l, ...remotoD });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, consentido]);

  const subir = (filas: [string, Registro][]) =>
    supabaseBrowser().from("diario").upsert(filas.map(([fecha, data]) => ({ patient_id: pid, fecha, data, updated_at: new Date().toISOString() })));

  const set = (fecha: string, cambio: Partial<Registro>) =>
    setV((old) => {
      const reg = { ...old[fecha], ...cambio };
      const n = { ...old, [fecha]: reg };
      guardarLocal(n);
      if (consentido) subir([[fecha, reg]]);
      return n;
    });

  const consentir = async () => {
    const sb = supabaseBrowser();
    const { error } = await sb.rpc("consentir_diario");
    if (error) return false;
    setConsentido(true);
    const filas = Object.entries(local());
    if (filas.length) await subir(filas);
    return true;
  };
  const retirar = async () => {
    const { error } = await supabaseBrowser().rpc("retirar_diario");
    if (!error) setConsentido(false);
  };
  return [v, set, { remoto, consentido, consentir, retirar }] as const;
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

      <h5>🏃‍♀️ Mi actividad de hoy</h5>
      <div className="chips" role="group" aria-label="Qué hiciste hoy">
        {ACTIVIDADES.map(([v, t]) => {
          const on = !!r.act?.includes(v);
          const sig = v === "descanso" ? (on ? [] : ["descanso"]) : on ? r.act!.filter((x) => x !== v) : [...(r.act ?? []).filter((x) => x !== "descanso"), v];
          return <button key={v} aria-pressed={on} onClick={() => set({ act: sig.length ? sig : undefined, ...(v === "descanso" && !on ? { min: undefined, kcal: undefined } : {}) })}>{t}</button>;
        })}
      </div>
      {!!r.act?.length && !r.act.includes("descanso") && (
        <>
          <p className="note" style={{ margin: "8px 0 4px" }}>¿Cuánto tiempo en total?</p>
          <Chips label="Minutos de ejercicio" ops={MINUTOS} value={r.min} onPick={(v) => set({ min: v })} />
          <label className="note" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            Calorías activas de tu reloj (si tienes)
            <input className="medtxt" inputMode="numeric" style={{ width: 90, flex: "none" }} placeholder="kcal" defaultValue={r.kcal ?? ""} key={`kcal-${fecha}-${r.kcal ?? ""}`}
              onBlur={(e) => { const n = parseInt(e.target.value, 10); set({ kcal: Number.isFinite(n) && n > 0 && n < 5000 ? n : undefined }); }} />
          </label>
        </>
      )}
      <label className="note" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        👟 Pasos de hoy (los marca tu cel o reloj)
        <input className="medtxt" inputMode="numeric" style={{ width: 90, flex: "none" }} placeholder="pasos" defaultValue={r.pasos ?? ""} key={`pasos-${fecha}-${r.pasos ?? ""}`}
          onBlur={(e) => { const n = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10); set({ pasos: Number.isFinite(n) && n > 0 && n < 100000 ? n : undefined }); }} />
      </label>

      <h5>🍕 ¿Comiste algo fuera de tu plan?</h5>
      <Chips label="Comida fuera del plan" ops={FUERA} value={r.fuera} onPick={(v) => set({ fuera: v, ...(v === "no" || !v ? { fueraQue: undefined } : {}) })} />
      {!!r.fuera && r.fuera !== "no" && (
        <input className="medtxt" placeholder="¿Qué comiste? (si quieres contarle a Cecy)" defaultValue={r.fueraQue ?? ""} maxLength={150} key={`fq-${fecha}`}
          onBlur={(e) => set({ fueraQue: e.target.value.trim() || undefined })} />
      )}

      <h5>🍷 ¿Tomaste alcohol?</h5>
      <Chips label="Alcohol" ops={ALCOHOL} value={r.alcohol} onPick={(v) => set({ alcohol: v, ...(v === "no" || !v ? { bebida: undefined } : {}) })} />
      {!!r.alcohol && r.alcohol !== "no" && (
        <>
          <p className="note" style={{ margin: "8px 0 4px" }}>¿Qué tomaste?</p>
          <div className="chips" role="group" aria-label="Qué tomaste">
            {BEBIDAS.map(([v, t]) => {
              const on = !!r.bebida?.includes(v);
              const sig = on ? r.bebida!.filter((x) => x !== v) : [...(r.bebida ?? []), v];
              return <button key={v} aria-pressed={on} onClick={() => set({ bebida: sig.length ? sig : undefined })}>{t}</button>;
            })}
          </div>
        </>
      )}

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
      <Compartir diario={diario} />
    </div>
  );
}

/** Consentimiento para que Cecy vea el registro. */
function Compartir({ diario }: { diario: DiarioHook }) {
  const { remoto, consentido, consentir, retirar } = diario[2];
  const [acepto, setAcepto] = useState(false);
  const [estado, setEstado] = useState<"" | "enviando" | "error">("");
  if (!remoto) return <p className="note" style={{ margin: "10px 0 0" }}>Se guarda solo en tu teléfono.</p>;
  if (consentido)
    return (
      <p className="note" style={{ margin: "12px 0 0" }}>
        ✓ Cecy ve tu registro para revisar tu semana.{" "}
        <button className="linklike" onClick={() => { if (confirm("Se borrará tu registro de la página y Cecy ya no lo verá. ¿Seguro?")) retirar(); }}>Dejar de compartir y borrarlo</button>
      </p>
    );
  return (
    <div className="compartir">
      <b>¿Compartes tu registro con Cecy?</b>
      <p className="note" style={{ margin: "4px 0 8px" }}>Así lo revisa cada domingo y te escribe cómo vas. Son datos de salud: solo tú y ella los ven, y se borran cuando terminas tu seguimiento o cuando tú lo pidas. Por ahora se guarda solo en tu teléfono.</p>
      <label className="check"><input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} /> Acepto que Cecy vea mi registro diario</label>
      <button className="btn primary" disabled={!acepto || estado === "enviando"} style={{ marginTop: 8 }}
        onClick={async () => { setEstado("enviando"); setEstado((await consentir()) ? "" : "error"); }}>
        {estado === "enviando" ? "Guardando…" : "Compartir con Cecy"}
      </button>
      {estado === "error" && <p className="note" style={{ color: "var(--warn)" }}>No se pudo guardar. Inténtalo más tarde.</p>}
    </div>
  );
}
