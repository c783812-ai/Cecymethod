"use client";
import { useState } from "react";
import { MONEDAS, PRESETS, type Moneda } from "@/lib/pagos";

/** Formulario para un paquete nuevo: al elegir paquete y moneda se llena el precio de tu página. */
export default function NuevoPaquete({ action }: { action: (f: FormData) => void }) {
  const [preset, setPreset] = useState(0);
  const [moneda, setMoneda] = useState<Moneda>("EUR");
  const p = PRESETS[preset];
  const [nombre, setNombre] = useState(p.nombre);
  const [total, setTotal] = useState(String(p.precio.EUR));
  const elegir = (i: number, m: Moneda) => {
    setPreset(i); setMoneda(m);
    if (i < PRESETS.length) { setNombre(PRESETS[i].nombre); setTotal(String(PRESETS[i].precio[m])); }
  };
  const hoy = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="pagoform">
      <label className="field">Paquete
        <select value={preset} onChange={(e) => elegir(Number(e.target.value), moneda)}>
          {PRESETS.map((x, i) => <option key={x.nombre} value={i}>{x.nombre}</option>)}
          <option value={PRESETS.length}>Otro (mensualidad, precio especial…)</option>
        </select>
      </label>
      <label className="field">Moneda
        <select name="moneda" value={moneda} onChange={(e) => elegir(preset, e.target.value as Moneda)}>
          {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </label>
      <label className="field">Nombre<input name="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>
      <label className="field">Total a pagar<input name="total" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} required /></label>
      <label className="field">Desde<input type="date" name="inicio" defaultValue={hoy} /></label>
      <label className="field">Nota (opcional)<input name="nota" placeholder="Ej. paga en 3 meses" /></label>
      <div><button className="btn primary">Agregar paquete</button></div>
    </form>
  );
}
